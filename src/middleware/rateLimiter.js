const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,             // max 100 requests per IP per minute
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,  // Disable `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again later."
});

module.exports = apiLimiter;
