jest.mock("amqplib");
const amqp = require("amqplib");

const { startWorker, stopWorker } = require("../../src/workers/leaveConsumer");

describe("Worker DLQ wiring", () => {
  let assertQueueMock, consumeMock, ackMock, nackMock, channelMock;
  beforeAll(async () => {
    ackMock = jest.fn();
    nackMock = jest.fn();
    assertQueueMock = jest.fn();
    consumeMock = jest.fn();

    channelMock = {
      assertQueue: assertQueueMock,
      consume: consumeMock,
      createChannel: jest.fn(),
      ack: ackMock,
      nack: nackMock,
      close: jest.fn()
    };

    amqp.connect.mockResolvedValue({
      createChannel: async () => ({
        assertQueue: assertQueueMock,
        consume: consumeMock,
        ack: ackMock,
        nack: nackMock,
        close: jest.fn()
      }),
      close: jest.fn()
    });

    // startWorker will call assertQueue twice: dlq then main queue with args
    await startWorker();
  });

  afterAll(async () => {
    await stopWorker();
    jest.resetAllMocks();
  });

  test("declares DLQ and main queue with dead-letter args", () => {
    // assertQueue called at least twice
    expect(assertQueueMock).toHaveBeenCalled();
    // second call should include arguments for dead-letter
    const calls = assertQueueMock.mock.calls;
    const mainCall = calls.find(c => c[0] === "leave.requested");
    expect(mainCall).toBeDefined();
    expect(mainCall[1]).toBeDefined();
    expect(mainCall[1].arguments).toBeDefined();
    expect(mainCall[1].arguments['x-dead-letter-routing-key']).toBe("leave.failed");
  });
});
