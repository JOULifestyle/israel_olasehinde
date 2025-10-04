// tests/unit/leaveService.test.js
const leaveService = require("../../src/services/leaveService");
const leaveRepository = require("../../src/repositories/leaveRepository");
const amqp = require("amqplib");

jest.mock("amqplib"); // prevent real RabbitMQ connections

describe("leaveService", () => {
  afterEach(() => {
    jest.clearAllMocks();
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

      const mockChannel = { 
        assertQueue: jest.fn().mockResolvedValue(),
        sendToQueue: jest.fn(),
        close: jest.fn().mockResolvedValue()
      };
      const mockConnection = { 
        createChannel: jest.fn().mockResolvedValue(mockChannel), 
        close: jest.fn().mockResolvedValue()
      };
      amqp.connect.mockResolvedValue(mockConnection);

      const result = await leaveService.createLeaveRequest({});

      expect(result).toEqual(mockLeave);
      expect(amqp.connect).toHaveBeenCalled();
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith("leave.requested", { durable: true });
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

      amqp.connect.mockRejectedValue(new Error("Connection failed"));

      const result = await leaveService.createLeaveRequest({});
      expect(result).toHaveProperty("publishError", "Connection failed");
    });

    test("handles channel creation failure gracefully", async () => {
      const mockLeave = { id: 3, status: "PENDING" };
      jest.spyOn(leaveRepository, "create").mockResolvedValue(mockLeave);

      const mockConnection = {
        createChannel: jest.fn().mockRejectedValue(new Error("Channel failed")),
        close: jest.fn().mockResolvedValue()
      };
      amqp.connect.mockResolvedValue(mockConnection);

      const result = await leaveService.createLeaveRequest({});
      expect(result).toHaveProperty("publishError", "Channel failed");
      expect(mockConnection.close).toHaveBeenCalled();
    });

    test("handles sendToQueue failure gracefully", async () => {
      const mockLeave = { id: 4, status: "PENDING" };
      jest.spyOn(leaveRepository, "create").mockResolvedValue(mockLeave);

      const mockChannel = { 
        assertQueue: jest.fn().mockResolvedValue(),
        sendToQueue: jest.fn().mockImplementation(() => { throw new Error("Send failed"); }),
        close: jest.fn().mockResolvedValue()
      };
      const mockConnection = { 
        createChannel: jest.fn().mockResolvedValue(mockChannel), 
        close: jest.fn().mockResolvedValue()
      };
      amqp.connect.mockResolvedValue(mockConnection);

      const result = await leaveService.createLeaveRequest({});
      expect(result).toHaveProperty("publishError", "Send failed");
      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });
  });

  describe("updateLeaveStatus", () => {
    test("calls leaveRepository.updateStatus with correct arguments", async () => {
      const updateSpy = jest.spyOn(leaveRepository, "updateStatus").mockResolvedValue(true);
      const result = await leaveService.updateLeaveStatus(123, "APPROVED");
      expect(updateSpy).toHaveBeenCalledWith(123, "APPROVED");
      expect(result).toBe(true);
    });

    test("handles update failure gracefully", async () => {
      const updateSpy = jest.spyOn(leaveRepository, "updateStatus").mockRejectedValue(new Error("Update failed"));
      await expect(leaveService.updateLeaveStatus(123, "APPROVED")).rejects.toThrow("Update failed");
      expect(updateSpy).toHaveBeenCalledWith(123, "APPROVED");
    });
  });
});
