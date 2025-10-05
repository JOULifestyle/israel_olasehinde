const { initDB, sequelize, Department, Employee, LeaveRequest } = require("../../src/models");
const { processLeaveMessage } = require("../../src/workers/leaveConsumer");
const { decideLeaveStatus } = require("../../src/utils/businessRules");
const leaveRepository = require("../../src/repositories/leaveRepository");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB();
});

afterAll(async () => {
  await sequelize.close();
});

test("processLeaveMessage is idempotent", async () => {
  const dep = await Department.create({ name: "HR" });
  const emp = await Employee.create({ name: "Bob", email: "bob@example.com", departmentId: dep.id });
  const leave = await LeaveRequest.create({
    employeeId: emp.id,
    startDate: "2025-10-10",
    endDate: "2025-10-11",
    status: "PENDING",
  });

  const payload = { id: leave.id };

  // Process first time
  await processLeaveMessage(payload);
  const first = await leaveRepository.findById(leave.id);
  expect(first.status).toBe(decideLeaveStatus(first.startDate, first.endDate));

  // Process second time (duplicate)
  await processLeaveMessage(payload);
  const second = await leaveRepository.findById(leave.id);
  expect(second.status).toBe(first.status); // status unchanged
});
