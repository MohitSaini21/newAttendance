import mongoose from "mongoose";
import { config } from "dotenv";
config();

// MongoDB connection string
const url =
  "mongodb+srv://mohitsainisaini2680:misbaansari20@cluster0.wjx3j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
export const ConnectDB = async () => {
  try {
    await mongoose.connect(url); // Connect to the MongoDB cluster

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error in DB connection or index creation:", error.message);
    process.exit(1); // Exit the process if connection fails
  }
};
