// tests/unit/worker.errorHandling.test.js
jest.mock("amqplib");

const amqp = require("amqplib");
const { startWorker, stopWorker } = require("../../src/workers/leaveConsumer");
const leaveRepository = require("../../src/repositories/leaveRepository");

// Utility to fake channel
function mockChannel() {
  return {
    assertQueue: jest.fn(),
    consume: jest.fn((queue, handler) => {
      mockChannel.consumeHandler = handler;
    }),
    ack: jest.fn(),
    nack: jest.fn(),
    close: jest.fn(),
  };
}

let connection, channel;

beforeEach(() => {
  channel = mockChannel();
  connection = { createChannel: jest.fn().mockResolvedValue(channel), close: jest.fn() };
  amqp.connect.mockResolvedValue(connection);
  jest.spyOn(console, "error").mockImplementation(() => {}); // silence logs
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(async () => {
  jest.restoreAllMocks();
  await stopWorker();
});

test("worker nacks and sends to DLQ when processLeaveMessage fails", async () => {
  // mock leaveRepository to throw during processing
  jest.spyOn(leaveRepository, "findById").mockRejectedValue(new Error("DB fail"));

  await startWorker();

  // Simulate a consumed message
  const msg = { content: Buffer.from(JSON.stringify({ id: 1 })) };
  await mockChannel.consumeHandler(msg);

  // Should nack (→ DLQ)
  expect(channel.nack).toHaveBeenCalledWith(msg, false, false);
});

test("worker acks on successful process", async () => {
  jest.spyOn(leaveRepository, "findById").mockResolvedValue({
    id: 1,
    status: "PENDING",
    startDate: "2025-10-05",
    endDate: "2025-10-06",
  });
  jest.spyOn(leaveRepository, "updateStatus").mockResolvedValue();

  await startWorker();

  const msg = { content: Buffer.from(JSON.stringify({ id: 1 })) };
  await mockChannel.consumeHandler(msg);

  // Should ack on success
  expect(channel.ack).toHaveBeenCalledWith(msg);
});
