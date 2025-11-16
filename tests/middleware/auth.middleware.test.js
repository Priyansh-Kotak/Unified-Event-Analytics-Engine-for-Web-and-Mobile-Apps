const {
  authenticateUser,
  authenticateApiKey,
} = require("../../src/middleware/auth.middleware");
const { User, App } = require("../../src/models");
const {
  createTestUser,
  createTestApp,
  generateTestToken,
  cleanupTestData,
} = require("../helpers/testHelpers");

describe("Authentication Middleware", () => {
  let testUser;
  let testApp;
  let validToken;

  beforeAll(async () => {
    await cleanupTestData();
    testUser = await createTestUser();
    testApp = await createTestApp(testUser.id);
    validToken = generateTestToken(testUser.id);
  }, 30000);

  afterAll(async () => {
    await cleanupTestData();
  }, 30000);

  describe("authenticateUser", () => {
    it("should authenticate valid JWT token", async () => {
      const req = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await authenticateUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.email).toBe(testUser.email);
    });

    it("should reject request without token", async () => {
      const req = {
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject invalid token", async () => {
      const req = {
        headers: {
          authorization: "Bearer invalid_token_here",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await authenticateUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("authenticateApiKey", () => {
    it("should authenticate valid API key", async () => {
      const req = {
        headers: {
          "x-api-key": testApp.apiKey,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await authenticateApiKey(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.app).toBeDefined();
      expect(req.app.id).toBe(testApp.id);
    });

    it("should reject request without API key", async () => {
      const req = {
        headers: {},
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await authenticateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it("should reject invalid API key", async () => {
      const req = {
        headers: {
          "x-api-key": "ak_" + "a".repeat(64), // Valid format but doesn't exist
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      };
      const next = jest.fn();

      await authenticateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
