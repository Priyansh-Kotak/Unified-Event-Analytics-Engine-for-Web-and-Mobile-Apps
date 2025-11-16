const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Analytics API Documentation',
      version: '1.0.0',
      description: 'A comprehensive API for collecting and analyzing website/app analytics events. This API allows you to track user interactions, generate insights, and manage API keys.',
      contact: {
        name: 'API Support',
        email: 'support@analytics-api.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://your-production-url.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from Google OAuth'
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'API key for event collection. Get this from /api/auth/register endpoint'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User unique identifier'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            picture: {
              type: 'string',
              format: 'uri',
              description: 'User profile picture URL'
            }
          }
        },
        App: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'App unique identifier'
            },
            name: {
              type: 'string',
              description: 'App name'
            },
            domain: {
              type: 'string',
              format: 'uri',
              description: 'App domain/URL'
            },
            apiKey: {
              type: 'string',
              description: 'API key for event collection'
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the API key is active'
            },
            expiresAt: {
              type: 'string',
              format: 'date-time',
              description: 'API key expiration date'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'App creation timestamp'
            }
          }
        },
        Event: {
          type: 'object',
          required: ['event', 'url'],
          properties: {
            event: {
              type: 'string',
              description: 'Event name/type',
              example: 'login_form_cta_click'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'URL where the event occurred',
              example: 'https://example.com/login'
            },
            referrer: {
              type: 'string',
              format: 'uri',
              description: 'Referrer URL',
              example: 'https://google.com'
            },
            device: {
              type: 'string',
              enum: ['mobile', 'desktop', 'tablet', 'unknown'],
              description: 'Device type',
              example: 'mobile'
            },
            ipAddress: {
              type: 'string',
              description: 'User IP address (auto-captured if not provided)',
              example: '192.168.1.1'
            },
            userId: {
              type: 'string',
              description: 'User identifier (optional)',
              example: 'user123'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Event timestamp (auto-generated if not provided)',
              example: '2024-02-20T12:34:56Z'
            },
            metadata: {
              type: 'object',
              description: 'Additional event metadata',
              properties: {
                browser: {
                  type: 'string',
                  example: 'Chrome'
                },
                os: {
                  type: 'string',
                  example: 'Android'
                },
                screenSize: {
                  type: 'string',
                  example: '1080x1920'
                },
                userAgent: {
                  type: 'string',
                  example: 'Mozilla/5.0...'
                }
              }
            }
          }
        },
        EventSummary: {
          type: 'object',
          properties: {
            event: {
              type: 'string',
              description: 'Event name'
            },
            count: {
              type: 'integer',
              description: 'Total event count'
            },
            uniqueUsers: {
              type: 'integer',
              description: 'Number of unique users'
            },
            deviceData: {
              type: 'object',
              description: 'Breakdown by device type',
              additionalProperties: {
                type: 'integer'
              }
            }
          }
        },
        UserStats: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User identifier'
            },
            totalEvents: {
              type: 'integer',
              description: 'Total events by this user'
            },
            deviceDetails: {
              type: 'object',
              description: 'Device information from latest event'
            },
            ipAddress: {
              type: 'string',
              description: 'IP address from latest event'
            },
            lastDevice: {
              type: 'string',
              description: 'Device type from latest event'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string'
                  },
                  message: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Authentication failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'No token provided. Please authenticate.'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Validation failed',
                details: [
                  {
                    field: 'event',
                    message: 'Event name is required'
                  }
                ]
              }
            }
          }
        },
        RateLimitError: {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '1 minute'
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and API key management endpoints'
      },
      {
        name: 'Analytics',
        description: 'Event collection and analytics endpoints'
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;