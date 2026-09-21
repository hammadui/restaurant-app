import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document{
    name:string
    email:string
    password:string
    role: "customer"|"admin"
    phone?:string
    createdAt:Date
    updatedAt:Date
}

const userSchema = new Schema<IUser>(
    {
        name:{
            type:String,
            required:[true,"Name is Required"],
            trim:true
        },
        email:{
            type:String,
            required:[true,"Email is Required"],
            trim:true,
            unique:true,
            lowercase: true
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [8, "Password must be at least 8 characters"],
            },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
            },

        phone: {
            type: String,
            trim: true,
            },
       
    },
    {
        timestamps: true
    }
)

const User = mongoose.model<IUser>("User",userSchema);

export default User;