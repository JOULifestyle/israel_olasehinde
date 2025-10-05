
const express = require("express");
const request = require("supertest");

describe("App Error Middleware", () => {
  let app;

  beforeEach(() => {
    // Create a fresh Express app for each test
    app = express();

    // JSON parser
    app.use(express.json());

    // Route to trigger a 500 error
    app.get("/error-test", (req, res, next) => {
      next(new Error("boom"));
    });

    // 404 handler (for unmatched routes)
    app.use((req, res, next) => {
      const err = new Error("Not Found");
      err.status = 404;
      next(err);
    });

    // Centralized error handler
    app.use((err, req, res, next) => {
      res.status(err.status || 500).json({
        status: err.status || 500,
        message: err.message,
      });
    });
  });

  test("handles internal errors via middleware (500)", async () => {
    const res = await request(app).get("/error-test");

    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty("status", 500);
    expect(res.body).toHaveProperty("message", "boom");
  });

  test("handles 404 errors via middleware", async () => {
    const res = await request(app).get("/non-existent-route");

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("status", 404);
    expect(res.body).toHaveProperty("message", "Not Found");
  });
});
