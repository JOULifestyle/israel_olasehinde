// src/workers/leaveConsumer.js
const amqp = require("amqplib");
const { decideLeaveStatus } = require("../utils/businessRules");
const leaveRepository = require("../repositories/leaveRepository");
const { exponentialRetry } = require("../utils/retryStrategies");

let connection = null;
let channel = null;

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
 * Starts the RabbitMQ worker with retry + DLQ support.
 */
async function startWorker() {
  const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost";
  connection = await amqp.connect(rabbitUrl);
  channel = await connection.createChannel();

  const queue = "leave.requested";
  const dlq = "leave.failed";

  // Ensure DLQ exists first
  await channel.assertQueue(dlq, { durable: true });

  // Main queue configured to dead-letter to `leave.failed`
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
        // invalid message → nack without requeue (goes to DLQ)
        channel.nack(msg, false, false);
        return;
      }

      // Wrap business logic with retry strategy (wrapper expects (msg, ack, nack))
      const retryHandler = exponentialRetry(
        () => processLeaveMessage(payload),
        { retries: 3, baseDelay: 200 }
      );

      // Pass ack/nack callbacks to the wrapper so it controls message acking
      try {
        await retryHandler(
          msg,
          () => channel.ack(msg),
          () => channel.nack(msg, false, false)
        );
      } catch (err) {
        // In case the wrapper throws unexpectedly, ensure message goes to DLQ
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
