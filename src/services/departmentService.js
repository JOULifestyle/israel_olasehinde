const departmentRepository = require("../repositories/departmentRepository");

exports.createDepartment = (data) => departmentRepository.create(data);
exports.getEmployees = (id, page, limit) => {
  const offset = (page - 1) * limit;
  return departmentRepository.getEmployees(id, offset, limit);
};
