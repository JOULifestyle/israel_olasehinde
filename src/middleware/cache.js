const redis = require("../utils/redisClient");

/**
 * Cache middleware
 * @param {string|function} keyPrefix - string prefix or function(req) returning a key
 */
module.exports = (keyPrefix) => async (req, res, next) => {
  try {
    const key =
      typeof keyPrefix === "function"
        ? keyPrefix(req)
        : `${keyPrefix}:${req.params.id || ""}`;

    // Try to fetch from Redis
    const cached = await redis.get(key);
    if (cached) {
      console.log("🧠 Cache hit for", key);
      return res.status(200).json(JSON.parse(cached));
    }

    // Capture original res.json to store in cache
    const originalJson = res.json.bind(res);
    res.json = async (body) => {
      if (res.statusCode === 200) {
        await redis.setex(key, 60, JSON.stringify(body)); // cache 60 seconds
        console.log("💾 Cache set for", key);
      }
      return await originalJson(body);
    };

    next();
  } catch (err) {
    next(err);
  }
};
