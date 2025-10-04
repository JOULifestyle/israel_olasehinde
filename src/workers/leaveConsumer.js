// src/workers/leaveConsumer.js
const amqp = require("amqplib");
const { decideLeaveStatus } = require("../utils/businessRules");
const leaveRepository = require("../repositories/leaveRepository");
const { exponentialRetry } = require("../utils/retryStrategies");

let connection = null;
let channel = null;

/**
 * Process a leave message
 */
async function processLeaveMessage(payload) {
  const leaveId = payload.id;
  const existing = await leaveRepository.findById(leaveId);
  if (!existing) return; // message references nonexistent record
  if (existing.status !== "PENDING") return; // idempotency
  const status = decideLeaveStatus(existing.startDate, existing.endDate);
  await leaveRepository.updateStatus(leaveId, status);
}

/**
 * Connect to RabbitMQ with retries
 */
async function connectWithRetry(rabbitUrl, retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      const conn = await amqp.connect(rabbitUrl);
      return conn;
    } catch (err) {
      console.error(`RabbitMQ connection attempt ${i + 1} failed:`, err.message);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw new Error("Failed to connect to RabbitMQ after multiple attempts");
}

/**
 * Start the worker
 */
async function startWorker() {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost";

  try {
    connection = await connectWithRetry(rabbitUrl);
    channel = await connection.createChannel();

    const queue = "leave.requested";
    const dlq = "leave.failed";

    await channel.assertQueue(dlq, { durable: true });
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": dlq,
      },
    });

    console.log("✅ Worker listening for leave requests...");

    channel.consume(
      queue,
      async (msg) => {
        if (!msg) return;

        let payload;
        try {
          payload = JSON.parse(msg.content.toString());
        } catch (err) {
          console.error("Invalid message payload, sending to DLQ:", err);
          channel.nack(msg, false, false);
          return;
        }

        const retryHandler = exponentialRetry(
          () => processLeaveMessage(payload),
          { retries: 3, baseDelay: 200 }
        );

        try {
          await retryHandler(
            msg,
            () => channel.ack(msg),
            () => channel.nack(msg, false, false)
          );
        } catch (err) {
          console.error("Unexpected error in retryHandler, sending to DLQ:", err);
          try {
            channel.nack(msg, false, false);
          } catch (e) {
            console.error("Failed to nack message:", e);
          }
        }
      },
      { noAck: false }
    );

    // Keep Node alive
    process.on("SIGINT", () => stopWorker(true));
    process.on("SIGTERM", () => stopWorker(true));
  } catch (err) {
    console.error("Failed to start worker:", err);
    stopWorker(true, 1);
  }
}

/**
 * Stop the worker
 * @param {boolean} exitNode - whether to call process.exit (true in production, false in tests)
 * @param {number} code - exit code if exiting
 */
async function stopWorker(exitNode = false, code = 0) {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log("🛑 Worker stopped gracefully");

    if (exitNode) {
      process.exit(code);
    }
  } catch (err) {
    console.error("Error stopping worker:", err);
    if (exitNode) process.exit(1);
  }
}

// auto-start if this file is run directly
if (require.main === module) startWorker();

module.exports = { startWorker, stopWorker, processLeaveMessage };
