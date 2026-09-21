import { GraphQLError } from "graphql"
import { Context } from "../index"
import Order from "../../models/Order"
import MenuItem from "../../models/MenuItem"
import { isAdmin, isAuthenticated } from "./user.resolver"

// ─── Interfaces ───────────────────────────────────────────

interface OrderItemInput {
  menuItem: string
  quantity: number
  specialRequests?: string
}

interface CreateOrderInput {
  items: OrderItemInput[]
  paymentMethod: "card" | "applePay" | "payAtShop"
  specialInstructions?: string
}

interface OrderFilters {
  status?: string
  paymentStatus?: string
  paymentMethod?: string
}

// ─── Helpers ──────────────────────────────────────────────

// generates a short token customers show at the counter
const generatePayAtShopToken = (): string => {
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `PSH-${digits}`
}

// ─── Resolvers ────────────────────────────────────────────

const orderResolver = {

  Query: {

    // admin only — every order in the system
    getOrders: async (
      _: unknown,
      args: { filters?: OrderFilters },
      context: Context
    ) => {
      isAdmin(context)

      const filter: Record<string, unknown> = {}

      if (args.filters?.status) {
        filter.status = args.filters.status
      }
      if (args.filters?.paymentStatus) {
        filter.paymentStatus = args.filters.paymentStatus
      }
      if (args.filters?.paymentMethod) {
        filter.paymentMethod = args.filters.paymentMethod
      }

      const orders = await Order
        .find(filter)
        .populate("customer", "name email phone")
        .populate("items.menuItem")
        .sort({ createdAt: -1 })

      return orders
    },

    // logged in customer — only their own orders
    getMyOrders: async (
      _: unknown,
      __: unknown,
      context: Context
    ) => {
      const currentUser = isAuthenticated(context)

      const orders = await Order
        .find({ customer: currentUser.id })
        .populate("items.menuItem")
        .sort({ createdAt: -1 })

      return orders
    },

    // admin sees any order, customer sees only their own
    getOrder: async (
      _: unknown,
      args: { id: string },
      context: Context
    ) => {
      const currentUser = isAuthenticated(context)

      const order = await Order
        .findById(args.id)
        .populate("customer", "name email phone")
        .populate("items.menuItem")

      if (!order) {
        throw new GraphQLError("Order not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      if (
        currentUser.role !== "admin" &&
        order.customer._id.toString() !== currentUser.id
      ) {
        throw new GraphQLError("You do not have permission", {
          extensions: { code: "FORBIDDEN" }
        })
      }

      return order
    },

  },

  Mutation: {

    // logged in customer places an order
    createOrder: async (
      _: unknown,
      args: { input: CreateOrderInput },
      context: Context
    ) => {
      const currentUser = isAuthenticated(context)

      const { items, paymentMethod, specialInstructions } = args.input

      if (!items || items.length === 0) {
        throw new GraphQLError("Order must contain at least one item", {
          extensions: { code: "BAD_USER_INPUT" }
        })
      }

      // fetch every referenced menu item in one query
      const menuItemIds = items.map((item) => item.menuItem)
      const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } })

      // build the order items with server-side prices
        const orderItems = items.map((item) => {
          const menuItem = menuItems.find(
            (m) => m._id.toString() === item.menuItem
          )
          if (!menuItem) {
            throw new GraphQLError(`Menu item ${item.menuItem} not found`, {
              extensions: { code: "NOT_FOUND" }
            })
          }
          if (!menuItem.isAvailable) {
            throw new GraphQLError(`${menuItem.name} is currently unavailable`, {
              extensions: { code: "BAD_USER_INPUT" }
            })
          }
          if (item.quantity < 1) {
            throw new GraphQLError("Quantity must be at least 1", {
              extensions: { code: "BAD_USER_INPUT" }
            })
          }
          return {
            menuItem: menuItem._id,
            quantity: item.quantity,
            price: menuItem.price,
            specialRequests: item.specialRequests,
          }
        })

      // total is calculated server side, never trusted from the client
      const totalAmount = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      )

      const order = new Order({
        customer: currentUser.id,
        items: orderItems,
        totalAmount: Math.round(totalAmount * 100) / 100,
        paymentMethod,
        specialInstructions,
        payAtShopToken:
          paymentMethod === "payAtShop" ? generatePayAtShopToken() : undefined,
      })

      await order.save()

      await order.populate("customer", "name email phone")
      await order.populate("items.menuItem")

      return order
    },

    // admin only — move an order through the kitchen workflow
    updateOrderStatus: async (
      _: unknown,
      args: { id: string; status: string },
      context: Context
    ) => {
      isAdmin(context)

      const order = await Order
        .findByIdAndUpdate(
          args.id,
          { status: args.status },
          { new: true, runValidators: true }
        )
        .populate("customer", "name email phone")
        .populate("items.menuItem")

      if (!order) {
        throw new GraphQLError("Order not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return order
    },

    // admin only — staff marks a pay-at-shop order as paid at the counter
    markOrderAsPaid: async (
      _: unknown,
      args: { id: string },
      context: Context
    ) => {
      isAdmin(context)

      const order = await Order.findById(args.id)

      if (!order) {
        throw new GraphQLError("Order not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      if (order.paymentStatus === "paid") {
        throw new GraphQLError("Order is already paid", {
          extensions: { code: "BAD_USER_INPUT" }
        })
      }

      order.paymentStatus = "paid"
      await order.save()

      await order.populate("customer", "name email phone")
      await order.populate("items.menuItem")

      return order
    },

    // customer cancels their own order, admin can cancel any
    cancelOrder: async (
      _: unknown,
      args: { id: string },
      context: Context
    ) => {
      const currentUser = isAuthenticated(context)

      const order = await Order.findById(args.id)

      if (!order) {
        throw new GraphQLError("Order not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      if (
        currentUser.role !== "admin" &&
        order.customer.toString() !== currentUser.id
      ) {
        throw new GraphQLError("You do not have permission", {
          extensions: { code: "FORBIDDEN" }
        })
      }

      // once the kitchen has started, cancelling is no longer allowed
      if (!["pending", "confirmed"].includes(order.status)) {
        throw new GraphQLError(
          "Order can no longer be cancelled",
          { extensions: { code: "BAD_USER_INPUT" } }
        )
      }

      order.status = "cancelled"
      await order.save()

      await order.populate("customer", "name email phone")
      await order.populate("items.menuItem")

      return order
    },

  },

}

export default orderResolver