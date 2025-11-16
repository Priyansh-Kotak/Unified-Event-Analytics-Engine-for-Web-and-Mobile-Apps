const Redis = require("ioredis");

let redis;

if (process.env.REDIS_URL) {
  // Railway/Production with REDIS_URL
  redis = new Redis(process.env.REDIS_URL, {
    retryStrategy: (times) => {
      if (process.env.NODE_ENV === "test" && times > 3) {
        return null;
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: process.env.NODE_ENV === "test" ? 1 : 3,
    enableOfflineQueue: process.env.NODE_ENV !== "test",
    // TLS removed - Railway's private network doesn't use TLS
  });
} else {
  // Local development
  redis = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => {
      if (process.env.NODE_ENV === "test" && times > 3) {
        return null;
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    maxRetriesPerRequest: process.env.NODE_ENV === "test" ? 1 : 3,
    enableOfflineQueue: process.env.NODE_ENV !== "test",
  });
}

// Handle connection events
redis.on("connect", () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("✅ Redis connected successfully");
  }
});

redis.on("error", (error) => {
  if (process.env.NODE_ENV !== "test") {
    console.error("❌ Redis connection error:", error.message);
  }
});

redis.on("ready", () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("✅ Redis is ready to accept commands");
  }
});

// Cache helper functions
const cacheService = {
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`Error getting cache for key ${key}:`, error.message);
      }
      return null;
    }
  },

  async set(key, value, expirationInSeconds = 300) {
    try {
      await redis.setex(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`Error setting cache for key ${key}:`, error.message);
      }
      return false;
    }
  },

  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(`Error deleting cache for key ${key}:`, error.message);
      }
      return false;
    }
  },

  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(
          `Error deleting cache pattern ${pattern}:`,
          error.message
        );
      }
      return false;
    }
  },

  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error(
          `Error checking cache existence for key ${key}:`,
          error.message
        );
      }
      return false;
    }
  },

  async flushall() {
    try {
      await redis.flushall();
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== "test") {
        console.error("Error flushing cache:", error.message);
      }
      return false;
    }
  },
};

module.exports = {
  redis,
  cacheService,
};