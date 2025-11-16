const {
  generateApiKey,
  isValidApiKeyFormat,
} = require("../../src/utils/apiKey.utils");

describe("API Key Utils", () => {
  describe("generateApiKey", () => {
    it("should generate a valid API key", () => {
      const apiKey = generateApiKey();

      expect(apiKey).toBeDefined();
      expect(typeof apiKey).toBe("string");
      expect(apiKey.startsWith("ak_")).toBe(true);
      expect(apiKey.length).toBe(67); // 'ak_' (3) + 64 hex chars
    });

    it("should generate unique API keys", () => {
      const apiKey1 = generateApiKey();
      const apiKey2 = generateApiKey();

      expect(apiKey1).not.toBe(apiKey2);
    });
  });

  describe("isValidApiKeyFormat", () => {
    it("should validate correct API key format", () => {
      const validKey = generateApiKey();
      expect(isValidApiKeyFormat(validKey)).toBe(true);
    });

    it("should reject API key without prefix", () => {
      const invalidKey = "a".repeat(64);
      expect(isValidApiKeyFormat(invalidKey)).toBe(false);
    });

    it("should reject API key with wrong length", () => {
      const invalidKey = "ak_abc123";
      expect(isValidApiKeyFormat(invalidKey)).toBe(false);
    });

    it("should reject API key with invalid characters", () => {
      const invalidKey = "ak_" + "z".repeat(64);
      expect(isValidApiKeyFormat(invalidKey)).toBe(false);
    });
  });
});
