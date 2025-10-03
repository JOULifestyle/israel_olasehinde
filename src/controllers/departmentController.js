const service = require("../services/departmentService");
const response = require("../utils/responseWrapper");

exports.create = async (req, res, next) => {
  try {
    const department = await service.createDepartment(req.body);
    response(res, department, "Department created", 201);
  } catch (err) { next(err); }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await service.getEmployees(req.params.id, +page, +limit);
    response(res, result, "Employees fetched");
  } catch (err) { next(err); }
};
