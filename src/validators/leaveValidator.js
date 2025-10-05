const Joi = require("joi");

const createLeaveSchema = Joi.object({
  employeeId: Joi.number().integer().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().required(),
  reason: Joi.string().optional().allow(""),
});

module.exports = createLeaveSchema;
