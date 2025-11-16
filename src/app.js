const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session");
const passport = require("./config/passport");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { getSystemHealth } = require("./utils/monitoring");
const {
  requestLogger,
  errorLogger,
} = require("./middleware/logging.middleware");
const logger = require("./utils/logger");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
app.use(requestLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Swagger Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Analytics API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: "none",
      filter: true,
      tryItOutEnabled: true,
    },
  })
);

// Swagger JSON endpoint
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Health check
app.get("/health", async (req, res) => {
  try {
    const health = await getSystemHealth();
    const statusCode = health.status === "healthy" ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Analytics API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
  });
});

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: "Route not found",
    path: req.url,
    method: req.method,
  });
});

// Error logging
app.use(errorLogger);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

// Simple health check (for load balancers)
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

module.exports = app;
