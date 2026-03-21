import { Server } from "socket.io";
import type { SocketEventPayload } from "@veda/shared";
import { SOCKET_EVENTS } from "@veda/shared";
import { REDIS_CHANNELS } from "../../config/queues.js";
import { redisPublisher, redisSubscriber } from "../../db/redis.js";

let io: Server | null = null;

const getSocketEventName = (status: SocketEventPayload["status"]) => {
  switch (status) {
    case "queued":
      return SOCKET_EVENTS.QUEUED;
    case "processing":
      return SOCKET_EVENTS.PROCESSING;
    case "completed":
      return SOCKET_EVENTS.COMPLETED;
    case "failed":
      return SOCKET_EVENTS.FAILED;
    case "pdf_ready":
      return SOCKET_EVENTS.PDF_READY;
    default:
      return null;
  }
};

export const initializeSocketServer = async (socketServer: Server) => {
  io = socketServer;

  await redisSubscriber.subscribe(REDIS_CHANNELS.assignmentEvents);
  redisSubscriber.on("message", (channel, payload) => {
    if (channel !== REDIS_CHANNELS.assignmentEvents || !io) {
      return;
    }

    const parsed = JSON.parse(payload) as SocketEventPayload;
    const eventName = getSocketEventName(parsed.status);
    if (eventName) {
      io.emit(eventName, parsed);
    }
  });
};

export const publishAssignmentEvent = async (event: SocketEventPayload) => {
  await redisPublisher.publish(REDIS_CHANNELS.assignmentEvents, JSON.stringify(event));
};
