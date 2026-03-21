import { Router } from "express";
import mongoose from "mongoose";
import { redis } from "../db/redis.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const healthRouter = Router();

healthRouter.get(
  "/health",
  asyncHandler(async (_request, response) => {
    const redisStatus = await redis.ping();

    response.json({
      ok: mongoose.connection.readyState === 1 && redisStatus === "PONG",
      mongo: mongoose.connection.readyState,
      redis: redisStatus
    });
  })
);
