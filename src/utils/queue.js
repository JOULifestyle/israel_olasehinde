const amqp = require("amqplib");

let connection;
let channel;
const QUEUE_NAME = "leave.requested";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";
const RECONNECT_DELAY = 5000; // 5 seconds
let isConnecting = false;

async function initQueue() {
  if (channel) return channel;        // already connected
  if (isConnecting) return null;      // prevent multiple parallel attempts
  isConnecting = true;

  try {
    if (!connection) {
      connection = await amqp.connect(RABBITMQ_URL);

      // handle unexpected connection errors
      connection.on("error", (err) => {
        console.error("❌ RabbitMQ connection error:", err.message);
        connection = null;
        channel = null;
        setTimeout(initQueue, RECONNECT_DELAY);
      });

      connection.on("close", () => {
        console.warn("⚠️ RabbitMQ connection closed. Reconnecting...");
        connection = null;
        channel = null;
        setTimeout(initQueue, RECONNECT_DELAY);
      });
    }

    channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    console.log("✅ RabbitMQ connection ready");
    return channel;
  } catch (err) {
    console.error("❌ Failed to connect to RabbitMQ:", err.message);
    connection = null;
    channel = null;
    // wait before retrying
    await new Promise((resolve) => setTimeout(resolve, RECONNECT_DELAY));
    return null; // return null instead of recursive call
  } finally {
    isConnecting = false;
  }
}

async function publishLeave(leave) {
  try {
    const ch = await initQueue();
    if (!ch) {
      console.warn("⚠️ Cannot publish leave, RabbitMQ not connected");
      return;
    }
    ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(leave)), { persistent: true });
    console.log("📤 Leave request published to queue");
  } catch (err) {
    console.error("❌ Could not publish leave to RabbitMQ:", err.message);
    // Do not throw; API should still succeed
  }
}

module.exports = { publishLeave };
