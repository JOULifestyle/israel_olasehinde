const express = require("express");
const { initDB } = require("./models");
const routes = require("./routes");

const app = express();
app.use(express.json());
app.use("/api", routes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

if (process.env.NODE_ENV !== "test") {
  initDB().then(() => {
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`🚀 Server running on ${port}`));
  });
}

module.exports = { app, initDB };