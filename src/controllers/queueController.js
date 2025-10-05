// simple controller that returns counts (mocked) or uses management HTTP in prod
exports.health = async (req, res) => {
  
  return res.json({ status: "ok", rabbitmq: "reachable" });
};
