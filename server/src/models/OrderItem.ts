import mongoose, { Document, Schema } from "mongoose"
import { IMenuItem } from "./MenuItem"

export interface IOrderItem extends Document {
  menuItem: IMenuItem["_id"]
  quantity: number
  price: number
  specialRequests?: string
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: [true, "Menu item is required"],
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    specialRequests: {
      type: String,
      trim: true,
    },
  }
)

export default mongoose.model<IOrderItem>("OrderItem", orderItemSchema)