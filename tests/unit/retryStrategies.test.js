const { noRetry, fixedRetry, exponentialRetry } = require("../../src/utils/retryStrategies");

describe("Retry strategies", () => {
  const ack = jest.fn();
  const nack = jest.fn();
  const msg = { id: 1 };

  beforeEach(() => {
    ack.mockClear();
    nack.mockClear();
    jest.useRealTimers();
  });

  describe("noRetry", () => {
    test("calls nack on failure", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("fail"));
      const wrapped = noRetry(handler);

      await wrapped(msg, ack, nack);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(ack).not.toHaveBeenCalled();
      expect(nack).toHaveBeenCalledTimes(1);
    });

    test("calls ack on success", async () => {
      const handler = jest.fn().mockResolvedValue("ok");
      const wrapped = noRetry(handler);

      await wrapped(msg, ack, nack);

      expect(handler).toHaveBeenCalledTimes(1);
      expect(ack).toHaveBeenCalledTimes(1);
      expect(nack).not.toHaveBeenCalled();
    });
  });

  describe("fixedRetry", () => {
    jest.useFakeTimers();

    test("retries correct number of times and nacks if all fail", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("fail"));
      const wrapped = fixedRetry(handler, { retries: 3, delay: 10 });

      const promise = wrapped(msg, ack, nack);

      // advance timers for retries
      for (let i = 0; i < 3; i++) {
        jest.advanceTimersByTime(10);
        await Promise.resolve();
      }

      await promise;

      expect(handler).toHaveBeenCalledTimes(3);
      expect(nack).toHaveBeenCalledTimes(1);
      expect(ack).not.toHaveBeenCalled();
    });

    test("succeeds if a retry succeeds", async () => {
      const handler = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce("ok");
      const wrapped = fixedRetry(handler, { retries: 3, delay: 10 });

      const promise = wrapped(msg, ack, nack);
      jest.advanceTimersByTime(10);
      await Promise.resolve();
      await promise;

      expect(handler).toHaveBeenCalledTimes(2);
      expect(ack).toHaveBeenCalledTimes(1);
      expect(nack).not.toHaveBeenCalled();
    });
  });

  describe("exponentialRetry", () => {
    jest.useFakeTimers();

    test("retries with exponential backoff and succeeds", async () => {
      const handler = jest
        .fn()
        .mockRejectedValueOnce(new Error("first fail"))
        .mockResolvedValueOnce("success");
      const wrapped = exponentialRetry(handler, { retries: 3, baseDelay: 10 });

      const promise = wrapped(msg, ack, nack);

      jest.advanceTimersByTime(10); // first retry
      await Promise.resolve();

      await promise;

      expect(handler).toHaveBeenCalledTimes(2);
      expect(ack).toHaveBeenCalled();
      expect(nack).not.toHaveBeenCalled();
    });

    test("fails all retries and nacks", async () => {
      const handler = jest.fn().mockRejectedValue(new Error("fail"));
      const wrapped = exponentialRetry(handler, { retries: 3, baseDelay: 10 });

      const promise = wrapped(msg, ack, nack);

      jest.advanceTimersByTime(10); // attempt 1
      jest.advanceTimersByTime(20); // attempt 2 (10*2)
      jest.advanceTimersByTime(40); // attempt 3 (10*2^2)
      await Promise.resolve();

      await promise;

      expect(handler).toHaveBeenCalledTimes(3);
      expect(nack).toHaveBeenCalled();
      expect(ack).not.toHaveBeenCalled();
    });
  });
});
