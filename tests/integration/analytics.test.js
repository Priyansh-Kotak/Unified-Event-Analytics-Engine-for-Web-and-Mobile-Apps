const request = require("supertest");
const app = require("../../src/app");
const { Event } = require("../../src/models");
const {
  createTestUser,
  createTestApp,
  generateTestToken,
  cleanupTestData,
} = require("../helpers/testHelpers");

describe("Analytics Endpoints", () => {
  let testUser;
  let testApp;
  let validToken;
  let apiKey;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser();
    testApp = await createTestApp(testUser.id);
    validToken = generateTestToken(testUser.id);
    apiKey = testApp.apiKey;
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  }, 30000);

  describe("POST /api/analytics/collect", () => {
    it("should collect an event with valid API key", async () => {
      const eventData = {
        event: "test_event",
        url: "https://example.com/page",
        referrer: "https://google.com",
        device: "mobile",
        userId: "user123",
        metadata: {
          browser: "Chrome",
          os: "Android",
        },
      };

      const response = await request(app)
        .post("/api/analytics/collect")
        .set("x-api-key", apiKey)
        .send(eventData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBe("test_event");
    });

    it("should return 401 without API key", async () => {
      const eventData = {
        event: "test_event",
        url: "https://example.com/page",
      };

      const response = await request(app)
        .post("/api/analytics/collect")
        .send(eventData);

      expect(response.status).toBe(401);
    });

    it("should return 400 for invalid event data", async () => {
      const eventData = {
        event: "test_event",
        // missing required 'url' field
      };

      const response = await request(app)
        .post("/api/analytics/collect")
        .set("x-api-key", apiKey)
        .send(eventData);

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("GET /api/analytics/event-summary", () => {
    beforeEach(async () => {
      // Create some test events with proper await
      await Event.create({
        appId: testApp.id,
        event: "login_click",
        url: "https://example.com",
        device: "mobile",
        userId: "user1",
        timestamp: new Date(),
      });

      await Event.create({
        appId: testApp.id,
        event: "login_click",
        url: "https://example.com",
        device: "desktop",
        userId: "user2",
        timestamp: new Date(),
      });

      // Small delay to ensure data is persisted
      await new Promise((resolve) => setTimeout(resolve, 100));
    }, 30000);

    it("should return event summary", async () => {
      const response = await request(app)
        .get("/api/analytics/event-summary")
        .query({ event: "login_click" })
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.event).toBe("login_click");
      expect(response.body.data.count).toBeGreaterThanOrEqual(2);
    });

    it("should return 400 for missing event parameter", async () => {
      const response = await request(app)
        .get("/api/analytics/event-summary")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app)
        .get("/api/analytics/event-summary")
        .query({ event: "login_click" });

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/analytics/user-stats", () => {
    beforeEach(async () => {
      await Event.create({
        appId: testApp.id,
        event: "click",
        url: "https://example.com",
        device: "mobile",
        userId: "user1",
        timestamp: new Date(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }, 30000);

    it("should return user statistics", async () => {
      const response = await request(app)
        .get("/api/analytics/user-stats")
        .query({ userId: "user1" })
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe("user1");
      expect(response.body.data.totalEvents).toBeGreaterThanOrEqual(1);
    });

    it("should return 400 for missing userId parameter", async () => {
      const response = await request(app)
        .get("/api/analytics/user-stats")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(400);
    });
  });

  describe("GET /api/analytics/dashboard", () => {
    beforeEach(async () => {
      // Create some events for dashboard
      await Event.create({
        appId: testApp.id,
        event: "test1",
        url: "https://example.com",
        device: "mobile",
        userId: "user1",
        timestamp: new Date(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }, 30000);

    it("should return dashboard overview", async () => {
      const response = await request(app)
        .get("/api/analytics/dashboard")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEvents).toBeDefined();
      expect(response.body.data.uniqueUsers).toBeDefined();
      expect(response.body.data.topEvents).toBeDefined();
      expect(Array.isArray(response.body.data.topEvents)).toBe(true);
      expect(Array.isArray(response.body.data.deviceBreakdown)).toBe(true);
    });
  });

  describe("GET /api/analytics/top-events/:appId", () => {
    beforeEach(async () => {
      await Event.create({
        appId: testApp.id,
        event: "click",
        url: "https://example.com",
        device: "mobile",
        userId: "user1",
        timestamp: new Date(),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));
    }, 30000);

    it("should return top events for app", async () => {
      const response = await request(app)
        .get(`/api/analytics/top-events/${testApp.id}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should return 403 for other users app", async () => {
      // Create another user and their app
      const otherUser = await createTestUser({
        email: `other${Date.now()}@test.com`,
        googleId: `other${Date.now()}`,
      });
      const otherApp = await createTestApp(otherUser.id);

      const response = await request(app)
        .get(`/api/analytics/top-events/${otherApp.id}`)
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(403);
    });
  });
});
