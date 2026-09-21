import { Context } from "../index"
import Category from "../../models/Category"
import { isAdmin } from "./user.resolver"
import { GraphQLError } from "graphql"


interface CategoryInput{
    name: string
    description: string
    image?: string
}

interface UpdateCategory {
    name?: string
    description?: string
    image?: string
    isActive?: boolean
}

const categoryResolver = {
    Query:{
        getCategory: async  (_:unknown,args: {id: string})=>{
            
            const category = await Category.findById(args.id)

            if(!category){
                throw new GraphQLError("Category not found", {
                          extensions: { code: "NOT_FOUND" }
                        })
            }
            return category

        }
        ,
        getCategories: async ()=>{

            const categories = await Category.find().sort({ createdAt: -1 })

            return categories
        }
    },
    Mutation:{
        createCategory: async(_:unknown,args:{input:CategoryInput},context:Context)=>{
            isAdmin(context)
            const {name , description, image} = args.input
            const existing = await Category.findOne({ name })
            if (existing) {
                throw new GraphQLError("Category already exists", {
                extensions: { code: "BAD_USER_INPUT" }
                })
            }
            const category = new Category({
                name,
                description,
                image
            })
            await category.save()
            return category
        },
        updateCategory: async (
      _: unknown,
      args: { id: string; input: UpdateCategory },
      context: Context
    ) => {
      isAdmin(context)

      const category = await Category.findByIdAndUpdate(
        args.id,
        { ...args.input },
        { new: true, runValidators: true }
      )

      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return category
    },

    deleteCategory: async (
      _: unknown,
      args: { id: string },
      context: Context
    ) => {
      isAdmin(context)

      const category = await Category.findByIdAndDelete(args.id)

      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }
      return true
    },
    }
}

export default categoryResolver