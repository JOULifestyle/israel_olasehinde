const service = require("../services/employeeService");
const response = require("../utils/responseWrapper");

exports.create = async (req, res, next) => {
  try {
    const employee = await service.createEmployee(req.body);
    response(res, employee, "Employee created", 201);
  } catch (err) {
    next(err);
  }
};

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
