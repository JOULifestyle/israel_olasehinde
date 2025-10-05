const leaveRepository = require("../repositories/leaveRepository");
const queue = require("../utils/queue");

/**
 * Auto-approve leave if start date <= 2 days from now
 * @param {Object} leave - leave object from DB
 * @returns {Promise<Object>} leave (updated if needed)
 */
async function autoApproveIfDue(leave) {
  if (!leave) return null;

  const now = new Date();
  const startDate = new Date(leave.startDate);
  const diffDays = (startDate - now) / (1000 * 60 * 60 * 24);

  if (diffDays <= 2 && leave.status === "PENDING") {
    const [updatedRows] = await leaveRepository.updateStatusIfPending(
      leave.id,
      "APPROVED"
    );
    if (updatedRows > 0) {
      leave.status = "APPROVED";
      console.log(`Auto-approved leave ${leave.id}`);
    }
  }

  return leave;
}

/**
 * Create a leave request (DB + async RabbitMQ publish)
 * Applies auto-approval if start date <= 2 days
 */
exports.createLeaveRequest = async (data) => {
  //  Save leave in DB
  const leave = await leaveRepository.create(data);
  if (!leave) return null;

  //  Auto-approve if start date is within 2 days
  await autoApproveIfDue(leave);

  //  Publish to RabbitMQ (async, non-blocking)
  try {
    await queue.publishLeave(leave);
  } catch (err) {
    console.error("❌ Failed to publish to RabbitMQ:", err.message);
    leave.publishError = err.message; // optional
  }

  //  Return leave immediately
  return leave;
};

/**
 * Idempotent status update (only if current status is PENDING)
 * @param {number} id - leave ID
 * @param {string} newStatus - "APPROVED" | "REJECTED"
 * @returns {boolean} true if updated
 */
exports.updateLeaveStatus = async (id, newStatus) => {
  try {
    const [updatedRows] = await leaveRepository.updateStatus(id, newStatus);
    return updatedRows > 0;
  } catch (err) {
    console.error("❌ Failed to update leave status:", err.message);
    throw err;
  }
};

/**
 * Update leave status only if current status is PENDING
 * @param {number} id - leave ID
 * @param {string} newStatus - "APPROVED" | "REJECTED"
 * @returns {boolean} true if updated
 */
exports.updateLeaveStatusIfPending = async (id, newStatus) => {
  try {
    const [updatedRows] = await leaveRepository.updateStatusIfPending(id, newStatus);
    return updatedRows > 0;
  } catch (err) {
    console.error("❌ Failed to update leave status:", err.message);
    throw err;
  }
};

/**
 * Fetch leave by ID
 * Also applies auto-approval if start date <= 2 days
 * @param {number} id - leave ID
 * @returns {Object|null} leave
 */
exports.getLeaveById = async (id) => {
  const leave = await leaveRepository.findById(id);
  return autoApproveIfDue(leave);
};
