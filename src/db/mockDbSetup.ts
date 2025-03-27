import { Sequelize } from 'sequelize';
import { dbConfig } from './config'; // Import the configuration

// Determine the environment (default to development if not set)
const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env as keyof typeof dbConfig]; // Get the config for the current environment

// Initialize Sequelize instance
let sequelize: Sequelize;

if (config) {
  sequelize = new Sequelize({
    ...config, // Spread the configuration options
  });
} else {
  console.error(`Database configuration for environment "${env}" not found.`);
  process.exit(1); // Exit if config is missing
}

// Function to test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`Database connection has been established successfully for environment: ${env}.`);
    // In a real setup, you might sync models here for development:
    // await sequelize.sync({ force: true }); // Use { force: true } cautiously - it drops tables!
    // console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

// Export the initialized sequelize instance for use in other parts of the application
export { sequelize, testConnection };

// If this script is run directly (e.g., `node src/db/mockDbSetup.js`), test the connection
if (require.main === module) {
  testConnection();
}