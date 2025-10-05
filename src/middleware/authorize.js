// src/middleware/authorize.js
module.exports = (roles = []) => {
  if (typeof roles === "string") roles = [roles];

  return (req, res, next) => {
    const user = req.user || {};
    if (!roles.length || roles.includes(user.role)) {
      return next();
    }
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  };
};
