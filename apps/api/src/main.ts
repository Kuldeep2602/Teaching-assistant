import { createServer } from "node:http";
import { Server } from "socket.io";
import { env } from "./config/env.js";
import { connectToMongo } from "./db/mongoose.js";
import { createApp } from "./app.js";
import { initializeSocketServer } from "./services/socket/eventBus.js";

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

  httpServer.listen(env.API_PORT, () => {
    console.log(`API listening on port ${env.API_PORT}`);
  });
};

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
