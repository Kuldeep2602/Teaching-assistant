import express from "express";
import cors from "cors";
import path from "node:path";
import { assignmentsRouter } from "./routes/assignments.js";
import { healthRouter } from "./routes/health.js";
import { env } from "./config/env.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use("/generated", express.static(path.resolve(env.PDF_OUTPUT_DIR)));
  app.use("/api", healthRouter);
  app.use("/api", assignmentsRouter);

  app.use((error: Error, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
    response.status(400).json({
      message: error.message || "Unexpected server error"
    });
  });

  return app;
};
