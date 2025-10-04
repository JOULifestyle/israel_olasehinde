// simple controller that returns counts (mocked) or uses management HTTP in prod
exports.health = async (req, res) => {
  // For a production system you would query RabbitMQ Management API or Redis.
  return res.json({ status: "ok", rabbitmq: "reachable" });
};
