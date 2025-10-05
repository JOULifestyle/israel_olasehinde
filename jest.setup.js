// jest.setup.js
process.env.NODE_ENV = "test";

// Silence dotenv logs
process.env.DOTENV_LOG_LEVEL = "silent";

// Mock ioredis globally to prevent real Redis connections in tests
jest.mock("ioredis");
