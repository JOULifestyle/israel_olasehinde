const employeeRepository = require("../repositories/employeeRepository");

exports.createEmployee = (data) => employeeRepository.create(data);
exports.getEmployeeWithLeaves = (id) => employeeRepository.findByIdWithLeaves(id);
