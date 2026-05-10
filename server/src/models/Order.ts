import mongoose, { Document, Schema } from "mongoose"
import { IUser } from "./User"
import { IOrderItem } from "./OrderItem"

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled"

export type PaymentMethod = "card" | "applePay" | "payAtShop"

export type PaymentStatus = "unpaid" | "paid"

export interface IOrder extends Document {
  customer: IUser["_id"]
  items: IOrderItem[]
  totalAmount: number
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  stripePaymentIntentId?: string
  payAtShopToken?: string
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<IOrder>(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    items: [
      {
        menuItem: {
          type: Schema.Types.ObjectId,
          ref: "MenuItem",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        specialRequests: {
          type: String,
          trim: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "preparing", "ready", "completed", "cancelled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["card", "applePay", "payAtShop"],
      required: [true, "Payment method is required"],
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    stripePaymentIntentId: {
      type: String,
      trim: true,
    },

    payAtShopToken: {
      type: String,
      trim: true,
    },

    specialInstructions: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

orderSchema.index({ status: 1 })
orderSchema.index({ customer: 1 })

export default mongoose.model<IOrder>("Order", orderSchema)