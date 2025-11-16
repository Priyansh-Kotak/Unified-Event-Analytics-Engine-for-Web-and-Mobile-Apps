const os = require("os");
const { sequelize } = require("../models");
const { redis } = require("../config/redis");

/**
 * Get system health status
 */
async function getSystemHealth() {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {},
  };

  // Check database
  try {
    await sequelize.authenticate();
    health.services.database = {
      status: "healthy",
      type: "PostgreSQL",
    };
  } catch (error) {
    health.status = "unhealthy";
    health.services.database = {
      status: "unhealthy",
      error: error.message,
    };
  }

  // Check Redis
  try {
    await redis.ping();
    health.services.redis = {
      status: "healthy",
      type: "Redis",
    };
  } catch (error) {
    health.status = "degraded";
    health.services.redis = {
      status: "unhealthy",
      error: error.message,
    };
  }

  // System metrics
  health.system = {
    memory: {
      total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
      free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
      usage: `${Math.round((1 - os.freemem() / os.totalmem()) * 100)}%`,
    },
    cpu: {
      cores: os.cpus().length,
      model: os.cpus()[0].model,
    },
    platform: os.platform(),
    nodeVersion: process.version,
  };

  return health;
}

module.exports = {
  getSystemHealth,
};
