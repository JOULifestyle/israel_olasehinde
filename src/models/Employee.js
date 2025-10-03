const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Department = require("./Department");

const Employee = sequelize.define("Employee", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
}, {
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: false,
});

// Relationships
Department.hasMany(Employee, {
  foreignKey: { name: "departmentId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Employee.belongsTo(Department, {
  foreignKey: { name: "departmentId", allowNull: false },
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

module.exports = Employee;
