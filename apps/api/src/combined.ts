import { createServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { connectToMongo } from "./db/mongoose.js";
import { createApp } from "./app.js";
import { initializeSocketServer } from "./services/socket/eventBus.js";
import { startGenerationWorker } from "./workers/generationWorker.js";
import { startPdfWorker } from "./workers/pdfWorker.js";

// Single-process entrypoint for hosts that bill per service (Railway).
// Runs the HTTP/socket server and the BullMQ workers together so the
// queue producer, queue consumer, and Redis pub/sub share one deployment.
// Local dev still uses the split main.ts / worker.ts entrypoints.
const bootstrap = async () => {
  await connectToMongo();

  const app = createApp();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*"
    }
  });

  io.on("connection", (socket) => {
    socket.emit("connected", { ok: true, timestamp: new Date().toISOString() });
  });

  await initializeSocketServer(io);

  await startGenerationWorker();
  await startPdfWorker();

  httpServer.listen(env.API_PORT, () => {
    console.log(`API + workers listening on port ${env.API_PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
