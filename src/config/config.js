// src/config/config.js - CommonJS version for Sequelize CLI
const path = require('path');

// Define the path for the SQLite database file
const dbPath = path.join(process.cwd(), 'local-storage', 'dev.sqlite');

const dbConfig = {
  development: {
    dialect: 'sqlite',
    storage: dbPath, // Path to the database file
    logging: console.log, // Log SQL queries to console
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:', // Use in-memory SQLite for tests
    logging: false, // Disable logging for tests
  },
  production: {
    // Production configuration (PostgreSQL) will be added later
    dialect: 'postgres', // Added placeholder dialect
    // host: process.env.DB_HOST,
    // port: parseInt(process.env.DB_PORT || '5432'),
    // database: process.env.DB_NAME,
    // username: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    logging: false, // Disable logging in production unless needed
    // dialectOptions: {
    //   ssl: {
    //     require: true,
    //     rejectUnauthorized: false // Adjust based on your SSL setup
    //   }
    // },
  }
};

// Export using module.exports for Sequelize CLI compatibility
module.exports = dbConfig;