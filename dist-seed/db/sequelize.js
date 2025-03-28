"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSequelizeInstance = void 0;
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
// Config will be loaded dynamically below using an absolute path
// Determine the environment
const env = process.env.NODE_ENV || 'development';
// Get the configuration for the current environment
// Type assertion needed as dbConfig is imported from JS
// Type assertion needed as dbConfig is imported from JS
// Load config dynamically using require and an absolute path relative to project root
const configPath = path_1.default.resolve(process.cwd(), 'src/config/config.js');
const dbConfig = require(configPath);
const config = dbConfig[env];
if (!config) {
    throw new Error(`Database configuration for environment '${env}' not found.`);
}
// Ensure storage path is absolute if using SQLite
if (config.dialect === 'sqlite' && config.storage && !path_1.default.isAbsolute(config.storage)) {
    config.storage = path_1.default.join(process.cwd(), config.storage);
    console.log(`[sequelize.ts] Resolved SQLite path for env '${env}': ${config.storage}`);
}
else if (config.dialect === 'sqlite') {
    console.log(`[sequelize.ts] Using SQLite path for env '${env}': ${config.storage}`);
}
// Create the Sequelize instance (singleton pattern)
let sequelizeInstance = null;
const initializeSequelize = () => {
    if (!sequelizeInstance) {
        console.log(`[sequelize.ts] Initializing Sequelize instance for env '${env}'...`);
        sequelizeInstance = new sequelize_1.Sequelize({
            ...config,
            // Add any other Sequelize options here if needed
        });
        console.log(`[sequelize.ts] Sequelize instance initialized for env '${env}'. Dialect: ${config.dialect}`);
    }
    return sequelizeInstance;
};
// Export a function to get the instance
const getSequelizeInstance = () => {
    if (!sequelizeInstance) {
        return initializeSequelize();
    }
    return sequelizeInstance;
};
exports.getSequelizeInstance = getSequelizeInstance;
// Optionally export the instance directly if preferred, but getter ensures initialization
// export const sequelize = initializeSequelize();
