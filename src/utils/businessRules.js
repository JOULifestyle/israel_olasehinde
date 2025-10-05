// 
function parseDate(d) {
  if (d instanceof Date) return d;
  return new Date(d);
}

// returns 'APPROVED' for leaves <= 2 days, otherwise 'PENDING'
exports.decideLeaveStatus = (startDate, endDate) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  if (isNaN(start) || isNaN(end)) throw new Error("Invalid dates");

  const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays <= 2) return "APPROVED";
  return "PENDING";
};
