const { syncDatabase, sequelize } = require('../src/models');
const { redis } = require('../src/config/redis');

// Silence console during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Use test database
  process.env.DB_NAME = 'analytics_test_db';
  process.env.JWT_SECRET = 'test-secret-key';
  
  try {
    // Sync database
    await syncDatabase();
  } catch (error) {
    console.error('Database sync error:', error);
  }
}, 30000);

// Cleanup after each test
afterEach(async () => {
  // Clear Redis cache after each test
  try {
    await redis.flushall();
  } catch (error) {
    // Ignore Redis errors in tests
  }
});

// Cleanup after all tests
afterAll(async () => {
  try {
    // Close database connection
    await sequelize.close();
    
    // Close Redis connection
    await redis.quit();
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 30000);