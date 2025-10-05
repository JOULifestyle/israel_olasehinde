const service = require("../services/employeeService");
const response = require("../utils/responseWrapper");
const { validateRequest } = require("../utils/validation");
const createEmployeeSchema = require("../validators/employeeValidator");
const redis = require("../utils/redisClient");

/**
 * Create a new employee
 */
exports.create = async (req, res, next) => {
  try {
    const { name, email, departmentId } = req.body;

    // Validate request data
    await validateRequest(createEmployeeSchema, { name, email, departmentId });

    // Create employee record
    const employee = await service.createEmployee({ name, email, departmentId });

    // ---------------- Cache invalidation ----------------
    try {
      // Invalidate specific employee cache
      const empKey = `employee:${employee.id}`;
      if (await redis.exists(empKey)) {
        await redis.del(empKey);
        console.log(`🧹 Cleared cache for employee ${employee.id}`);
      } else {
        console.log(`ℹ️ No cache found for employee ${employee.id}`);
      }

      // Invalidate all cached pages of department employee list
      const deptKeyPattern = `departmentEmployees:${departmentId}*`;
      const deptKeys = await redis.keys(deptKeyPattern);
      if (deptKeys.length > 0) {
        await redis.del(deptKeys);
        console.log(`🧹 Cleared ${deptKeys.length} department cache entries for department ${departmentId}`);
      } else {
        console.log(`ℹ️ No department cache keys found to invalidate for department ${departmentId}`);
      }
    } catch (cacheErr) {
      console.error("⚠️ Cache invalidation failed:", cacheErr.message);
    }

    // Return success response
    response(res, employee, "Employee created successfully", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Get an employee by ID with leave history
 */
exports.getOne = async (req, res, next) => {
  try {
    const employee = await service.getEmployeeWithLeaves(req.params.id);

    if (!employee) {
      return response(res, null, "Employee not found", 404);
    }

    response(res, employee, "Employee details with leave history");
  } catch (err) {
    next(err);
  }
};
