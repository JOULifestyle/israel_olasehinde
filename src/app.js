const express = require("express");
const { initDB } = require("./models");
const routes = require("./routes");
const apiLimiter = require("./middleware/rateLimiter");

const app = express();
app.use(express.json());

// ✅ Apply rate limiter to all API routes
app.use("/api", apiLimiter);

// ✅ Inject mockAuth automatically during tests
if (process.env.NODE_ENV === "test") {
  console.log("🧪 Using mockAuth middleware for tests");
  const mockAuth = require("./middleware/mockAuth");
  app.use(mockAuth); // 👈 adds req.user with role
} else {
  const authorize = require("./middleware/authorize");
  // Optionally, mount authorize globally or inside specific routes
  // app.use(authorize());
}

// ✅ Main API routes
app.use("/api", routes);

// ✅ Test-only route to trigger middleware errors
if (process.env.NODE_ENV === "test") {
  app.get("/error", (req, res, next) => {
    next(new Error("boom"));
  });
}

// ✅ 404 handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// ✅ Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message,
  });
});

// ✅ Start server only outside test environment
if (process.env.NODE_ENV !== "test") {
  initDB()
    .then(() => {
      const port = process.env.PORT || 4000;
      app.listen(port, () => console.log(`🚀 Server running on ${port}`));
    })
    .catch((err) => {
      console.error("Failed to initialize DB:", err);
      process.exit(1);
    });
}

module.exports = { app, initDB };
