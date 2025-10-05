// src/repositories/leaveRepository.js
const { LeaveRequest } = require("../models");

/**
 * Create a new leave request
 * @param {Object} data
 * @returns {Promise<LeaveRequest>}
 */
exports.create = (data) => LeaveRequest.create(data);

/**
 * Find a leave request by its ID
 * @param {number} id
 * @returns {Promise<LeaveRequest|null>}
 */
exports.findById = (id) => LeaveRequest.findByPk(id);

/**
 * Update leave status unconditionally
 * @param {number} id
 * @param {string} status - "PENDING" | "APPROVED" | "REJECTED"
 * @returns {Promise<[number, LeaveRequest[]]>} affected rows
 */
exports.updateStatus = (id, status) =>
  LeaveRequest.update(
    { status },
    { where: { id }, returning: true } // returning: true gives updated row in Postgres; ignored in MySQL
  );

/**
 * Idempotent status update: only updates if current status is PENDING
 * @param {number} id
 * @param {string} newStatus - "APPROVED" | "REJECTED"
 * @returns {Promise<[number, LeaveRequest[]]>} number of affected rows
 */
exports.updateStatusIfPending = (id, newStatus) =>
  LeaveRequest.update(
    { status: newStatus },
    {
      where: { id, status: "PENDING" },
      returning: true,
    }
  );

/**
 * Fetch all leave requests for a given employee
 * @param {number} employeeId
 * @returns {Promise<LeaveRequest[]>}
 */
exports.findByEmployee = (employeeId) =>
  LeaveRequest.findAll({ where: { employeeId }, order: [["createdAt", "DESC"]] });

/**
 * Optional: Fetch leave requests by status
 * @param {string} status
 * @returns {Promise<LeaveRequest[]>}
 */
exports.findByStatus = (status) =>
  LeaveRequest.findAll({ where: { status }, order: [["createdAt", "DESC"]] });
