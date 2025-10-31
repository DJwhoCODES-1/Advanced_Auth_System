import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGO_URL = process.env.MONGO_URL;

    if (!MONGO_URL) {
      throw new Error("❌ Invalid Mongo URI");
    }

    await mongoose.connect(MONGO_URL);

    console.log(`✅ Connected to MongoDB database!`);
  } catch (error) {
    console.error("❌ Failed to connect Database:", error.message);
    process.exit(1);
  }
};

export default connectDB;
