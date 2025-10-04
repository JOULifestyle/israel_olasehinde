const leaveRepository = require("../repositories/leaveRepository");
const amqp = require("amqplib");

exports.createLeaveRequest = async (data) => {
  const leave = await leaveRepository.create(data);

  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    const channel = await connection.createChannel();
    const queue = "leave.requested";

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(leave)), { persistent: true });

    // Close safely if methods exist (some Jest mocks omit them)
    if (channel.close) await channel.close().catch(() => {});
    if (connection.close) await connection.close().catch(() => {});

    console.log("📤 Leave request published to queue");
  } catch (err) {
    console.error("❌ Failed to publish to RabbitMQ:", err.message);
    // Don’t return a different object, just tag the existing one
    leave.publishError = err.message;
  }

  return leave; // always return a leave with status: "PENDING"
};

exports.updateLeaveStatus = (id, status) =>
  leaveRepository.updateStatus(id, status);
