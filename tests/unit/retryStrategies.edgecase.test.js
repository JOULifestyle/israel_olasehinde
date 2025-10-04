// tests/unit/retryStrategies.edgecase.test.js
const { fixedRetry } = require("../../src/utils/retryStrategies");

describe("retryStrategies edge case", () => {
  test("fixedRetry immediately fails with 0 retries", async () => {
    const fn = jest.fn().mockRejectedValue(new Error("fail"));
    const ack = jest.fn();
    const nack = jest.fn();

    const handler = fixedRetry(fn, { retries: 0, delay: 10 });
    await handler({}, ack, nack);

    expect(nack).toHaveBeenCalled();
    expect(ack).not.toHaveBeenCalled();
  });
});
