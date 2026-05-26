import Redis from "ioredis";
import { config } from "./index.js";

const redisClient = (() => {
  if (!config.REDIS_ENABLED) return null;

  if (config.REDIS_URL) {
    return new Redis(config.REDIS_URL);
  }

  return new Redis({
    host: config.REDIS_HOST || "127.0.0.1",
    port: config.REDIS_PORT || 6379,
  });
})();

if (redisClient) {
  redisClient.on("connect", () => {
    console.log("[redis] Connected");
  });
  redisClient.on("error", (err) => {
    console.error("[redis] Error:", err?.message || err);
  });
}

export const setUserOnline = async (userId) => {
  try {
    if (!redisClient) return;
    // Expiration set to 2 hours just in case a manual cleanup is missed
    await redisClient.set(`user:${userId}:status`, "online", "EX", 7200);
  } catch (err) {
    console.error("Redis setUserOnline error", err);
  }
};

export const setUserOffline = async (userId) => {
  try {
    if (!redisClient) return;
    await redisClient.del(`user:${userId}:status`);
  } catch (err) {
    console.error('Redis setUserOffline error', err);
  }
};

export const checkUserOnline = async (userId) => {
  try {
    if (!redisClient) return false;
    const status = await redisClient.get(`user:${userId}:status`);
    return status === "online";
  } catch (err) {
    console.error('Redis checkUserOnline error', err);
    return false;
  }
};

// ----------------------------------------------------
// Message Caching Helpers
// ----------------------------------------------------

export const getCachedMessages = async (channelId, page) => {
  try {
    if (!redisClient) return null;
    const cached = await redisClient.get(`channel:${channelId}:messages:page:${page}`);
    if (cached) return JSON.parse(cached);
    return null;
  } catch (err) {
    console.error('Redis getCachedMessages error', err);
    return null;
  }
};

export const cacheMessages = async (channelId, page, messagesData) => {
  try {
    if (!redisClient) return;
    // Cache for 1 hour to prevent stale memory bloat
    await redisClient.set(
      `channel:${channelId}:messages:page:${page}`,
      JSON.stringify(messagesData),
      "EX",
      3600
    );
  } catch (err) {
    console.error('Redis cacheMessages error', err);
  }
};

export const invalidateChannelCache = async (channelId) => {
  try {
    if (!redisClient) return;
    // Find all pagination keys related to this specific channel
    const keys = await redisClient.keys(`channel:${channelId}:messages:page:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Cache Busted] Cleared ${keys.length} cache pages for channel ${channelId}`);
    }
  } catch (err) {
    console.error('Redis invalidateChannelCache error', err);
  }
};

export default redisClient;
