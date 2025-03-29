'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const hrTasks = [
      { description: 'Update HR system to reflect status change (Offboarding)', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() },
      { description: 'Provide offboarding packet (exit process overview)', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() },
      { description: 'Collect resignation letter or issue termination letter', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() },
      { description: 'Conduct exit interview', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() },
      { description: 'Determine rehire eligibility', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() }, // Adjusted T5
      { description: 'Provide benefits continuation info (if applicable)', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() },
      { description: 'Discuss final paycheck, unused PTO payout, bonuses, etc.', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() },
      { description: 'Send employment verification letter (if requested)', defaultAssignedRole: 'HR', createdAt: new Date(), updatedAt: new Date() },
    ];

    // TODO: Add IT Tasks, Manager Tasks etc. here or in separate seeders if needed

    await queryInterface.bulkInsert('TaskTemplates', hrTasks, {});
  },

  async down (queryInterface, Sequelize) {
    // Remove only the tasks inserted by this seeder, if possible
    // This requires knowing the specific descriptions or IDs. A simple approach is to delete all.
    await queryInterface.bulkDelete('TaskTemplates', {
      defaultAssignedRole: 'HR', // Example: Delete all HR tasks added by this seeder
      description: [ // List the descriptions to be specific
        'Update HR system to reflect status change (Offboarding)',
        'Provide offboarding packet (exit process overview)',
        'Collect resignation letter or issue termination letter',
        'Conduct exit interview',
        'Determine rehire eligibility',
        'Provide benefits continuation info (if applicable)',
        'Discuss final paycheck, unused PTO payout, bonuses, etc.',
        'Send employment verification letter (if requested)',
      ]
    }, {});
    // Alternatively, delete all: await queryInterface.bulkDelete('TaskTemplates', null, {});
  }
};
