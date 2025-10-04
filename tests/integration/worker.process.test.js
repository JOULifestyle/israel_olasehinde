const { processLeaveMessage,startWorker, stopWorker } = require("../../src/workers/leaveConsumer");
const { initDB, LeaveRequest, Employee, Department, sequelize } = require("../../src/models");

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  await initDB();
});

afterAll(async () => {
  await stopWorker(); //  close RabbitMQ if it was started
  await sequelize.close(); //  close DB connection
});

describe("Worker message processing", () => {
  test("auto-approves leave of 2 days or less", async () => {
    const dep = await Department.create({ name: "QA" });
    const emp = await Employee.create({
      name: "TestUser",
      email: "test@example.com",
      departmentId: dep.id,
    });
    const leave = await LeaveRequest.create({
      employeeId: emp.id,
      startDate: "2025-10-05",
      endDate: "2025-10-06", // 2 days
      status: "PENDING",
    });

    await processLeaveMessage(
      { id: leave.id },
      jest.fn(), // ack
      jest.fn()  // nack
    );

    const updated = await LeaveRequest.findByPk(leave.id);
    expect(updated.status).toBe("APPROVED");
  });

  test("leaves >2 days remain PENDING", async () => {
    const dep = await Department.create({ name: "Finance" });
    const emp = await Employee.create({
      name: "Jane",
      email: "jane@example.com",
      departmentId: dep.id,
    });
    const leave = await LeaveRequest.create({
      employeeId: emp.id,
      startDate: "2025-10-05",
      endDate: "2025-10-10", // >2 days
      status: "PENDING",
    });

    await processLeaveMessage(
      { id: leave.id },
      jest.fn(),
      jest.fn()
    );

    const updated = await LeaveRequest.findByPk(leave.id);
    expect(updated.status).toBe("PENDING");
  });

  test("idempotency: does not overwrite already approved", async () => {
    const dep = await Department.create({ name: "Ops" });
    const emp = await Employee.create({
      name: "Idem",
      email: "idem@example.com",
      departmentId: dep.id,
    });
    const leave = await LeaveRequest.create({
      employeeId: emp.id,
      startDate: "2025-10-05",
      endDate: "2025-10-06",
      status: "APPROVED", // already processed
    });

    const ack = jest.fn();
    await processLeaveMessage({ id: leave.id }, ack, jest.fn());

    const updated = await LeaveRequest.findByPk(leave.id);
    expect(updated.status).toBe("APPROVED"); // unchanged
  });
});
