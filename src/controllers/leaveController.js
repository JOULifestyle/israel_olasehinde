const service = require("../services/leaveService");
const response = require("../utils/responseWrapper");

exports.create = async (req, res, next) => {
  try {
    const leave = await service.createLeaveRequest(req.body);
    response(res, leave, "Leave request submitted", 201);
  } catch (err) {
    next(err);
  }
};
