module.exports = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/jest.setup.js"], // runs before any module
  testTimeout: 20000,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/models/index.js",
    "!src/server.js",
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
