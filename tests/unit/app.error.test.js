// tests/unit/app.error.test.js
const request = require("supertest");
const { app } = require("../../src/app");


test("handles internal errors via middleware", async () => {
  const { app } = require("../../src/app"); // import fresh app each time
  app.get("/error", (req, res, next) => {
    next(new Error("boom"));
  });
  const res = await request(app).get("/error");
  expect(res.statusCode).toBe(500);
  expect(res.body).toHaveProperty("error", "boom");
});