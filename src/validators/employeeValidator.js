const Joi = require("joi");

const createEmployeeSchema = Joi.object({
  name: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  departmentId: Joi.number().integer().required()
});

module.exports = createEmployeeSchema;
