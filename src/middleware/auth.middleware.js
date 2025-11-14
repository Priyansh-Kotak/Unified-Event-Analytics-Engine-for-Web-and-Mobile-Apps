const jwt = require('jsonwebtoken');
const { User, App } = require('../models');

// Middleware to verify JWT token
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No token provided. Please authenticate.'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found. Invalid token.'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired. Please login again.'
      });
    }
    return res.status(500).json({
      error: 'Authentication error.'
    });
  }
};

// Middleware to verify API key
const authenticateApiKey = async (req, res, next) => {
  try {
    // Get API key from header
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        error: 'API key is required. Please provide x-api-key in headers.'
      });
    }

    // Find app with this API key
    const app = await App.findOne({
      where: { 
        apiKey: apiKey,
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'name']
      }]
    });

    if (!app) {
      return res.status(401).json({
        error: 'Invalid or inactive API key.'
      });
    }

    // Check if API key is expired
    if (app.expiresAt && new Date(app.expiresAt) < new Date()) {
      return res.status(401).json({
        error: 'API key has expired. Please regenerate.'
      });
    }

    // Attach app to request
    req.app = app;
    req.user = app.user;
    next();
  } catch (error) {
    console.error('API Key Authentication Error:', error);
    return res.status(500).json({
      error: 'Authentication error.'
    });
  }
};

module.exports = {
  authenticateUser,
  authenticateApiKey
};