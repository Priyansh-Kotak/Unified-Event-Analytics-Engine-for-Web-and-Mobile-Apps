const Joi = require('joi');

// Validation schema for event collection
const eventCollectionSchema = Joi.object({
  event: Joi.string()
    .required()
    .min(1)
    .max(100)
    .messages({
      'string.empty': 'Event name is required',
      'string.min': 'Event name must be at least 1 character',
      'string.max': 'Event name cannot exceed 100 characters'
    }),
  
  url: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'URL must be a valid URI',
      'string.empty': 'URL is required'
    }),
  
  referrer: Joi.string()
    .uri()
    .allow('', null)
    .optional(),
  
  device: Joi.string()
    .valid('mobile', 'desktop', 'tablet', 'unknown')
    .default('unknown'),
  
  ipAddress: Joi.string()
    .ip()
    .optional(),
  
  userId: Joi.string()
    .optional()
    .allow('', null),
  
  timestamp: Joi.date()
    .iso()
    .default(() => new Date()),
  
  metadata: Joi.object({
    browser: Joi.string().optional(),
    os: Joi.string().optional(),
    screenSize: Joi.string().optional(),
    userAgent: Joi.string().optional()
  }).optional().default({})
});

// Validation schema for event summary query
const eventSummarySchema = Joi.object({
  event: Joi.string()
    .required()
    .messages({
      'string.empty': 'Event name is required'
    }),
  
  startDate: Joi.date()
    .iso()
    .optional(),
  
  endDate: Joi.date()
    .iso()
    .optional()
    .when('startDate', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('startDate')).messages({
        'date.min': 'End date must be after start date'
      })
    }),
  
  app_id: Joi.string()
    .uuid()
    .optional()
});

// Validation schema for user stats query
const userStatsSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'string.empty': 'User ID is required'
    }),
  
  app_id: Joi.string()
    .uuid()
    .optional()
});

// Middleware to validate event collection
const validateEventCollection = (req, res, next) => {
  const { error, value } = eventCollectionSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  req.validatedData = value;
  next();
};

// Middleware to validate event summary query
const validateEventSummary = (req, res, next) => {
  const { error, value } = eventSummarySchema.validate(req.query, {
    abortEarly: false
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  req.validatedQuery = value;
  next();
};

// Middleware to validate user stats query
const validateUserStats = (req, res, next) => {
  const { error, value } = userStatsSchema.validate(req.query, {
    abortEarly: false
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = {
  validateEventCollection,
  validateEventSummary,
  validateUserStats
};