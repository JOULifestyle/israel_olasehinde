
module.exports = (res, data, message = "Success", status = 200) => {
  return res.status(status).json({
    status,
    message,
    data,
  });
};
