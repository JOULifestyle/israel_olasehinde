const request = require("supertest");
const express = require("express");

const { create, approve, reject } = require("../../src/controllers/leaveController");
const leaveService = require("../../src/services/leaveService");

jest.mock("../../src/services/leaveService");
jest.mock("../../src/utils/redisClient");
jest.mock("../../src/utils/validation");
jest.mock("ioredis");

const app = express();
app.use(express.json());

// Routes
app.post("/leave-requests", create);
app.patch("/leave-requests/:id/approve", approve);
app.patch("/leave-requests/:id/reject", reject);

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe("Leave Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock redis
    const redis = require("../../src/utils/redisClient");
    redis.exists = jest.fn().mockResolvedValue(1);
    redis.del = jest.fn().mockResolvedValue(1);
    redis.keys = jest.fn().mockResolvedValue([]);

    // Mock validation
    const { validateRequest } = require("../../src/utils/validation");
    validateRequest.mockResolvedValue();
  });

  describe("POST /api/leave-requests", () => {
    it("should create a leave request successfully", async () => {
      const payload = { employeeId: 1, startDate: "2025-10-05T00:00:00.000Z", endDate: "2025-10-06T00:00:00.000Z", departmentId: 1 };
      leaveService.createLeaveRequest.mockResolvedValue({ id: 1, ...payload, status: "PENDING" });

      const res = await request(app).post("/leave-requests").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        data: { id: 1, ...payload, status: "PENDING" },
        message: "Leave request submitted successfully",
        status: 201,
      });
      expect(leaveService.createLeaveRequest).toHaveBeenCalledWith(payload);
    });

    it("should handle validation errors", async () => {
      const { validateRequest } = require("../../src/utils/validation");
      const err = new Error("employeeId is required");
      err.status = 400;
      validateRequest.mockRejectedValue(err);

      const res = await request(app).post("/leave-requests").send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("employeeId is required");
    });

    it("should handle service errors", async () => {
      leaveService.createLeaveRequest.mockRejectedValue(new Error("Service error"));

      const res = await request(app).post("/leave-requests").send({ employeeId: 1, startDate: "2025-10-05T00:00:00.000Z", endDate: "2025-10-06T00:00:00.000Z" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Service error");
    });
  });

  describe("PUT /api/leave-requests/:id/approve", () => {
    it("should approve a pending leave", async () => {
      const leave = { id: 1, employeeId: 1, status: "PENDING" };
      leaveService.getLeaveById.mockResolvedValue(leave);
      leaveService.updateLeaveStatusIfPending = jest.fn().mockResolvedValue(true);

      const res = await request(app).patch("/leave-requests/1/approve");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: { leaveId: "1" },
        message: "Leave 1 approved successfully",
        status: 200,
      });
      expect(leaveService.getLeaveById).toHaveBeenCalledWith("1");
      expect(leaveService.updateLeaveStatusIfPending).toHaveBeenCalledWith("1", "APPROVED");
    });

    it("should return 404 if leave not found", async () => {
      leaveService.getLeaveById.mockResolvedValue(null);

      const res = await request(app).patch("/leave-requests/1/approve");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Leave 1 not found");
    });

    it("should return 409 if leave not pending", async () => {
      const leave = { id: 1, employeeId: 1, status: "APPROVED" };
      leaveService.getLeaveById.mockResolvedValue(leave);

      const res = await request(app).patch("/leave-requests/1/approve");

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Leave 1 already approved");
    });
  });

  describe("PUT /api/leave-requests/:id/reject", () => {
    it("should reject a pending leave", async () => {
      const leave = { id: 1, employeeId: 1, status: "PENDING" };
      leaveService.getLeaveById.mockResolvedValue(leave);
      leaveService.updateLeaveStatusIfPending = jest.fn().mockResolvedValue(true);

      const res = await request(app).patch("/leave-requests/1/reject");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: { leaveId: "1" },
        message: "Leave 1 rejected successfully",
        status: 200,
      });
      expect(leaveService.getLeaveById).toHaveBeenCalledWith("1");
      expect(leaveService.updateLeaveStatusIfPending).toHaveBeenCalledWith("1", "REJECTED");
    });

    it("should return 404 if leave not found", async () => {
      leaveService.getLeaveById.mockResolvedValue(null);

      const res = await request(app).patch("/leave-requests/1/reject");

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Leave 1 not found");
    });

    it("should return 409 if leave not pending", async () => {
      const leave = { id: 1, employeeId: 1, status: "REJECTED" };
      leaveService.getLeaveById.mockResolvedValue(leave);

      const res = await request(app).patch("/leave-requests/1/reject");

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Leave 1 already rejected");
    });
  });
});