const { Event, App, sequelize } = require("../models");
const { Op } = require("sequelize");
const { cacheService } = require("../config/redis");

class AnalyticsService {
  /**
   * Save an event to the database
   */
  async saveEvent(eventData, app) {
    try {
      const event = await Event.create({
        appId: app.id,
        event: eventData.event,
        url: eventData.url,
        referrer: eventData.referrer || null,
        device: eventData.device || "unknown",
        ipAddress: eventData.ipAddress || null,
        userId: eventData.userId || null,
        metadata: eventData.metadata || {},
        timestamp: eventData.timestamp || new Date(),
      });

      // Invalidate relevant caches
      await this.invalidateEventCaches(app.id, eventData.event);

      return event;
    } catch (error) {
      console.error("Error saving event:", error);
      throw new Error("Failed to save event");
    }
  }

  /**
   * Get event summary with caching
   */
  async getEventSummary(params, userId) {
    const { event, startDate, endDate, app_id } = params;

    // Generate cache key
    const cacheKey = `event-summary:${userId}:${event}:${app_id || "all"}:${
      startDate || "all"
    }:${endDate || "all"}`;

    // Check cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for event summary");
      return cachedData;
    }

    console.log("Cache miss - fetching from database");

    // Build query conditions
    const whereConditions = { event };

    // Date range filter
    if (startDate || endDate) {
      whereConditions.timestamp = {};
      if (startDate) {
        whereConditions.timestamp[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.timestamp[Op.lte] = new Date(endDate);
      }
    }

    // App filter - if app_id is provided, use it; otherwise get all user's apps
    let appIds;
    if (app_id) {
      // Verify user owns this app
      const app = await App.findOne({
        where: { id: app_id, userId },
      });
      if (!app) {
        throw new Error("App not found or access denied");
      }
      appIds = [app_id];
    } else {
      // Get all user's apps
      const apps = await App.findAll({
        where: { userId },
        attributes: ["id"],
      });
      appIds = apps.map((app) => app.id);
    }

    if (appIds.length === 0) {
      return {
        event,
        count: 0,
        uniqueUsers: 0,
        deviceData: {},
      };
    }

    whereConditions.appId = { [Op.in]: appIds };

    // Get total count
    const totalCount = await Event.count({ where: whereConditions });

    // Get unique users count
    const uniqueUsersResult = await Event.findAll({
      where: whereConditions,
      attributes: [
        [
          sequelize.fn(
            "COUNT",
            sequelize.fn("DISTINCT", sequelize.col("userId"))
          ),
          "count",
        ],
      ],
      raw: true,
    });
    const uniqueUsers = parseInt(uniqueUsersResult[0]?.count || 0);

    // Get device breakdown
    const deviceBreakdown = await Event.findAll({
      where: whereConditions,
      attributes: [
        "device",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["device"],
      raw: true,
    });

    // Format device data
    const deviceData = {};
    deviceBreakdown.forEach((item) => {
      deviceData[item.device] = parseInt(item.count);
    });

    const result = {
      event,
      count: totalCount,
      uniqueUsers,
      deviceData,
    };

    // Cache the result for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get user statistics with caching
   */
  async getUserStats(params, userId) {
    const { userId: targetUserId, app_id } = params;

    // Generate cache key
    const cacheKey = `user-stats:${userId}:${targetUserId}:${app_id || "all"}`;

    // Check cache first
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for user stats");
      return cachedData;
    }

    console.log("Cache miss - fetching from database");

    // Build query conditions
    const whereConditions = { userId: targetUserId };

    // App filter
    let appIds;
    if (app_id) {
      // Verify user owns this app
      const app = await App.findOne({
        where: { id: app_id, userId },
      });
      if (!app) {
        throw new Error("App not found or access denied");
      }
      appIds = [app_id];
    } else {
      // Get all user's apps
      const apps = await App.findAll({
        where: { userId },
        attributes: ["id"],
      });
      appIds = apps.map((app) => app.id);
    }

    if (appIds.length === 0) {
      return {
        userId: targetUserId,
        totalEvents: 0,
        deviceDetails: {},
        ipAddress: null,
      };
    }

    whereConditions.appId = { [Op.in]: appIds };

    // Get total events count
    const totalEvents = await Event.count({ where: whereConditions });

    // Get most recent event for device and IP info
    const recentEvent = await Event.findOne({
      where: whereConditions,
      order: [["timestamp", "DESC"]],
      attributes: ["metadata", "ipAddress", "device"],
    });

    const result = {
      userId: targetUserId,
      totalEvents,
      deviceDetails: recentEvent?.metadata || {},
      ipAddress: recentEvent?.ipAddress || null,
      lastDevice: recentEvent?.device || null,
    };

    // Cache the result for 5 minutes
    await cacheService.set(cacheKey, result, 300);

    return result;
  }

  /**
   * Get event trends over time
   */
  async getEventTrends(params, userId) {
    const { event, startDate, endDate, app_id, interval = "day" } = params;

    // Build query conditions
    const whereConditions = { event };

    // Date range
    if (startDate || endDate) {
      whereConditions.timestamp = {};
      if (startDate) {
        whereConditions.timestamp[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        whereConditions.timestamp[Op.lte] = new Date(endDate);
      }
    }

    // App filter
    let appIds;
    if (app_id) {
      const app = await App.findOne({
        where: { id: app_id, userId },
      });
      if (!app) {
        throw new Error("App not found or access denied");
      }
      appIds = [app_id];
    } else {
      const apps = await App.findAll({
        where: { userId },
        attributes: ["id"],
      });
      appIds = apps.map((app) => app.id);
    }

    whereConditions.appId = { [Op.in]: appIds };

    // Group by time interval
    // Note: This will work for PostgreSQL
    const dateFormat =
      interval === "hour" ? "YYYY-MM-DD HH24:00:00" : "YYYY-MM-DD";

    const trends = await Event.findAll({
      where: whereConditions,
      attributes: [
        [
          sequelize.fn("TO_CHAR", sequelize.col("timestamp"), dateFormat),
          "period",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["period"],
      order: [[sequelize.literal("period"), "ASC"]],
      raw: true,
    });

    return trends;
  }

  /**
   * Invalidate caches related to an event
   */
  async invalidateEventCaches(appId, eventName) {
    try {
      // Delete all event summary caches for this app and event
      await cacheService.delPattern(`event-summary:*:${eventName}:${appId}:*`);
      await cacheService.delPattern(`event-summary:*:${eventName}:all:*`);
    } catch (error) {
      console.error("Error invalidating caches:", error);
    }
  }

  /**
   * Get top events for an app
   */
  async getTopEvents(appId, userId, limit = 10) {
    // Verify user owns this app
    const app = await App.findOne({
      where: { id: appId, userId },
    });

    if (!app) {
      throw new Error("App not found or access denied");
    }

    const topEvents = await Event.findAll({
      where: { appId },
      attributes: [
        "event",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["event"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit,
      raw: true,
    });

    return topEvents;
  }
}

module.exports = new AnalyticsService();
