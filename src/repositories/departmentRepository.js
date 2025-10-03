const { Department, Employee } = require("../models");

exports.create = (data) => Department.create(data);
exports.findById = (id) => Department.findByPk(id);
exports.getEmployees = (departmentId, offset, limit) => 
  Employee.findAndCountAll({ where: { departmentId }, offset, limit });
