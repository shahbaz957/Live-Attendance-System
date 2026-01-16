import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
    } catch (error) {
        console.log("Error Occur While Connecting to the DB")
    }
}