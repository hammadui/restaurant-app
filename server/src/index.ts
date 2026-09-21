import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import connectDB from "./config/mongo"
import setupGraphQL from "./graphql"

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

const PORT = process.env.PORT || 3000

const startServer = async (): Promise<void> => {
  await connectDB()
  await setupGraphQL(app)

  app
    .listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`GraphQL ready at http://localhost:${PORT}/graphql`)
    })
    .on("error", (err) => {
      console.error("Server failed to start:", err)
      process.exit(1)
    })
}

startServer()