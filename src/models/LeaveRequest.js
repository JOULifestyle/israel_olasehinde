const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Employee = require("./Employee");

const LeaveRequest = sequelize.define("LeaveRequest", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { 
    type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"),
    defaultValue: "PENDING"
  }
}, {
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: false,
});

// Relationships
Employee.hasMany(LeaveRequest, {
  foreignKey: { name: "employeeId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

LeaveRequest.belongsTo(Employee, {
  foreignKey: { name: "employeeId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = LeaveRequest;
