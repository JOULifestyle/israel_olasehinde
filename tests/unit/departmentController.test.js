// tests/unit/departmentController.test.js
const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

const { create, getEmployees } = require("../../src/controllers/departmentController");
const departmentService = require("../../src/services/departmentService");

jest.mock("../../src/services/departmentService");

const app = express();
app.use(bodyParser.json());

// Routes
app.post("/departments", create);
app.get("/departments/:id/employees", getEmployees);

// Error handler to capture errors and send 500
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

describe("Department Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /departments", () => {
    it("should create a department successfully", async () => {
      const payload = { name: "Finance" };
      departmentService.createDepartment.mockResolvedValue({ id: 1, ...payload });

      const res = await request(app).post("/departments").send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        data: { id: 1, name: "Finance" },
        message: "Department created",
        status: 201,
      });
    });

    it("should return 500 if creation fails", async () => {
      departmentService.createDepartment.mockRejectedValue(new Error("Department.name cannot be null"));

      const res = await request(app).post("/departments").send({});

      expect(res.status).toBe(500);
      expect(res.body.error).toContain("cannot be null");
    });
  });

  describe("GET /departments/:id/employees", () => {
    it("should return employees for a department", async () => {
      departmentService.getEmployees.mockResolvedValue([{ id: 1, name: "Alice" }]);

      const res = await request(app).get("/departments/1/employees");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        data: [{ id: 1, name: "Alice" }],
        message: "Employees fetched",
        status: 200,
      });
    });

    it("should handle errors", async () => {
      departmentService.getEmployees.mockRejectedValue(new Error("DB error"));

      const res = await request(app).get("/departments/1/employees");

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("DB error");
    });
  });
});
