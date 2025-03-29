// config/config.ts - Now using TypeScript and ES Modules
import path from 'path';
import { Dialect } from 'sequelize'; // Import Dialect type

// Define the path for the SQLite database file
const dbPath = path.join(process.cwd(), 'local-storage', 'dev.sqlite');

// Define types for configuration options (optional but good practice)
interface DbConfigOptions {
  dialect: Dialect;
  storage?: string; // Optional for non-SQLite
  logging?: ((sql: string, timing?: number) => void) | boolean;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  dialectOptions?: {
    ssl?: {
      require?: boolean;
      rejectUnauthorized?: boolean;
    };
  };
}

interface DbConfigs {
  development: DbConfigOptions;
  test: DbConfigOptions;
  production: DbConfigOptions;
}


const dbConfig: DbConfigs = {
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

// Export directly using module.exports for CommonJS compatibility with Sequelize CLI
module.exports = dbConfig;

// Remove standard ES Module export
// export { dbConfig };


// Keep the test export if needed elsewhere
export const testExport = 'Hello from config!';