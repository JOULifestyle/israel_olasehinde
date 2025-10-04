'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Employees', {
      id: { type: Sequelize.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      departmentId: { type: Sequelize.BIGINT.UNSIGNED, allowNull: true, references: { model: 'Departments', key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });
    await queryInterface.addIndex('Employees', ['departmentId'], { name: 'idx_employee_department' });
  },
  down: async (queryInterface) => {
    await queryInterface.removeIndex('Employees', 'idx_employee_department');
    await queryInterface.dropTable('Employees');
  }
};
