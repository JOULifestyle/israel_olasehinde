// tests/unit/leaveService.null.test.js
const leaveService = require("../../src/services/leaveService");
const leaveRepository = require("../../src/repositories/leaveRepository");

test("createLeaveRequest gracefully handles invalid leave data", async () => {
  jest.spyOn(leaveRepository, "create").mockResolvedValue(null);
  const result = await leaveService.createLeaveRequest({});
  expect(result).toBeNull();
});
