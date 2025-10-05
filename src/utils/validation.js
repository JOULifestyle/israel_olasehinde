const validateRequest = async (schema, data) => {
  const { error } = schema.validate(data, { abortEarly: false });
  if (error) {
    const msg = error.details.map(d => d.message).join(", ");
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }
};

module.exports = { validateRequest };
