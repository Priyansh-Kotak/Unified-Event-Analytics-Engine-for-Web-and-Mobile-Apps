const Redis = require('ioredis');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3
});

// Handle connection events
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redis.on('ready', () => {
  console.log('✅ Redis is ready to accept commands');
});

// Cache helper functions
const cacheService = {
  /**
   * Get cached data
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Parsed JSON data or null
   */
  async get(key) {
    try {
      const data = await redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting cache for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set cache data with expiration
   * @param {string} key - Cache key
   * @param {any} value - Data to cache
   * @param {number} expirationInSeconds - TTL in seconds (default: 300 = 5 minutes)
   */
  async set(key, value, expirationInSeconds = 300) {
    try {
      await redis.setex(key, expirationInSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting cache for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete cached data
   * @param {string} key - Cache key
   */
  async del(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Error deleting cache for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Pattern to match (e.g., 'analytics:*')
   */
  async delPattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error(`Error deleting cache pattern ${pattern}:`, error);
      return false;
    }
  },

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking cache existence for key ${key}:`, error);
      return false;
    }
  }
};

module.exports = {
  redis,
  cacheService
};