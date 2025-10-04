/**
 * Retry strategy implementations
 * Strategy Pattern: pick which one to use in worker
 */

function noRetry(handler) {
  return async (msg, ack, nack) => {
    try {
      await handler();
      ack();
    } catch (err) {
      console.error("❌ NoRetry - failed:", err.message);
      nack();
    }
  };
}

function fixedRetry(handler, { retries = 3, delay = 500 } = {}) {
  return async (msg, ack, nack) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        await handler();
        ack();
        return;
      } catch (err) {
        attempt++;
        console.warn(`⚠️ FixedRetry attempt ${attempt} failed:`, err.message);
        if (attempt < retries) {
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    console.error("❌ FixedRetry exhausted retries");
    nack();
  };
}

function exponentialRetry(handler, { retries = 3, baseDelay = 300 } = {}) {
  return async (msg, ack, nack) => {
    let attempt = 0;
    while (attempt < retries) {
      try {
        await handler();
        ack();
        return;
      } catch (err) {
        attempt++;
        console.warn(`⚠️ ExponentialRetry attempt ${attempt} failed:`, err.message);
        if (attempt < retries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    console.error("❌ ExponentialRetry exhausted retries");
    nack();
  };
}

module.exports = { noRetry, fixedRetry, exponentialRetry };
