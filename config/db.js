import mongoose from "mongoose";

const url = process.env.MONGO_URL || "mongodb://localhost:27017/Attendance"; // MongoDB URL from environment variable

export const ConnectDB = async () => {
  try {
    await mongoose.connect(url);

    console.log("MongoDB connected successfully!");
  } catch (error) {
    console.error("Error in DB connection or index creation:", error.message);
    process.exit(1); // Exit the process if connection fails
  }
};
