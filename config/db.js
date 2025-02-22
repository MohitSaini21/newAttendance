import mongoose from "mongoose";
import { config } from "dotenv";
config();

// MongoDB connection string
const url =
  process.env.MONGO_URL ||
  "mongodb+srv://mohitsainisaini2680:zbtOJ2KnyCRUK9j3@cluster0.wjx3j.mongodb.net/attendance?retryWrites=true&w=majority&appName=Cluster0"; // Corrected connection string to specify the 'attendance' database in the query

export const ConnectDB = async () => {
  try {
    await mongoose.connect(url); // Connect to the MongoDB cluster

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error in DB connection or index creation:", error.message);
    process.exit(1); // Exit the process if connection fails
  }
};
