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

initDB();
app.listen(4000, () => console.log("🚀 Server running on port 4000"));
