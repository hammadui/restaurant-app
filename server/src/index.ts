import express from "express";
import connectDB from "./config/mongo";
import "dotenv/config";

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended:true}))

const PORT =  process.env.PORT || 3000 

connectDB();

app.listen(PORT, ()=>{
  console.log("Server Started sucessfully");
}).on("error",(err)=>{
  console.log("Error starting server")
})