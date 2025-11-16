const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const authController = require("../controllers/auth.controller");
const { authenticateUser } = require("../middleware/auth.middleware");
const { apiKeyLimiter } = require("../middleware/rateLimiter.middleware");

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     tags: [Authentication]
 *     summary: Initiate Google OAuth flow
 *     description: Redirects user to Google login page for authentication
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     tags: [Authentication]
 *     summary: Google OAuth callback
 *     description: Handles Google OAuth callback and returns JWT token
 *     responses:
 *       200:
 *         description: Authentication successful
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
 *                   example: Authentication successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  authController.googleCallback
);

/**
 * @swagger
 * /api/auth/failure:
 *   get:
 *     tags: [Authentication]
 *     summary: Authentication failure handler
 *     description: Returns error when authentication fails
 *     responses:
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/failure", (req, res) => {
  res.status(401).json({
    error: "Authentication failed",
  });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user information
 *     description: Returns authenticated user's profile and their apps
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     apps:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/App'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/me", authenticateUser, authController.getCurrentUser);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new app and generate API key
 *     description: Creates a new app and generates an API key for event collection
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - domain
 *             properties:
 *               name:
 *                 type: string
 *                 description: App name
 *                 example: My Awesome App
 *               domain:
 *                 type: string
 *                 format: uri
 *                 description: App domain
 *                 example: https://myapp.com
 *     responses:
 *       201:
 *         description: App registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/App'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  "/register",
  apiKeyLimiter,
  authenticateUser,
  authController.registerApp
);

/**
 * @swagger
 * /api/auth/api-key:
 *   get:
 *     tags: [Authentication]
 *     summary: Get API key for an app
 *     description: Retrieves API key information for a specific app
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: appId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: App ID
 *     responses:
 *       200:
 *         description: API key retrieved successfully
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: App not found
 */
router.get("/api-key", authenticateUser, authController.getApiKey);

/**
 * @swagger
 * /api/auth/revoke:
 *   post:
 *     tags: [Authentication]
 *     summary: Revoke an API key
 *     description: Deactivates an API key to prevent further use
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *             properties:
 *               appId:
 *                 type: string
 *                 format: uuid
 *                 description: App ID whose API key to revoke
 *     responses:
 *       200:
 *         description: API key revoked successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: App not found
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  "/revoke",
  apiKeyLimiter,
  authenticateUser,
  authController.revokeApiKey
);

/**
 * @swagger
 * /api/auth/regenerate:
 *   post:
 *     tags: [Authentication]
 *     summary: Regenerate an API key
 *     description: Generates a new API key for an existing app
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - appId
 *             properties:
 *               appId:
 *                 type: string
 *                 format: uuid
 *                 description: App ID whose API key to regenerate
 *     responses:
 *       200:
 *         description: API key regenerated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     apiKey:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: App not found
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post(
  "/regenerate",
  apiKeyLimiter,
  authenticateUser,
  authController.regenerateApiKey
);

module.exports = router;
