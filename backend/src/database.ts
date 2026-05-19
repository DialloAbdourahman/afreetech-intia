import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "./utils/winston";

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017";

export async function connectDatabase(): Promise<void> {
  const dbName = process.env.MONGODB_DB_NAME;

  if (!dbName) {
    throw new Error("MONGODB_DB_NAME environment variable is not defined");
  }

  try {
    await mongoose.connect(mongoUri, { dbName });
    logger.info(`Connected to MongoDB database ${dbName}`);
  } catch (error) {
    logger.error("Failed to connect to MongoDB", { error });
    throw error;
  }
}
