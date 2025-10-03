const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Department = sequelize.define("Department", {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
}, {
  timestamps: true,
  createdAt: "createdAt",
  updatedAt: false,
});

module.exports = Department;
