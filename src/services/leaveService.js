const leaveRepository = require("../repositories/leaveRepository");
const amqp = require("amqplib");

exports.createLeaveRequest = async (data) => {
  const leave = await leaveRepository.create(data);

  if (!leave) return null;

  let connection;
  let channel;
  const queue = "leave.requested";

  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || "amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(leave)), { persistent: true });

    console.log("📤 Leave request published to queue");
  } catch (err) {
    console.error("❌ Failed to publish to RabbitMQ:", err.message);
    leave.publishError = err.message;
  } finally {
    if (channel && channel.close) await channel.close().catch(() => {});
    if (connection && connection.close) await connection.close().catch(() => {});
  }

  return leave;
};

exports.updateLeaveStatus = (id, status) =>
  leaveRepository.updateStatus(id, status);
