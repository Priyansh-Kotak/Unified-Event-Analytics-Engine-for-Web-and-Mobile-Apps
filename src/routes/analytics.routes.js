const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const {
  authenticateUser,
  authenticateApiKey,
} = require("../middleware/auth.middleware");
const {
  validateEventCollection,
  validateEventSummary,
  validateUserStats,
} = require("../validators/event.validator");
const {
  eventCollectionLimiter,
  analyticsLimiter,
} = require("../middleware/rateLimiter.middleware");

/**
 * @swagger
 * /api/analytics/collect:
 *   post:
 *     tags: [Analytics]
 *     summary: Collect analytics event
 *     description: Submit an analytics event from your website or mobile app. Requires API key authentication.
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event collected successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Event collected successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     event:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  "/collect",
  eventCollectionLimiter,
  authenticateApiKey,
  validateEventCollection,
  analyticsController.collectEvent
);

/**
 * @swagger
 * /api/analytics/event-summary:
 *   get:
 *     tags: [Analytics]
 *     summary: Get event summary with aggregations
 *     description: Retrieves aggregated analytics for a specific event type with optional filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: string
 *         description: Event name to analyze
 *         example: login_form_cta_click
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering (YYYY-MM-DD)
 *         example: 2024-01-01
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering (YYYY-MM-DD)
 *         example: 2024-12-31
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Specific app ID (optional, defaults to all user's apps)
 *     responses:
 *       200:
 *         description: Event summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EventSummary'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get(
  "/event-summary",
  analyticsLimiter,
  authenticateUser,
  validateEventSummary,
  analyticsController.getEventSummary
);

/**
 * @swagger
 * /api/analytics/user-stats:
 *   get:
 *     tags: [Analytics]
 *     summary: Get user statistics
 *     description: Returns detailed statistics for a specific user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User identifier
 *         example: user123
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Specific app ID (optional)
 *     responses:
 *       200:
 *         description: User stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get(
  "/user-stats",
  analyticsLimiter,
  authenticateUser,
  validateUserStats,
  analyticsController.getUserStats
);

/**
 * @swagger
 * /api/analytics/event-trends:
 *   get:
 *     tags: [Analytics]
 *     summary: Get event trends over time
 *     description: Returns event counts grouped by time intervals
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: event
 *         required: true
 *         schema:
 *           type: string
 *         description: Event name
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [hour, day]
 *           default: day
 *         description: Time interval for grouping
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Specific app ID
 *     responses:
 *       200:
 *         description: Event trends retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       period:
 *                         type: string
 *                       count:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get(
  "/event-trends",
  analyticsLimiter,
  authenticateUser,
  analyticsController.getEventTrends
);

/**
 * @swagger
 * /api/analytics/top-events/{appId}:
 *   get:
 *     tags: [Analytics]
 *     summary: Get top events for an app
 *     description: Returns the most frequent events for a specific app
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: App ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of top events to return
 *     responses:
 *       200:
 *         description: Top events retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       event:
 *                         type: string
 *                       count:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Access denied
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get(
  "/top-events/:appId",
  analyticsLimiter,
  authenticateUser,
  analyticsController.getTopEvents
);

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     tags: [Analytics]
 *     summary: Get dashboard overview
 *     description: Returns comprehensive analytics overview for dashboard display
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: app_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Specific app ID (optional, defaults to all user's apps)
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalEvents:
 *                       type: integer
 *                       description: Total number of events
 *                     eventsToday:
 *                       type: integer
 *                       description: Events collected today
 *                     uniqueUsers:
 *                       type: integer
 *                       description: Number of unique users
 *                     topEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           event:
 *                             type: string
 *                           count:
 *                             type: string
 *                     deviceBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           device:
 *                             type: string
 *                           count:
 *                             type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.get(
  "/dashboard",
  analyticsLimiter,
  authenticateUser,
  analyticsController.getDashboardOverview
);

module.exports = router;
