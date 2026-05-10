import mongoose, {Document,Schema} from "mongoose";

export interface ICategory extends Document{
    name: string
    description: string
    image?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const categorySchema = new Schema<ICategory>(
    {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Category = mongoose.model<ICategory>("Category",categorySchema)

export default Category;