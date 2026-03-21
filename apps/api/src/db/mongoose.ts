import mongoose from "mongoose";
import { env } from "../config/env.js";

let connectionPromise: Promise<typeof mongoose> | null = null;

export const connectToMongo = async () => {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.MONGODB_URI);
  }

  return connectionPromise;
};
