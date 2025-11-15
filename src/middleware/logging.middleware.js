const logger = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info(`${req.method} ${req.url}`, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[logLevel](`${req.method} ${req.url} ${res.statusCode} ${duration}ms`, {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip
    });
  });

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error('Application error:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  next(err);
};

module.exports = {
  requestLogger,
  errorLogger
};