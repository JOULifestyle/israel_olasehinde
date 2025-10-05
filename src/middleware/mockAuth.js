// src/middleware/mockAuth.js
module.exports = (req, res, next) => {
  // Example: attach user role from request header
  req.user = { id: 1, role: req.headers["x-role"] || "employee" };
  next();
};
