import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config();
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log("Connecting to the database...");
        setTimeout(() => {
        console.log("Database connected successfully!");
        }, 1000);
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1); // Exit the process with failure
    }

}