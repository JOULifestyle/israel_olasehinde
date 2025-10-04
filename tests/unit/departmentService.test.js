const departmentService = require("../../src/services/departmentService");
const departmentRepository = require("../../src/repositories/departmentRepository");

jest.mock("../../src/repositories/departmentRepository");

describe("Department Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDepartment", () => {
    it("should create a department successfully", async () => {
      const payload = { name: "HR" };
      departmentRepository.create.mockResolvedValue({ id: 1, ...payload });

      const result = await departmentService.createDepartment(payload);
      expect(result).toEqual({ id: 1, ...payload });
    });

    it("should throw error if repository fails", async () => {
      departmentRepository.create.mockRejectedValue(new Error("DB fail"));

      await expect(departmentService.createDepartment({ name: "X" }))
        .rejects.toThrow("DB fail");
    });
  });

  describe("getEmployees", () => {
    it("should return employees of a department", async () => {
      const employees = [{ id: 1, name: "Alice" }];
      departmentRepository.getEmployees.mockResolvedValue(employees);

      const result = await departmentService.getEmployees(1);
      expect(result).toEqual(employees);
    });

    it("should throw error if repository fails", async () => {
      departmentRepository.getEmployees.mockRejectedValue(new Error("DB fail"));

      await expect(departmentService.getEmployees(1))
        .rejects.toThrow("DB fail");
    });
  });
});
