const leaveService = require("../services/leaveService");
const response = require("../utils/responseWrapper");
const { validateRequest } = require("../utils/validation");
const createLeaveSchema = require("../validators/leaveValidator");
const redis = require("../utils/redisClient");

// ---------------- CREATE LEAVE REQUEST ----------------
exports.create = async (req, res, next) => {
  try {
    const { employeeId, startDate, endDate, departmentId } = req.body;

    // 1️⃣ Validate input
    await validateRequest(createLeaveSchema, req.body);

    // 2️⃣ Create leave request (DB + RabbitMQ async + auto-approve)
    const leave = await leaveService.createLeaveRequest({ employeeId, startDate, endDate });

    // 3️⃣ Cache invalidation (async, non-blocking)
    (async () => {
      try {
        const empKey = `employee:${employeeId}`;
        if (await redis.exists(empKey)) await redis.del(empKey);

        if (departmentId) {
          const deptKeyPattern = `departmentEmployees:${departmentId}*`;
          const deptKeys = await redis.keys(deptKeyPattern);
          if (deptKeys.length > 0) await redis.del(deptKeys);
        }
      } catch (cacheErr) {
        console.error("⚠️ Cache invalidation failed (leave):", cacheErr.message);
      }
    })();

    // 4️⃣ Respond immediately
    response(res, leave, "Leave request submitted successfully", 201);
  } catch (err) {
    next(err);
  }
};

// ---------------- APPROVE LEAVE ----------------
exports.approve = async (req, res, next) => {
  try {
    const leaveId = req.params.id;

    // Fetch leave first (auto-approval applies inside service)
    const leave = await leaveService.getLeaveById(leaveId);
    if (!leave) {
      return response(res, null, `Leave ${leaveId} not found`, 404);
    }

    // Only allow if PENDING
    if (leave.status !== "PENDING") {
      return response(res, null, `Leave ${leaveId} already ${leave.status.toLowerCase()}`, 409);
    }

    // Idempotent update
    await leaveService.updateLeaveStatusIfPending(leaveId, "APPROVED");

    // Cache invalidation
    const empKey = `employee:${leave.employeeId}`;
    if (await redis.exists(empKey)) await redis.del(empKey);

    response(res, { leaveId }, `Leave ${leaveId} approved successfully`);
  } catch (err) {
    next(err);
  }
};

// ---------------- REJECT LEAVE ----------------
exports.reject = async (req, res, next) => {
  try {
    const leaveId = req.params.id;

    // Fetch leave first (auto-approval applies inside service)
    const leave = await leaveService.getLeaveById(leaveId);
    if (!leave) {
      return response(res, null, `Leave ${leaveId} not found`, 404);
    }

    // Only allow if PENDING
    if (leave.status !== "PENDING") {
      return response(res, null, `Leave ${leaveId} already ${leave.status.toLowerCase()}`, 409);
    }

    // Idempotent update
    await leaveService.updateLeaveStatusIfPending(leaveId, "REJECTED");

    // Cache invalidation
    const empKey = `employee:${leave.employeeId}`;
    if (await redis.exists(empKey)) await redis.del(empKey);

    response(res, { leaveId }, `Leave ${leaveId} rejected successfully`);
  } catch (err) {
    next(err);
  }
};
