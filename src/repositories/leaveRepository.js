const { LeaveRequest } = require("../models");

exports.create = (data) => LeaveRequest.create(data);
exports.updateStatus = (id, status) => 
  LeaveRequest.update({ status }, { where: { id } });
