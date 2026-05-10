import mongoose, { Document, Schema } from "mongoose"
import { ICategory } from "./Category"

export interface IMenuItem extends Document {
  name: string
  description?: string
  price: number
  image?: string
  category: ICategory["_id"]
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  preparationTime?: number
  createdAt: Date
  updatedAt: Date
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, "Menu item name is required"],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    image: {
      type: String,
      trim: true,
    },

    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isVegetarian: {
      type: Boolean,
      default: false,
    },

    isVegan: {
      type: Boolean,
      default: false,
    },

    isGlutenFree: {
      type: Boolean,
      default: false,
    },

    preparationTime: {
      type: Number,
      min: [0, "Preparation time cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
)

menuItemSchema.index({ category: 1 })

export default mongoose.model<IMenuItem>("MenuItem", menuItemSchema)