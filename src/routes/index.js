const express = require("express");
const departmentController = require("../controllers/departmentController");
const employeeController = require("../controllers/employeeController");
const leaveController = require("../controllers/leaveController");

const router = express.Router();

router.post("/departments", departmentController.create);
router.get("/departments/:id/employees", departmentController.getEmployees);

router.post("/employees", employeeController.create);
router.get("/employees/:id", employeeController.getOne);

router.post("/leave-requests", leaveController.create);

module.exports = router;
