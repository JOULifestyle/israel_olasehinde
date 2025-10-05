const service = require("../services/departmentService");
const response = require("../utils/responseWrapper");
const redis = require("../utils/redisClient");

// ---------------- CREATE DEPARTMENT ----------------
exports.create = async (req, res, next) => {
  try {
    const department = await service.createDepartment(req.body);

    // Invalidate all department caches
    try {
      const keys = await redis.keys("department:*");
      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`🧹 Cache invalidated for prefix "department:" (${keys.length} keys)`);
      } else {
        console.log("ℹ️ No department cache keys found to invalidate");
      }
    } catch (cacheErr) {
      console.error("⚠️ Cache invalidation failed (department):", cacheErr.message);
    }

    response(res, department, "Department created", 201);
  } catch (err) {
    next(err);
  }
};

// ---------------- GET EMPLOYEES BY DEPARTMENT WITH REDIS CACHE ----------------
exports.getEmployees = async (req, res, next) => {
  try {
    const departmentId = req.params.id;
    const { page = 1, limit = 10 } = req.query;

    const cacheKey = `departmentEmployees:${departmentId}:page:${page}:limit:${limit}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log("🧠 Cache hit for", cacheKey);
      return res.status(200).json(JSON.parse(cached));
    }

    const result = await service.getEmployees(departmentId, +page, +limit);

    const responseBody = {
      status: 200,
      message: "Employees fetched",
      data: result,
    };

    // Cache the response for 60 seconds
    await redis.setex(cacheKey, 60, JSON.stringify(responseBody));
    console.log("💾 Cache set for", cacheKey);

    response(res, result, "Employees fetched");
  } catch (err) {
    next(err);
  }
};
