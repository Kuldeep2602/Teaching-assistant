import Redis from "ioredis";
import { Queue } from "bullmq";
import { env } from "../config/env.js";
import { QUEUE_NAMES } from "../config/queues.js";

const baseRedisOptions = {
  maxRetriesPerRequest: null as null,
  // Railway's private network is IPv6-only; family 0 lets DNS return either
  // family so the *.railway.internal Redis host resolves. Harmless locally.
  family: 0
};

export const queueConnection = {
  url: env.REDIS_URL,
  family: 0
};

export const redis = new Redis(env.REDIS_URL, baseRedisOptions);

// Use standalone clients here instead of `duplicate()` so the subscriber
// connection can disable ready checks after entering Redis subscriber mode.
export const redisSubscriber = new Redis(env.REDIS_URL, {
  ...baseRedisOptions,
  enableReadyCheck: false
});

export const redisPublisher = new Redis(env.REDIS_URL, baseRedisOptions);

export const generationQueue = new Queue(QUEUE_NAMES.generation, {
  connection: queueConnection
});

export const pdfQueue = new Queue(QUEUE_NAMES.pdf, {
  connection: queueConnection
});
