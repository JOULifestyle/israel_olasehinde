// tests/__mocks__/amqplib.js
const mockChannel = {
  assertQueue: jest.fn().mockResolvedValue(true),
  sendToQueue: jest.fn(),
  close: jest.fn(),
};

const mockConnection = {
  createChannel: jest.fn().mockResolvedValue(mockChannel),
  on: jest.fn(),
  close: jest.fn(),
};

module.exports = {
  connect: jest.fn().mockResolvedValue(mockConnection),
};
