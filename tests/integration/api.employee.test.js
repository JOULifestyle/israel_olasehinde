// tests/integration/api.employee.test.js
const { app, initDB } = require("../../src/app");
const { sequelize } = require("../../src/models");
const req = require("../../src/utils/testRequest"); // ✅ new helper wrapper

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB(); // sync in-memory DB
});

afterAll(async () => {
  await sequelize.close();
});

describe("Employee API integration", () => {
  test("create department, create employee, get employee with leaves", async () => {
    // ✅ create department (admin role auto applied)
    const depRes = await req("post", "/api/departments")
      .send({ name: "Engineering" })
      .expect(201);

    const dep = depRes.body.data;

    // ✅ create employee (admin)
    const empRes = await req("post", "/api/employees")
      .send({
        name: "Alice",
        email: "alice@example.com",
        departmentId: dep.id,
      })
      .expect(201);

    const emp = empRes.body.data;
    expect(emp.email).toBe("alice@example.com");

    // ✅ get employee details with leave history
    const getRes = await req("get", `/api/employees/${emp.id}`).expect(200);
    const returned = getRes.body.data;

    expect(returned.email).toBe("alice@example.com");
    expect(Array.isArray(returned.LeaveRequests)).toBe(true);
  });
});
