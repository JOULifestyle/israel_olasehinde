// src/workers/leaveConsumer.js
const amqp = require("amqplib");
const { decideLeaveStatus } = require("../utils/businessRules");
const leaveRepository = require("../repositories/leaveRepository");
const { exponentialRetry } = require("../utils/retryStrategies");

let connection, channel;

/**
 * Core message processor (business logic only).
 * Testable in isolation without RabbitMQ.
 */
async function processLeaveMessage(payload) {
  const leaveId = payload.id;
  const existing = await leaveRepository.findById(leaveId);

  if (!existing) return; // message references nonexistent record

  // idempotency check
  if (existing.status !== "PENDING") return;

  const status = decideLeaveStatus(existing.startDate, existing.endDate);
  await leaveRepository.updateStatus(leaveId, status);
}

/**
 * Starts the RabbitMQ worker with retry support.
 */
async function startWorker() {
  connection = await amqp.connect("amqp://localhost");
  channel = await connection.createChannel();
  const queue = "leave.requested";

  await channel.assertQueue(queue, { durable: true });

  console.log("✅ Worker listening for leave requests...");

  channel.consume(
    queue,
    async (msg) => {
      const payload = JSON.parse(msg.content.toString());

      // Wrap business logic with retry
      const retryHandler = exponentialRetry(
        () => processLeaveMessage(payload),
        { retries: 3, baseDelay: 200 } // 3 attempts, exponential backoff
      );

      try {
        await retryHandler();
        channel.ack(msg); // success → ack
      } catch (err) {
        console.error("❌ Message failed after retries:", err);
        // Send to DLQ (here: nack without requeue)
        channel.nack(msg, false, false);
      }
    },
    { noAck: false }
  );
}

/**
 * Gracefully stops the worker.
 */
async function stopWorker() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log("🛑 Worker stopped gracefully");
  } catch (err) {
    console.error("Error stopping worker:", err);
  }
}

module.exports = { startWorker, stopWorker, processLeaveMessage };
