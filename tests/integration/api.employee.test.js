// tests/integration/api.employee.test.js
const request = require("supertest");
const { app, initDB } = require("../../src/app");
const { sequelize } = require("../../src/models");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB(); // sync in-memory sqlite
});

afterAll(async () => {
  await sequelize.close();
});

describe("Employee API integration", () => {
  test("create department, create employee, get employee with leaves", async () => {
    // create department
    const depRes = await request(app)
      .post("/api/departments")
      .send({ name: "Engineering" })
      .expect(201);

    const dep = depRes.body.data;

    // create employee
    const empRes = await request(app)
      .post("/api/employees")
      .send({
        name: "Alice",
        email: "alice@example.com",
        departmentId: dep.id,
      })
      .expect(201);

    const emp = empRes.body.data;
    expect(emp.email).toBe("alice@example.com");

    // get employee
    const getRes = await request(app).get(`/api/employees/${emp.id}`).expect(200);
    const returned = getRes.body.data;
    expect(returned.email).toBe("alice@example.com");
    // leave list should be an array (empty)
    expect(Array.isArray(returned.LeaveRequests)).toBe(true);
  });
});
