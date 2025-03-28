'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Employees', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Or false if every employee must be linked to a user account
      references: {
        model: 'Users', // Name of the target table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Or 'RESTRICT'
      after: 'departmentId' // Optional: Place column after departmentId
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Employees', 'userId');
  }
};
