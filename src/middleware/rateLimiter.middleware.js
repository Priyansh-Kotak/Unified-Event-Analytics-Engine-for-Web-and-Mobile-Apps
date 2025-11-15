const rateLimit = require('express-rate-limit');

// Rate limiter for event collection
// Higher limit since this is the main data ingestion endpoint
const eventCollectionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many event submissions from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for successful requests in development
  skip: (req) => process.env.NODE_ENV === 'development' && req.get('X-Skip-Rate-Limit') === 'true'
});

// Rate limiter for analytics endpoints
// Lower limit since these are data retrieval endpoints
const analyticsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 requests per windowMs
  message: {
    error: 'Too many analytics requests from this IP, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for API key operations
// Very strict limit for security-sensitive operations
const apiKeyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many API key operations from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  eventCollectionLimiter,
  analyticsLimiter,
  apiKeyLimiter
};