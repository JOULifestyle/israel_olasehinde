
const { app, initDB } = require("./app");

initDB().then(() => {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`🚀 Server running on ${port}`));
});
