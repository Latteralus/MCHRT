"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.getSequelizeInstance = void 0;
const sequelize_1 = require("sequelize");
// Use require for sync loading of config needed at module load time
const dbConfig = require('../config/config.js');
console.log('[mockDbSetup] Creating Sequelize instance...');
const testConfig = dbConfig.test;
if (!testConfig) {
    throw new Error('[mockDbSetup] Test database configuration not found in config/config.js');
}
// Create the instance synchronously when the module loads
const sequelizeInstance = new sequelize_1.Sequelize(testConfig);
console.log('[mockDbSetup] Sequelize instance created.');
// Remove the setter function as instance is created internally now
// export const setSequelizeInstance = (instance: Sequelize): void => { ... };
// Function to GET the instance
const getSequelizeInstance = () => {
    if (!sequelizeInstance) {
        // This error might occur if models are imported before the instance is set
        throw new Error('Sequelize has not been initialized or set.');
    }
    return sequelizeInstance;
};
exports.getSequelizeInstance = getSequelizeInstance;
// Function to test the database connection (if needed, uses the getter)
const testConnection = async () => {
    if (!sequelizeInstance) {
        console.error('Cannot test connection, Sequelize instance not set.');
        return;
    }
    try {
        await sequelizeInstance.authenticate();
        console.log(`Database connection test successful.`);
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};
exports.testConnection = testConnection;
// Exports are handled inline above
