// tests/integration/worker.idempotency.test.js
const { initDB, sequelize, Department, Employee, LeaveRequest } = require("../../src/models");
const leaveRepository = require("../../src/repositories/leaveRepository");
const { processLeaveMessage } = require("../../src/workers/leaveConsumer");
const { decideLeaveStatus } = require("../../src/utils/businessRules");

// Mock the exponentialRetry wrapper
jest.mock("../../src/utils/retryStrategies", () => ({
  exponentialRetry: (fn) => async (msg, ack, nack) => {
    try {
      await fn();
      ack();
    } catch (err) {
      nack();
    }
  },
}));

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB();
});

afterAll(async () => {
  await sequelize.close();
  jest.resetAllMocks();
});

test("processLeaveMessage is idempotent with retry wrapper", async () => {
  const dep = await Department.create({ name: "HR" });
  const emp = await Employee.create({ name: "Bob", email: "bob@example.com", departmentId: dep.id });

  const leave = await LeaveRequest.create({
    employeeId: emp.id,
    startDate: "2025-10-10",
    endDate: "2025-10-11",
    status: "PENDING",
  });

  const payload = { id: leave.id };

  // Simulate the wrapper calling the processor (first time)
  let ackCalled = false;
  let nackCalled = false;
  const retryHandler = require("../../src/utils/retryStrategies").exponentialRetry(
    () => processLeaveMessage(payload)
  );
  await retryHandler({}, () => { ackCalled = true }, () => { nackCalled = true });

  const first = await leaveRepository.findById(leave.id);
  expect(first.status).toBe(decideLeaveStatus(first.startDate, first.endDate));
  expect(ackCalled).toBe(true);
  expect(nackCalled).toBe(false);

  // Reset flags
  ackCalled = false;
  nackCalled = false;

  // Process second time (duplicate)
  await retryHandler({}, () => { ackCalled = true }, () => { nackCalled = true });
  const second = await leaveRepository.findById(leave.id);

  // Status should not change
  expect(second.status).toBe(first.status);
  expect(ackCalled).toBe(true);
  expect(nackCalled).toBe(false);
});
