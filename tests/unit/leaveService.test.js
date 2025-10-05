// tests/unit/leaveService.test.js
const leaveService = require("../../src/services/leaveService");
const leaveRepository = require("../../src/repositories/leaveRepository");
const amqp = require("amqplib");

jest.mock("amqplib"); // ensures amqplib is mocked

describe("leaveService", () => {
  let mockChannel;
  let mockConnection;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock channel with sendToQueue
    mockChannel = {
      assertQueue: jest.fn().mockResolvedValue(),
      sendToQueue: jest.fn().mockResolvedValue(),
      close: jest.fn().mockResolvedValue(),
    };

    // Mock connection with `on` method
    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn().mockResolvedValue(),
      on: jest.fn(), // important for service code that listens to events
    };

    // Default connect mock
    amqp.connect.mockResolvedValue(mockConnection);
  });

  describe("createLeaveRequest", () => {
    test("returns null when leaveRepository.create returns null", async () => {
      jest.spyOn(leaveRepository, "create").mockResolvedValue(null);
      const result = await leaveService.createLeaveRequest({});
      expect(result).toBeNull();
    });

    test("publishes to RabbitMQ successfully when leave is created", async () => {
      const mockLeave = { id: 1, status: "PENDING" };
      jest.spyOn(leaveRepository, "create").mockResolvedValue(mockLeave);

      const result = await leaveService.createLeaveRequest({});

      expect(result).toEqual(mockLeave);
      expect(amqp.connect).toHaveBeenCalled();
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        "leave.requested",
        { durable: true }
      );
      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        "leave.requested",
        Buffer.from(JSON.stringify(mockLeave)),
        { persistent: true }
      );
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    test("handles RabbitMQ connection failure gracefully", async () => {
      const mockLeave = { id: 2, status: "PENDING" };
      jest.spyOn(leaveRepository, "create").mockResolvedValue(mockLeave);

      amqp.connect.mockRejectedValueOnce(new Error("Connection failed"));

      const result = await leaveService.createLeaveRequest({});
      expect(result).toHaveProperty("publishError", "Connection failed");
    });

    test("handles channel creation failure gracefully", async () => {
      const mockLeave = { id: 3, status: "PENDING" };
      jest.spyOn(leaveRepository, "create").mockResolvedValue(mockLeave);

      amqp.connect.mockResolvedValueOnce({
        createChannel: jest.fn().mockRejectedValue(new Error("Channel failed")),
        close: jest.fn().mockResolvedValue(),
        on: jest.fn(),
      });

      const result = await leaveService.createLeaveRequest({});
      expect(result).toHaveProperty("publishError", "Channel failed");
    });

    test("handles sendToQueue failure gracefully", async () => {
      const mockLeave = { id: 4, status: "PENDING" };
      jest.spyOn(leaveRepository, "create").mockResolvedValue(mockLeave);

      const failingChannel = {
        assertQueue: jest.fn().mockResolvedValue(),
        sendToQueue: jest.fn(() => { throw new Error("Send failed"); }),
        close: jest.fn().mockResolvedValue(),
      };

      const failingConnection = {
        createChannel: jest.fn().mockResolvedValue(failingChannel),
        close: jest.fn().mockResolvedValue(),
        on: jest.fn(),
      };

      amqp.connect.mockResolvedValueOnce(failingConnection);

      const result = await leaveService.createLeaveRequest({});
      expect(result).toHaveProperty("publishError", "Send failed");
      expect(failingChannel.close).toHaveBeenCalled();
      expect(failingConnection.close).toHaveBeenCalled();
    });
  });

  describe("updateLeaveStatus", () => {
    test("calls leaveRepository.updateStatus with correct arguments", async () => {
      jest.spyOn(leaveRepository, "updateStatus").mockResolvedValue([1]);
      const result = await leaveService.updateLeaveStatus(123, "APPROVED");
      expect(result).toBe(true);
      expect(leaveRepository.updateStatus).toHaveBeenCalledWith(123, "APPROVED");
    });

    test("handles update failure gracefully", async () => {
      jest.spyOn(leaveRepository, "updateStatus").mockRejectedValue(new Error("Update failed"));

      await expect(leaveService.updateLeaveStatus(123, "APPROVED"))
        .rejects.toThrow("Update failed");

      expect(leaveRepository.updateStatus).toHaveBeenCalledWith(123, "APPROVED");
    });
  });
});
