import { Options } from 'sequelize';
import path from 'path';

// Define the path for the SQLite database file
// It's often placed in a non-source controlled directory or within the db folder itself for simplicity in MVP/dev
const dbPath = path.join(process.cwd(), 'local-storage', 'dev.sqlite'); // Store in local-storage as planned

const development: Options = {
  dialect: 'sqlite',
  storage: dbPath, // Path to the database file
  logging: console.log, // Log SQL queries to console (can be set to false)
  // Define naming conventions if needed
  // define: {
  //   underscored: true, // Use snake_case for table and column names
  // },
};

const test: Options = {
  dialect: 'sqlite',
  storage: ':memory:', // Use in-memory SQLite for tests
  logging: false, // Disable logging for tests
};

const production: Options = {
  // Production configuration (PostgreSQL) will be added later
  // dialect: 'postgres',
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
};

// Export the configurations
// Sequelize-CLI expects a specific structure, often defined in a .sequelizerc or config/config.json
// For application use, we can export them like this:
export const dbConfig = {
  development,
  test,
  production,
};

// Configuration specifically for Sequelize-CLI (if not using .sequelizerc or config.json)
// This structure might be needed if you run CLI commands directly referencing this file.
module.exports = {
  development,
  test,
  production,
};