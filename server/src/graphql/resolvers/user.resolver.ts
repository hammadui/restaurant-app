import { GraphQLError } from "graphql"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../../models/User"
import { Context } from "../index"

interface RegisterInput {
  name: string
  email: string
  password: string
  phone?: string
}

interface LoginInput {
  email: string
  password: string
}

interface UpdateProfileInput {
  name?: string
  phone?: string
}



const generateToken = (id: string, role: string): string => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  )
}

const isAuthenticated = (context: Context) => {
  if (!context.user) {
    throw new GraphQLError("You must be logged in", {
      extensions: { code: "UNAUTHENTICATED" }
    })
  }
  return context.user
}

const isAdmin = (context: Context) => {
  const user = isAuthenticated(context)
  if (user.role !== "admin") {
    throw new GraphQLError("You do not have permission", {
      extensions: { code: "FORBIDDEN" }
    })
  }
  return user
}

const userResolvers = {

  Query: {

    // get the currently logged in user
    me: async (_: unknown, __: unknown, context: Context) => {
      const currentUser = isAuthenticated(context)

      const user = await User.findById(currentUser.id)

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return user
    },

    getUser: async (
      _: unknown,
      args: { id: string },
      context: Context
    ) => {
      isAdmin(context)

      const user = await User.findById(args.id)

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }
      return user
    },

    getAllUsers: async (_: unknown, __: unknown, context: Context) => {
      isAdmin(context)

      const users = await User.find().sort({ createdAt: -1 })

      return users
    },

  },

  Mutation: {

    register: async (
      _: unknown,
      args: { input: RegisterInput }
    ) => {
      const { name, email, password, phone } = args.input

      // check if email already exists
      const existingUser = await User.findOne({ email })

      if (existingUser) {
        throw new GraphQLError("Email already registered", {
          extensions: { code: "BAD_USER_INPUT" }
        })
      }

      const hashedPassword = await bcrypt.hash(password, 12)

      const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
      })

      await user.save()

      const token = generateToken(
        user._id.toString(),
        user.role
      )

      return { token, user }
    },

    login: async (
      _: unknown,
      args: { input: LoginInput }
    ) => {
      const { email, password } = args.input

      // find user by email
      const user = await User.findOne({ email })

      if (!user) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "BAD_USER_INPUT" }
        })
      }

      const isMatch = await bcrypt.compare(password, user.password)

      if (!isMatch) {
        throw new GraphQLError("Invalid email or password", {
          extensions: { code: "BAD_USER_INPUT" }
        })
      }

      const token = generateToken(
        user._id.toString(),
        user.role
      )

      return { token, user }
    },

    updateProfile: async (
      _: unknown,
      args: { input: UpdateProfileInput },
      context: Context
    ) => {
      const currentUser = isAuthenticated(context)

      const user = await User.findByIdAndUpdate(
        currentUser.id,
        { ...args.input },
        { new: true, runValidators: true }
      )

      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }

      return user
    },

    deleteUser: async(_:unknown,args:{id:string},context:Context)=>{
        isAdmin(context)

        const user = await User.findByIdAndDelete(args.id)

        if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" }
        })
      }
       return true
    }
  },
}
export default userResolvers