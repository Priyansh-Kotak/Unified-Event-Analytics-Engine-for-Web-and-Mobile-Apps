const request = require("supertest");
const app = require("../../src/app");
const {
  createTestUser,
  createTestApp,
  generateTestToken,
  cleanupTestData,
} = require("../helpers/testHelpers");

describe("Auth Endpoints", () => {
  let testUser;
  let validToken;

  beforeEach(async () => {
    await cleanupTestData();
    testUser = await createTestUser();
    validToken = generateTestToken(testUser.id);
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  }, 30000);

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it("should return 401 without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new app", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "Test App Integration",
          domain: "https://test-app-integration.com",
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKey).toBeDefined();
      expect(response.body.data.name).toBe("Test App Integration");
    });

    it("should return 400 for missing fields", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          name: "Test App",
          // missing domain
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it("should return 401 without authentication", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Test App",
        domain: "https://test-app.com",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/auth/revoke", () => {
    it("should revoke an API key", async () => {
      // First create an app
      const testApp = await createTestApp(testUser.id);

      const response = await request(app)
        .post("/api/auth/revoke")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          appId: testApp.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isActive).toBe(false);
    });

    it("should return 400 for missing appId", async () => {
      const response = await request(app)
        .post("/api/auth/revoke")
        .set("Authorization", `Bearer ${validToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("POST /api/auth/regenerate", () => {
    it("should regenerate an API key", async () => {
      // First create an app
      const testApp = await createTestApp(testUser.id);
      const oldApiKey = testApp.apiKey;

      const response = await request(app)
        .post("/api/auth/regenerate")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          appId: testApp.id,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.apiKey).toBeDefined();
      expect(response.body.data.apiKey).not.toBe(oldApiKey);
    });

    it("should return 404 for non-existent app", async () => {
      const response = await request(app)
        .post("/api/auth/regenerate")
        .set("Authorization", `Bearer ${validToken}`)
        .send({
          appId: "00000000-0000-0000-0000-000000000000",
        });

      expect(response.status).toBe(404);
    });
  });
});
