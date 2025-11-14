const { User, App } = require('../models');
const { generateToken } = require('../utils/jwt.utils');
const { generateApiKey } = require('../utils/apiKey.utils');

// Google OAuth callback handler
const googleCallback = async (req, res) => {
  try {
    // User is already attached by passport
    const user = req.user;

    // Generate JWT token
    const token = generateToken(user.id);

    // In production, you would redirect to frontend with token
    // For now, we'll send JSON response
    res.status(200).json({
      success: true,
      message: 'Authentication successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      }
    });
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({
      error: 'Authentication failed'
    });
  }
};

// Register a new app and generate API key
const registerApp = async (req, res) => {
  try {
    const { name, domain } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !domain) {
      return res.status(400).json({
        error: 'App name and domain are required'
      });
    }

    // Generate API key
    const apiKey = generateApiKey();

    // Set expiration (optional - 1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Create app
    const app = await App.create({
      userId,
      name,
      domain,
      apiKey,
      expiresAt
    });

    res.status(201).json({
      success: true,
      message: 'App registered successfully',
      data: {
        id: app.id,
        name: app.name,
        domain: app.domain,
        apiKey: app.apiKey,
        expiresAt: app.expiresAt,
        createdAt: app.createdAt
      }
    });
  } catch (error) {
    console.error('Register app error:', error);
    res.status(500).json({
      error: 'Failed to register app'
    });
  }
};

// Get API key for an app
const getApiKey = async (req, res) => {
  try {
    const { appId } = req.query;
    const userId = req.user.id;

    if (!appId) {
      return res.status(400).json({
        error: 'App ID is required'
      });
    }

    // Find app
    const app = await App.findOne({
      where: {
        id: appId,
        userId: userId
      }
    });

    if (!app) {
      return res.status(404).json({
        error: 'App not found or you do not have access'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: app.id,
        name: app.name,
        apiKey: app.apiKey,
        isActive: app.isActive,
        expiresAt: app.expiresAt
      }
    });
  } catch (error) {
    console.error('Get API key error:', error);
    res.status(500).json({
      error: 'Failed to retrieve API key'
    });
  }
};

// Revoke API key
const revokeApiKey = async (req, res) => {
  try {
    const { appId } = req.body;
    const userId = req.user.id;

    if (!appId) {
      return res.status(400).json({
        error: 'App ID is required'
      });
    }

    // Find and update app
    const app = await App.findOne({
      where: {
        id: appId,
        userId: userId
      }
    });

    if (!app) {
      return res.status(404).json({
        error: 'App not found or you do not have access'
      });
    }

    // Deactivate the app
    app.isActive = false;
    await app.save();

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
      data: {
        id: app.id,
        name: app.name,
        isActive: app.isActive
      }
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      error: 'Failed to revoke API key'
    });
  }
};

// Regenerate API key
const regenerateApiKey = async (req, res) => {
  try {
    const { appId } = req.body;
    const userId = req.user.id;

    if (!appId) {
      return res.status(400).json({
        error: 'App ID is required'
      });
    }

    // Find app
    const app = await App.findOne({
      where: {
        id: appId,
        userId: userId
      }
    });

    if (!app) {
      return res.status(404).json({
        error: 'App not found or you do not have access'
      });
    }

    // Generate new API key
    const newApiKey = generateApiKey();
    
    // Update expiration
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Update app
    app.apiKey = newApiKey;
    app.expiresAt = expiresAt;
    app.isActive = true;
    await app.save();

    res.status(200).json({
      success: true,
      message: 'API key regenerated successfully',
      data: {
        id: app.id,
        name: app.name,
        apiKey: app.apiKey,
        expiresAt: app.expiresAt
      }
    });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({
      error: 'Failed to regenerate API key'
    });
  }
};

// Get current user info
const getCurrentUser = async (req, res) => {
  try {
    const user = req.user;

    // Get user's apps
    const apps = await App.findAll({
      where: { userId: user.id },
      attributes: ['id', 'name', 'domain', 'isActive', 'createdAt']
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        },
        apps
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      error: 'Failed to get user information'
    });
  }
};

module.exports = {
  googleCallback,
  registerApp,
  getApiKey,
  revokeApiKey,
  regenerateApiKey,
  getCurrentUser
};