const leaveRepository = require("../repositories/leaveRepository");
const amqp = require("amqplib");

exports.createLeaveRequest = async (data) => {
  const leave = await leaveRepository.create(data);

  // Publish to RabbitMQ
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  const queue = "leave.requested";
  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(leave)), { persistent: true });

  return leave;
};

exports.updateLeaveStatus = (id, status) => leaveRepository.updateStatus(id, status);
