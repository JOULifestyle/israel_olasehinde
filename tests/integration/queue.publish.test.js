jest.mock("amqplib");

const amqp = require("amqplib");
const request = require("supertest");
const { app, initDB } = require("../../src/app");
const { sequelize } = require("../../src/models");

let sendToQueueMock;
let closeChannelMock;
let closeConnectionMock;

beforeAll(async () => {
  process.env.NODE_ENV = "test";

  sendToQueueMock = jest.fn();
  closeChannelMock = jest.fn().mockResolvedValue();
  closeConnectionMock = jest.fn().mockResolvedValue();

  amqp.connect.mockResolvedValue({
    createChannel: async () => ({
      assertQueue: jest.fn().mockResolvedValue(),
      sendToQueue: sendToQueueMock,
      close: closeChannelMock,
    }),
    close: closeConnectionMock,
  });

  await initDB();
});

afterAll(async () => {
  await sequelize.close();
  jest.resetAllMocks();
});

test("creating a leave request publishes message to RabbitMQ", async () => {
  // create department
  const depRes = await request(app)
    .post("/api/departments")
    .send({ name: "HR" })
    .expect(201);
  const dep = depRes.body.data;

  // create employee
  const empRes = await request(app)
    .post("/api/employees")
    .send({ name: "Bob", email: "bob@example.com", departmentId: dep.id })
    .expect(201);
  const emp = empRes.body.data;

  // create leave request
  const leaveRes = await request(app)
    .post("/api/leave-requests")
    .send({ employeeId: emp.id, startDate: "2025-10-05", endDate: "2025-10-06" })
    .expect(201);

  const leave = leaveRes.body.data;
  // ensure DB created PENDING leave
  expect(leave.status).toBe("PENDING");

  // ensure publish called
  expect(sendToQueueMock).toHaveBeenCalled();
  const [queue, buffer] = sendToQueueMock.mock.calls[0];
  expect(queue).toBe("leave.requested");
  const published = JSON.parse(buffer.toString());
  expect(published.id).toBe(leave.id);
});
