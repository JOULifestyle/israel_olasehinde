const Redis = require("ioredis");
const redisHost = process.env.NODE_ENV === "test" ? "127.0.0.1" : (process.env.REDIS_HOST || "redis");
const redis = new Redis({
  host: redisHost,
  port: process.env.REDIS_PORT || 6379,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

module.exports = redis;
