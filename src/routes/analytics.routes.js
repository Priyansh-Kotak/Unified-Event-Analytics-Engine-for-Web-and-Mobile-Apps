const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticateUser, authenticateApiKey } = require('../middleware/auth.middleware');
const { 
  validateEventCollection, 
  validateEventSummary,
  validateUserStats 
} = require('../validators/event.validator');
const { 
  eventCollectionLimiter, 
  analyticsLimiter 
} = require('../middleware/rateLimiter.middleware');

// @route   POST /api/analytics/collect
// @desc    Collect analytics event
// @access  Private (API Key required)
router.post(
  '/collect',
  eventCollectionLimiter,
  authenticateApiKey,
  validateEventCollection,
  analyticsController.collectEvent
);

// @route   GET /api/analytics/event-summary
// @desc    Get event summary with aggregations
// @access  Private (JWT required)
router.get(
  '/event-summary',
  analyticsLimiter,
  authenticateUser,
  validateEventSummary,
  analyticsController.getEventSummary
);

// @route   GET /api/analytics/user-stats
// @desc    Get user statistics
// @access  Private (JWT required)
router.get(
  '/user-stats',
  analyticsLimiter,
  authenticateUser,
  validateUserStats,
  analyticsController.getUserStats
);

// @route   GET /api/analytics/event-trends
// @desc    Get event trends over time
// @access  Private (JWT required)
router.get(
  '/event-trends',
  analyticsLimiter,
  authenticateUser,
  analyticsController.getEventTrends
);

// @route   GET /api/analytics/top-events/:appId
// @desc    Get top events for an app
// @access  Private (JWT required)
router.get(
  '/top-events/:appId',
  analyticsLimiter,
  authenticateUser,
  analyticsController.getTopEvents,
  analyticsController.getDashboardOverview
);

module.exports = router;