const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');
const { authenticateUser } = require('../middleware/auth.middleware');

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get(
  '/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/api/auth/failure'
  }),
  authController.googleCallback
);

// @route   GET /api/auth/failure
// @desc    Authentication failure handler
// @access  Public
router.get('/failure', (req, res) => {
  res.status(401).json({
    error: 'Authentication failed'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateUser, authController.getCurrentUser);

// @route   POST /api/auth/register
// @desc    Register a new app and get API key
// @access  Private
router.post('/register', authenticateUser, authController.registerApp);

// @route   GET /api/auth/api-key
// @desc    Get API key for an app
// @access  Private
router.get('/api-key', authenticateUser, authController.getApiKey);

// @route   POST /api/auth/revoke
// @desc    Revoke an API key
// @access  Private
router.post('/revoke', authenticateUser, authController.revokeApiKey);

// @route   POST /api/auth/regenerate
// @desc    Regenerate an API key
// @access  Private
router.post('/regenerate', authenticateUser, authController.regenerateApiKey);

module.exports = router;