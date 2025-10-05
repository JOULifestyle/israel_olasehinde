

//  Mock amqplib FIRST — before importing anything else
jest.mock("amqplib", () => ({
  connect: jest.fn().mockRejectedValue(new Error("rabbit fail")),
}));

//  Now import dependencies
const { initDB, sequelize, Department, Employee } = require("../../src/models");
const leaveService = require("../../src/services/leaveService");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB();
});

afterAll(async () => {
  await sequelize.close();
  jest.resetAllMocks();
});

test("leaveService.createLeaveRequest handles RabbitMQ failure gracefully", async () => {
  const dep = await Department.create({ name: "X" });
  const emp = await Employee.create({
    name: "Y",
    email: "y@example.com",
    departmentId: dep.id,
  });

  const leave = await leaveService.createLeaveRequest({
    employeeId: emp.id,
    startDate: "2025-10-05",
    endDate: "2025-10-06",
  });

  expect(leave).toBeDefined();
  expect(leave.status).toBe("PENDING");
});
