
const { decideLeaveStatus } = require("../../src/utils/businessRules");

describe("decideLeaveStatus", () => {
  test("approves leaves of 1 day", () => {
    expect(decideLeaveStatus("2025-10-05", "2025-10-05")).toBe("APPROVED");
  });

  test("approves leaves of 2 days", () => {
    expect(decideLeaveStatus("2025-10-05", "2025-10-06")).toBe("APPROVED");
  });

  test("marks >2 days as PENDING", () => {
    expect(decideLeaveStatus("2025-10-05", "2025-10-08")).toBe("PENDING");
  });

  test("throws on invalid date", () => {
    expect(() => decideLeaveStatus("invalid", "2025-10-05")).toThrow();
  });
});
