import mongoose from "mongoose";
import { config } from "./index.js";

export const connectDB = async ({ required = config.DB_REQUIRED } = {}) => {
  try {
    if (!config.MONGO_URI) {
      if (required) throw new Error("MONGO_URI is missing (required for DB startup)");
      return false;
    }

    const conn = await mongoose.connect(config.MONGO_URI, {
      dbName: config.DB_NAME,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || error);
    if (required) throw error;
    return false;
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) return;
    await mongoose.connection.close();
  } catch (error) {
    console.error("MongoDB disconnect failed:", error?.message || error);
  }
};
