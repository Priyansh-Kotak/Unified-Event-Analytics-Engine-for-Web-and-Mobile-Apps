const analyticsService = require("../services/analytics.service");

/**
 * Collect analytics event
 */
const collectEvent = async (req, res) => {
  try {
    const eventData = req.validatedData;
    const app = req.app; // From authenticateApiKey middleware

    // Extract IP address if not provided
    if (!eventData.ipAddress) {
      eventData.ipAddress = req.ip || req.connection.remoteAddress;
    }

    // Save event
    const event = await analyticsService.saveEvent(eventData, app);

    res.status(201).json({
      success: true,
      message: "Event collected successfully",
      data: {
        id: event.id,
        event: event.event,
        timestamp: event.timestamp,
      },
    });
  } catch (error) {
    console.error("Error collecting event:", error);
    res.status(500).json({
      error: "Failed to collect event",
      message: error.message,
    });
  }
};

/**
 * Get event summary
 */
const getEventSummary = async (req, res) => {
  try {
    const params = req.validatedQuery;
    const userId = req.user.id;

    const summary = await analyticsService.getEventSummary(params, userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error getting event summary:", error);

    if (error.message === "App not found or access denied") {
      return res.status(403).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to get event summary",
      message: error.message,
    });
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (req, res) => {
  try {
    const params = req.validatedQuery;
    const userId = req.user.id;

    const stats = await analyticsService.getUserStats(params, userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting user stats:", error);

    if (error.message === "App not found or access denied") {
      return res.status(403).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to get user stats",
      message: error.message,
    });
  }
};

/**
 * Get event trends over time
 */
const getEventTrends = async (req, res) => {
  try {
    const params = req.query;
    const userId = req.user.id;

    const trends = await analyticsService.getEventTrends(params, userId);

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error) {
    console.error("Error getting event trends:", error);

    if (error.message === "App not found or access denied") {
      return res.status(403).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to get event trends",
      message: error.message,
    });
  }
};

/**
 * Get top events for an app
 */
const getTopEvents = async (req, res) => {
  try {
    const { appId } = req.params;
    const { limit = 10 } = req.query;
    const userId = req.user.id;

    const topEvents = await analyticsService.getTopEvents(
      appId,
      userId,
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      data: topEvents,
    });
  } catch (error) {
    console.error("Error getting top events:", error);

    if (error.message === "App not found or access denied") {
      return res.status(403).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Failed to get top events",
      message: error.message,
    });
  }
};

/**
 * Get dashboard overview
 */
const getDashboardOverview = async (req, res) => {
  try {
    const { app_id } = req.query;
    const userId = req.user.id;

    // Verify app ownership if app_id is provided
    let appIds;
    if (app_id) {
      const app = await App.findOne({
        where: { id: app_id, userId },
      });
      if (!app) {
        return res.status(403).json({
          error: "App not found or access denied",
        });
      }
      appIds = [app_id];
    } else {
      const apps = await App.findAll({
        where: { userId },
        attributes: ["id"],
      });
      appIds = apps.map((app) => app.id);
    }

    const { Op } = require("sequelize");
    const whereConditions = { appId: { [Op.in]: appIds } };

    // Get total events
    const totalEvents = await Event.count({ where: whereConditions });

    // Get events today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventsToday = await Event.count({
      where: {
        ...whereConditions,
        timestamp: { [Op.gte]: today },
      },
    });

    // Get unique users
    const uniqueUsers = await Event.findAll({
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

    // Get top 5 events
    const topEvents = await Event.findAll({
      where: whereConditions,
      attributes: [
        "event",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["event"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: 5,
      raw: true,
    });

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

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        eventsToday,
        uniqueUsers: parseInt(uniqueUsers[0]?.count || 0),
        topEvents,
        deviceBreakdown,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard overview:", error);
    res.status(500).json({
      error: "Failed to get dashboard overview",
      message: error.message,
    });
  }
};

module.exports = {
  collectEvent,
  getEventSummary,
  getUserStats,
  getEventTrends,
  getTopEvents,
  getDashboardOverview,
};
