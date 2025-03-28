import { Sequelize } from 'sequelize';
// Use require for sync loading of config needed at module load time
const dbConfig = require('../config/config.js');

console.log('[mockDbSetup] Creating Sequelize instance...');
const testConfig = dbConfig.test;
if (!testConfig) {
  throw new Error('[mockDbSetup] Test database configuration not found in config/config.js');
}
// Create the instance synchronously when the module loads
const sequelizeInstance: Sequelize = new Sequelize(testConfig);
console.log('[mockDbSetup] Sequelize instance created.');

// Remove the setter function as instance is created internally now
// export const setSequelizeInstance = (instance: Sequelize): void => { ... };

// Function to GET the instance
export const getSequelizeInstance = (): Sequelize => {
    if (!sequelizeInstance) {
        // This error might occur if models are imported before the instance is set
        throw new Error('Sequelize has not been initialized or set.');
    }
    return sequelizeInstance;
};

// Function to test the database connection (if needed, uses the getter)
export const testConnection = async () => {
  if (!sequelizeInstance) {
      console.error('Cannot test connection, Sequelize instance not set.');
      return;
  }
  try {
    await sequelizeInstance.authenticate();
    console.log(`Database connection test successful.`);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Exports are handled inline above