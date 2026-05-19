import mongoose from "mongoose";
import { env } from "./env";

const RETRY_DELAY = 5000;
const MAX_RETRIES = 3;

const connectWithRetry = async (retries = MAX_RETRIES): Promise<void> => {
  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    if (retries === 0) {
      console.error("❌ MongoDB connection failed after max retries");
      process.exit(1);
    }
    console.warn(`⚠️  MongoDB connection failed. Retrying in ${RETRY_DELAY / 1000}s... (${retries} retries left)`);
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    return connectWithRetry(retries - 1);
  }
};

export const connectDB = async (): Promise<void> => {
  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected. Attempting reconnect...");
    connectWithRetry();
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB error:", err.message);
  });

  await connectWithRetry();
};