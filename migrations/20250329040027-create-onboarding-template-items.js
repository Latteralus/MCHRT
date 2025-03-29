'use strict';

// Data structure from the original hardcoded file (for reference during seeding)
const originalTemplates = [
    {
        id: 'standard-employee-v1',
        name: 'Standard Employee Onboarding',
        description: 'Default checklist for all new hires.',
        items: [
            { id: 'pre-01', task: 'Send Welcome Email & First Day Info', responsibleRole: 'HR', dueDays: -7 },
            { id: 'pre-02', task: 'Prepare Workstation (Hardware/Software)', responsibleRole: 'IT', dueDays: -2 },
            { id: 'pre-03', task: 'Set up necessary system accounts (Email, HRIS, etc.)', responsibleRole: 'IT', dueDays: -2 },
            { id: 'day1-01', task: 'Welcome & Team Introductions', responsibleRole: 'Manager' },
            { id: 'day1-02', task: 'Complete I-9 Verification', responsibleRole: 'HR' },
            { id: 'day1-03', task: 'Review Employee Handbook & Policies', responsibleRole: 'HR' },
            { id: 'day1-04', task: 'Provide Overview of Role & Responsibilities', responsibleRole: 'Manager' },
            { id: 'day1-05', task: 'Workstation Setup & Login Assistance', responsibleRole: 'IT' },
            { id: 'week1-01', task: 'Complete New Hire Paperwork (W4, Direct Deposit, etc.)', responsibleRole: 'Employee', dueDays: 3 },
            { id: 'week1-02', task: 'Enroll in Benefits (if applicable)', responsibleRole: 'Employee', dueDays: 5 },
            { id: 'week1-03', task: 'Initial Project/Task Assignment', responsibleRole: 'Manager', dueDays: 5 },
            { id: 'week1-04', task: 'Schedule 1:1 Check-in Meeting', responsibleRole: 'Manager', dueDays: 5 },
            { id: 'month1-01', task: '30-Day Performance Check-in', responsibleRole: 'Manager', dueDays: 30 },
            { id: 'month1-02', task: 'Complete Required Compliance Training', responsibleRole: 'Employee', dueDays: 30 },
        ],
    },
    {
        id: 'compounding-tech-v1',
        name: 'Compounding Technician Onboarding',
        description: 'Specific checklist for new Compounding Technicians.',
        items: [
            { id: 'pre-01', task: 'Send Welcome Email & First Day Info', responsibleRole: 'HR', dueDays: -7 },
            { id: 'pre-02', task: 'Prepare Workstation (Hardware/Software)', responsibleRole: 'IT', dueDays: -2 },
            { id: 'pre-03', task: 'Set up necessary system accounts (Email, HRIS, etc.)', responsibleRole: 'IT', dueDays: -2 },
            { id: 'day1-01', task: 'Welcome & Team Introductions', responsibleRole: 'Manager' },
            { id: 'day1-02', task: 'Complete I-9 Verification', responsibleRole: 'HR' },
            { id: 'day1-03', task: 'Review Employee Handbook & Policies', responsibleRole: 'HR' },
            { id: 'day1-04', task: 'Provide Overview of Role & Responsibilities', responsibleRole: 'Manager' },
            { id: 'day1-05', task: 'Workstation Setup & Login Assistance', responsibleRole: 'IT' },
            { id: 'day1-06', task: 'Review Lab Safety Procedures & PPE Requirements', responsibleRole: 'Manager' },
            { id: 'week1-01', task: 'Complete New Hire Paperwork (W4, Direct Deposit, etc.)', responsibleRole: 'Employee', dueDays: 3 },
            { id: 'week1-02', task: 'Enroll in Benefits (if applicable)', responsibleRole: 'Employee', dueDays: 5 },
            { id: 'week1-03', task: 'Initial Compounding Training/Observation', responsibleRole: 'Manager', dueDays: 5 },
            { id: 'week1-04', task: 'Schedule 1:1 Check-in Meeting', responsibleRole: 'Manager', dueDays: 5 },
            { id: 'month1-01', task: '30-Day Performance Check-in', responsibleRole: 'Manager', dueDays: 30 },
            { id: 'month1-02', task: 'Complete Required Compliance Training (including HIPAA)', responsibleRole: 'Employee', dueDays: 30 },
            { id: 'month1-03', task: 'Complete Initial Compounding Competency Assessment', responsibleRole: 'Manager', dueDays: 30 },
        ],
    },
];


/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Create the table
    await queryInterface.createTable('OnboardingTemplateItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      templateId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'OnboardingTemplates', // Name of the target table
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // If a template is deleted, delete its items
      },
      taskDescription: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      responsibleRole: {
        type: Sequelize.STRING,
        allowNull: false // Could add validation: isIn: [['Employee', 'Manager', 'HR', 'IT']]
      },
      dueDays: {
        type: Sequelize.INTEGER,
        allowNull: true // Optional
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true // Optional
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // --- Seed Data ---
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const now = new Date();
      const templateInserts = originalTemplates.map(t => ({
        templateCode: t.id,
        name: t.name,
        description: t.description,
        createdAt: now,
        updatedAt: now,
      }));

      // Insert templates and get their IDs
      // Note: bulkInsert doesn't easily return IDs in SQLite, so we query after inserting.
      await queryInterface.bulkInsert('OnboardingTemplates', templateInserts, { transaction });

      // Fetch the inserted templates to get their database IDs
      const insertedTemplates = await queryInterface.sequelize.query(
        `SELECT id, templateCode FROM OnboardingTemplates WHERE templateCode IN (:templateCodes)`,
        {
          replacements: { templateCodes: originalTemplates.map(t => t.id) },
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      const templateIdMap = insertedTemplates.reduce((acc, t) => {
        acc[t.templateCode] = t.id;
        return acc;
      }, {});

      // Prepare template items with correct foreign keys
      const itemInserts = originalTemplates.flatMap(template => {
        const dbTemplateId = templateIdMap[template.id];
        if (!dbTemplateId) {
          console.warn(`Could not find database ID for template code: ${template.id}. Skipping its items.`);
          return [];
        }
        return template.items.map(item => ({
          templateId: dbTemplateId,
          taskDescription: item.task,
          responsibleRole: item.responsibleRole,
          dueDays: item.dueDays,
          notes: item.notes,
          createdAt: now,
          updatedAt: now,
        }));
      });

      // Insert template items
      if (itemInserts.length > 0) {
        await queryInterface.bulkInsert('OnboardingTemplateItems', itemInserts, { transaction });
      }

      await transaction.commit();
      console.log('Successfully seeded OnboardingTemplates and OnboardingTemplateItems.');

    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding onboarding templates:', error);
      throw error; // Re-throw to fail the migration
    }
  },

  async down(queryInterface, Sequelize) {
    // Order matters: drop items first due to foreign key constraint
    await queryInterface.dropTable('OnboardingTemplateItems');
    // Then drop templates (handled in the other migration file)
  }
};
