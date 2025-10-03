const amqp = require("amqplib");
const leaveService = require("../services/leaveService");

(async () => {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();
  await channel.assertQueue("leave.requested", { durable: true });

  console.log("✅ Worker listening for leave requests...");

  channel.consume("leave.requested", async (msg) => {
    const leave = JSON.parse(msg.content.toString());
    const start = new Date(leave.startDate);
    const end = new Date(leave.endDate);
    const days = (end - start) / (1000 * 60 * 60 * 24) + 1;

    let status = "PENDING";
    if (days <= 2) status = "APPROVED";

    await leaveService.updateLeaveStatus(leave.id, status);
    channel.ack(msg);
  }, { noAck: false });
})();
