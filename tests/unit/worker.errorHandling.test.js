// tests/unit/worker.errorHandling.test.js
jest.mock("amqplib");
jest.mock("../../src/utils/retryStrategies", () => ({
  exponentialRetry: (fn, opts) => async (msg, onAck, onNack) => {
    await fn(); // simulate processing
    // Ensure next tick so Jest can catch async calls
    await new Promise((res) => setImmediate(res));
    onAck(msg); // simulate successful ack
  },
}));

const amqp = require("amqplib");
const { startWorker, stopWorker } = require("../../src/workers/leaveConsumer");
const leaveRepository = require("../../src/repositories/leaveRepository");

// Utility to fake channel
function mockChannel() {
  const c = {
    assertQueue: jest.fn(),
    consume: jest.fn((queue, handler) => {
      c.consumeHandler = handler;
    }),
    ack: jest.fn(),
    nack: jest.fn(),
    close: jest.fn(),
  };
  return c;
}

let connection, channel;

beforeEach(() => {
  channel = mockChannel();
  connection = { createChannel: jest.fn().mockResolvedValue(channel), close: jest.fn() };
  amqp.connect.mockResolvedValue(connection);

  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(async () => {
  jest.restoreAllMocks();
  await stopWorker(false); // false → do not exit process
});

test("worker nacks and sends to DLQ when processLeaveMessage fails", async () => {
  jest.spyOn(leaveRepository, "findById").mockRejectedValue(new Error("DB fail"));

  await startWorker();

  const msg = { content: Buffer.from(JSON.stringify({ id: 1 })) };
  await channel.consumeHandler(msg); // <-- use channel here

  expect(channel.nack).toHaveBeenCalledWith(msg, false, false);
});

test("worker acks on successful process", async () => {
  jest.spyOn(leaveRepository, "findById").mockResolvedValue({
    id: 1,
    status: "PENDING",
    startDate: "2025-10-05",
    endDate: "2025-10-06",
  });
  jest.spyOn(leaveRepository, "updateStatusIfPending").mockResolvedValue([1]);

  await startWorker();

  const msg = { content: Buffer.from(JSON.stringify({ id: 1 })) };
  await channel.consumeHandler(msg); // <-- use channel here

  expect(channel.ack).toHaveBeenCalledWith(msg);
});
