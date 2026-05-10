import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const URI = process.env.MONGODB_URI;
  try{
  if (!URI){
      throw new Error("MONGODB_URI is not defined in .env")
    }
  await mongoose.connect(URI);
  console.log("Connect Succesfully")
  }catch(err){
    console.log(err)
    process.exit(1)
  }
}

export default connectDB;