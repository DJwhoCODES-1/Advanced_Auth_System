import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import { createClient } from "redis";

dotenv.config();

const app = express();

if (!process.env.REDIS_URL) {
  console.error("❌ Missing REDIS_URL in .env");
  process.exit(1);
}

if (!process.env.MONGO_URL) {
  console.error("❌ Missing MONGO_URL in .env");
  process.exit(1);
}

let redisClient;

const startServer = async () => {
  try {
    await connectDB();

    redisClient = createClient({
      url: process.env.REDIS_URL,
    });

    await redisClient.connect();
    console.log("✅ Connected to Redis!");

    app.use(express.json());
    app.use("/api/v1", userRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
};

startServer();

export { redisClient };
