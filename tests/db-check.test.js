const { sequelize } = require("../src/models");

describe("Database", () => {
  it("should connect", async () => {
    await expect(sequelize.authenticate()).resolves.not.toThrow();
  });
});
