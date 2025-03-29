"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testExport = void 0;
// config/config.ts - Now using TypeScript and ES Modules
var path_1 = __importDefault(require("path"));
// Define the path for the SQLite database file
var dbPath = path_1.default.join(process.cwd(), 'local-storage', 'dev.sqlite');
var dbConfig = {
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
// Keep the test export if needed elsewhere
exports.testExport = 'Hello from config!';
