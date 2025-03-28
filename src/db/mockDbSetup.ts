import { Sequelize } from 'sequelize';

// This variable will be set externally (e.g., by test setup or main app entry point)
let sequelizeInstance: Sequelize | null = null;

// Function to SET the instance
export const setSequelizeInstance = (instance: Sequelize): void => {
    if (sequelizeInstance) {
        console.warn('Sequelize instance is being overwritten.');
    }
    sequelizeInstance = instance;
};

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

// Export the getter and setter
export { setSequelizeInstance, getSequelizeInstance, testConnection };