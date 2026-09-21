import { GraphQLError } from "graphql"
import { Context } from "../index"
import MenuItem from "../../models/MenuItem"
import Category from "../../models/Category"
import { isAdmin, isAuthenticated } from "./user.resolver"

// ─── Interfaces ───────────────────────────────────────────

interface CreateMenuItemInput {
  name: string
  description?: string
  price: number
  image?: string
  category: string
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  preparationTime?: number
}

interface UpdateMenuItemInput {
  name?: string
  description?: string
  price?: number
  image?: string
  category?: string
  isAvailable?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  preparationTime?: number
}

interface MenuItemFilters {
  category?: string
  isAvailable?: boolean
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
}

// ─── Resolvers ────────────────────────────────────────────

const menuItemResolvers = {

  Query: {

    // public — anyone can browse the menu
    getMenuItems: async (
      _: unknown,
      args: { filters?: MenuItemFilters }
    ) => {
      // build filter object dynamically
      // only add fields that were actually passed
      const filter: Record<string, unknown> = {}

      if (args.filters?.category) {
        filter.category = args.filters.category
      }
      if (args.filters?.isAvailable !== undefined) {
        filter.isAvailable = args.filters.isAvailable
      }
      if (args.filters?.isVegetarian !== undefined) {
        filter.isVegetarian = args.filters.isVegetarian
      }
      if (args.filters?.isVegan !== undefined) {
        filter.isVegan = args.filters.isVegan
      }
      if (args.filters?.isGlutenFree !== undefined) {
        filter.isGlutenFree = args.filters.isGlutenFree
      }

      const menuItems = await MenuItem
        .find(filter)
        .populate("category")
        .sort({ createdAt: -1 })

      return menuItems
    },

    // public — anyone can view a single menu item
    getMenuItem: async (
      _: unknown,
      args: { id: string }
    ) => {
      const menuItem = await MenuItem
        .findById(args.id)
        .populate("category")

      if (!menuItem) {
        throw new GraphQLError("Menu item not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return menuItem
    },

  },

  Mutation: {

    // admin only — only admin can create menu items
    createMenuItem: async (
      _: unknown,
      args: { input: CreateMenuItemInput },
      context: Context
    ) => {
      isAdmin(context)

      const { name, description, price, image, category, isVegetarian, isVegan, isGlutenFree, preparationTime } = args.input

      // check category exists before creating item
      const categoryExists = await Category.findById(category)

      if (!categoryExists) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      // check duplicate name
      const existing = await MenuItem.findOne({ name })

      if (existing) {
        throw new GraphQLError("Menu item already exists", {
          extensions: { code: "BAD_USER_INPUT" }
        })
      }

      const menuItem = new MenuItem({
        name,
        description,
        price,
        image,
        category,
        isVegetarian,
        isVegan,
        isGlutenFree,
        preparationTime,
      })

      await menuItem.save()

      // populate category before returning
      await menuItem.populate("category")

      return menuItem
    },

    // admin only — only admin can update menu items
    updateMenuItem: async (
      _: unknown,
      args: { id: string; input: UpdateMenuItemInput },
      context: Context
    ) => {
      isAdmin(context)

      // if category is being updated check it exists
      if (args.input.category) {
        const categoryExists = await Category.findById(args.input.category)

        if (!categoryExists) {
          throw new GraphQLError("Category not found", {
            extensions: { code: "NOT_FOUND" }
          })
        }
      }

      const menuItem = await MenuItem
        .findByIdAndUpdate(
          args.id,
          { ...args.input },
          { new: true, runValidators: true }
        )
        .populate("category")

      if (!menuItem) {
        throw new GraphQLError("Menu item not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return menuItem
    },

    // admin only — only admin can delete menu items
    deleteMenuItem: async (
      _: unknown,
      args: { id: string },
      context: Context
    ) => {
      isAdmin(context)

      const menuItem = await MenuItem.findByIdAndDelete(args.id)

      if (!menuItem) {
        throw new GraphQLError("Menu item not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return true
    },

  },

  // ─── Field Resolver ─────────────────────────────────────

  MenuItem: {
    category: async (parent: { category: string }) => {
      return await Category.findById(parent.category)
    }
  }

}

export default menuItemResolvers