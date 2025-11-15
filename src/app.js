const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('./config/passport');
const { requestLogger, errorLogger } = require('./middleware/logging.middleware');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger); // Add custom logger

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Route not found'
  });
});

// Error logging
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error'
    }
  });
});

module.exports = app;