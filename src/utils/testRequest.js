
const request = require("supertest");
const { app } = require("../../src/app");

module.exports = (method, url, role = "admin") => {
  return request(app)[method](url).set("x-role", role);
};
