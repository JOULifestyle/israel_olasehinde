'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LeaveRequests', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      employeeId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: false, references: { model: 'Employees', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      startDate: { type: Sequelize.DATEONLY, allowNull: false },
      endDate: { type: Sequelize.DATEONLY, allowNull: false },
      status: { type: Sequelize.ENUM('PENDING','APPROVED','REJECTED'), allowNull: false, defaultValue: 'PENDING' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('LeaveRequests', ['employeeId'], { name: 'idx_leave_employee' });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('LeaveRequests', 'idx_leave_employee');
    await queryInterface.dropTable('LeaveRequests');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_LeaveRequests_status";'); // cleanup enum for some DBs
  }
};
