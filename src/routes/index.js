const express = require("express");
const departmentController = require("../controllers/departmentController");
const employeeController = require("../controllers/employeeController");
const leaveController = require("../controllers/leaveController");
const queueController = require("../controllers/queueController");

const cache = require("../middleware/cache");
const authorize = require("../middleware/authorize");
const mockAuth = require("../middleware/mockAuth");

const router = express.Router();

// 🧩 Apply mock auth globally for demo (later replace with JWT auth)
router.use(mockAuth);

// ---------------- DEPARTMENT ----------------
router.post(
  "/departments",
  authorize("admin"),
  departmentController.create
);

router.get(
  "/departments/:id/employees",
  cache((req) => `departmentEmployees:${req.params.id}`),
  departmentController.getEmployees
);

// ---------------- EMPLOYEES ----------------
router.post(
  "/employees",
  authorize(["admin", "hr"]),
  employeeController.create
);

router.get(
  "/employees/:id",
  cache((req) => `employee:${req.params.id}`),
  employeeController.getOne
);

// ---------------- LEAVE REQUESTS ----------------
router.post(
  "/leave-requests",
  authorize(["admin", "employee"]),
  leaveController.create
);

// ---------------- APPROVE LEAVE ----------------
router.patch(
  "/leave-requests/:id/approve",
  authorize("admin"),
  leaveController.approve
);

// ---------------- REJECT LEAVE ----------------
router.patch(
  "/leave-requests/:id/reject",
  authorize("admin"),
  leaveController.reject
);

// ---------------- HEALTH CHECK ----------------
router.get("/health", queueController.health);

module.exports = router;
