const jwt = require("jsonwebtoken");
const { User, App, Event } = require("../../src/models");
const { generateApiKey } = require("../../src/utils/apiKey.utils");

// Helper to create a test user
async function createTestUser(userData = {}) {
  const defaultUser = {
    email: `test${Date.now()}${Math.random()}@example.com`,
    googleId: `google${Date.now()}${Math.random()}`,
    name: "Test User",
    picture: "https://example.com/pic.jpg",
  };

  try {
    return await User.create({ ...defaultUser, ...userData });
  } catch (error) {
    console.error("Error creating test user:", error);
    throw error;
  }
}

// Helper to create a test app with API key
async function createTestApp(userId, appData = {}) {
  const defaultApp = {
    userId,
    name: `Test App ${Date.now()}`,
    domain: "https://test-app.com",
    apiKey: generateApiKey(),
    isActive: true,
  };

  try {
    return await App.create({ ...defaultApp, ...appData });
  } catch (error) {
    console.error("Error creating test app:", error);
    throw error;
  }
}

// Helper to generate JWT token for testing
function generateTestToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "test-secret-key", {
    expiresIn: "1h",
  });
}

// Helper to clean up test data
async function cleanupTestData() {
  try {
    await Event.destroy({ where: {}, truncate: true, cascade: true });
    await App.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

module.exports = {
  createTestUser,
  createTestApp,
  generateTestToken,
  cleanupTestData,
};
