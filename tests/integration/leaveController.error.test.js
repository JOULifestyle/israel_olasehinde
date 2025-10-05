// tests/integration/api.leave.negative.test.js
const request = require("supertest");
const { app, initDB } = require("../../src/app");
const { sequelize, Department, Employee } = require("../../src/models");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB();
});

afterAll(async () => {
  await sequelize.close();
});

describe("LeaveRequest API - Negative cases", () => {
  let employee;

  beforeAll(async () => {
    const dep = await Department.create({ name: "HR" });
    employee = await Employee.create({
      name: "Alice",
      email: "alice@example.com",
      departmentId: dep.id,
    });
  });

  test("POST /api/leave-requests missing employeeId returns 400", async () => {
    const res = await request(app)
      .post("/api/leave-requests")
      .set("x-role", "admin") // ✅ required for auth
      .send({ startDate: "2025-10-05", endDate: "2025-10-06" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/employee/i);
  });

  test("POST /api/leave-requests invalid dates returns 400", async () => {
    const res = await request(app)
      .post("/api/leave-requests")
      .set("x-role", "admin") // ✅ required
      .send({
        employeeId: employee.id,
        startDate: "invalid",
        endDate: "2025-10-06",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/date/i);
  });
});
