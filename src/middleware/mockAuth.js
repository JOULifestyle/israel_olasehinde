
module.exports = (req, res, next) => {
  
  req.user = { id: 1, role: req.headers["x-role"] || "employee" };
  next();
};
