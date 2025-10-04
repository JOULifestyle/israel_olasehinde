module.exports = {
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertQueue: jest.fn().mockResolvedValue(),
      sendToQueue: jest.fn(),
      close: jest.fn().mockResolvedValue(),
    }),
    close: jest.fn().mockResolvedValue(),
  }),
};
