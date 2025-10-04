// tests/unit/departmentService.error.test.js
const departmentService = require("../../src/services/departmentService");
const departmentRepository = require("../../src/repositories/departmentRepository");

test("createDepartment handles errors", async () => {
  jest.spyOn(departmentRepository, "create").mockRejectedValue(new Error("DB fail"));
  await expect(departmentService.createDepartment({ name: "X" })).rejects.toThrow("DB fail");
});
