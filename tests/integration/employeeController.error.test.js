// tests/integration/api.employee.negative.test.js
const request = require("supertest");
const { app, initDB } = require("../../src/app");
const { sequelize } = require("../../src/models");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB();
});

afterAll(async () => {
  await sequelize.close();
});

describe("Employee API - Negative cases", () => {
  test("POST /api/employees missing name returns 400", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("x-role", "admin") // ✅ required for authorization
      .send({ email: "test@example.com", departmentId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/name/i);
  });

  test("POST /api/employees missing email returns 400", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("x-role", "admin") // ✅ required
      .send({ name: "Test", departmentId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/email/i);
  });
});
