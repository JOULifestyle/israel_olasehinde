const sequelize = require("../config/db");
const Department = require("./Department");
const Employee = require("./Employee");
const LeaveRequest = require("./LeaveRequest");

// Associations
Department.hasMany(Employee, { foreignKey: "departmentId" });
Employee.belongsTo(Department, { foreignKey: "departmentId" });

Employee.hasMany(LeaveRequest, { foreignKey: "employeeId" });
LeaveRequest.belongsTo(Employee, { foreignKey: "employeeId" });

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");
    await sequelize.sync({ alter: true }); // update schema
    console.log("✅ Models synced");
  } catch (err) {
    console.error("❌ DB error:", err);
  }
};

module.exports = { sequelize, Department, Employee, LeaveRequest, initDB };
