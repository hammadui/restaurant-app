import { ApolloServer } from "@apollo/server"
import express , { Application } from "express"
import jwt from "jsonwebtoken"
import cors from "cors"
import { expressMiddleware } from '@as-integrations/express5';

import userTypeDefs from "./schemas/user.schema"
import userResolvers from "./resolvers/user.resolver"
import categoryTypeDefs from "./schemas/category.schema"
import categoryResolver from "./resolvers/category.resolver"; 
import orderResolver from "./resolvers/order.resolver";
import orderTypeDefs from "./schemas/order.schema";
import menuItemResolver from "./resolvers/menuitem.resolver";
import menuTypeDefs from "./schemas/menuItem.schema";

export interface Context {
  user?: {
    id: string
    role: string
  }
}
const typeDefs = [userTypeDefs, categoryTypeDefs, menuTypeDefs, orderTypeDefs]
const resolvers = [userResolvers, categoryResolver, menuItemResolver, orderResolver]

const setupGraphQL = async (app: Application): Promise<void> => {
  const server = new ApolloServer<Context>({ typeDefs, resolvers })
  await server.start()

  app.use(
    "/graphql",                  
    cors<cors.CorsRequest>(),
    express.json(),  
    expressMiddleware(server, {
      context: async ({ req }) => {
        const token = req.headers.authorization?.replace("Bearer ", "")

        if (!token) return { user: undefined }

        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
          ) as { id: string; role: string }

          return { user: decoded }
        } catch {
          return { user: undefined }
        }
      },
    })
  ) 
}

export default setupGraphQL