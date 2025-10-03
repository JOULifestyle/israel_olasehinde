const { Employee, LeaveRequest } = require("../models");

exports.create = (data) => Employee.create(data);
exports.findByIdWithLeaves = (id) => 
  Employee.findByPk(id, { include: LeaveRequest });
