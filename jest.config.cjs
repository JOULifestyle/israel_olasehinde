// jest.config.cjs
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testTimeout: 20000,
   coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/models/index.js",   // exclude boilerplate
    "!src/server.js",         // exclude entrypoint
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
      statements: 70,
    },
  },
};
