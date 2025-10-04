const { noRetry, fixedRetry, exponentialRetry } = require("../../src/utils/retryStrategies");

describe("Retry strategies", () => {
  const ack = jest.fn();
  const nack = jest.fn();
  const msg = { id: 1 };

  beforeEach(() => {
    ack.mockClear();
    nack.mockClear();
  });

  test("noRetry calls nack on failure", async () => {
    const handler = jest.fn().mockRejectedValue(new Error("fail"));
    const wrapped = noRetry(handler);

    await wrapped(msg, ack, nack);

    expect(handler).toHaveBeenCalled();
    expect(ack).not.toHaveBeenCalled();
    expect(nack).toHaveBeenCalled();
  });

  test("fixedRetry retries 3 times then nacks", async () => {
    const handler = jest.fn().mockRejectedValue(new Error("fail"));
    const wrapped = fixedRetry(handler, { retries: 3, delay: 10 });

    await wrapped(msg, ack, nack);

    expect(handler).toHaveBeenCalledTimes(3);
    expect(nack).toHaveBeenCalled();
  });

  test("exponentialRetry succeeds on second try", async () => {
    const handler = jest
      .fn()
      .mockRejectedValueOnce(new Error("first fail"))
      .mockResolvedValueOnce("success");
    const wrapped = exponentialRetry(handler, { retries: 3, baseDelay: 10 });

    await wrapped(msg, ack, nack);

    expect(handler).toHaveBeenCalledTimes(2);
    expect(nack).not.toHaveBeenCalled();
  });
});
