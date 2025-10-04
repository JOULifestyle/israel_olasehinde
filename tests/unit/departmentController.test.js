const request = require("supertest");
const { app, initDB } = require("../../src/app");
const { sequelize } = require("../../src/models");

beforeAll(async () => { process.env.NODE_ENV="test"; await initDB(); });
afterAll(async () => { await sequelize.close(); });

describe("Department controller edge cases", () => {
  test("create department with missing name returns 500", async () => {
    const res = await request(app).post("/api/departments").send({}).expect(500);
    expect(res.body.error).toBeDefined();
  });
});
