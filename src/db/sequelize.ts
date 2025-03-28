import { Sequelize } from 'sequelize';
import path from 'path';
import * as dbConfig from '@/config/config.js'; // Use import * for CommonJS config

// Determine the environment
const env = process.env.NODE_ENV || 'development';

// Get the configuration for the current environment
// Type assertion needed as dbConfig is imported from JS
const config = (dbConfig as any)[env];

if (!config) {
  throw new Error(`Database configuration for environment '${env}' not found.`);
}

// Ensure storage path is absolute if using SQLite
if (config.dialect === 'sqlite' && config.storage && !path.isAbsolute(config.storage)) {
    config.storage = path.join(process.cwd(), config.storage);
    console.log(`[sequelize.ts] Resolved SQLite path for env '${env}': ${config.storage}`);
} else if (config.dialect === 'sqlite') {
    console.log(`[sequelize.ts] Using SQLite path for env '${env}': ${config.storage}`);
}

// Create the Sequelize instance (singleton pattern)
let sequelizeInstance: Sequelize | null = null;

const initializeSequelize = (): Sequelize => {
  if (!sequelizeInstance) {
    console.log(`[sequelize.ts] Initializing Sequelize instance for env '${env}'...`);
    sequelizeInstance = new Sequelize({
      ...config,
      // Add any other Sequelize options here if needed
    });
    console.log(`[sequelize.ts] Sequelize instance initialized for env '${env}'. Dialect: ${config.dialect}`);
  }
  return sequelizeInstance;
};

// Export a function to get the instance
export const getSequelizeInstance = (): Sequelize => {
  if (!sequelizeInstance) {
    return initializeSequelize();
  }
  return sequelizeInstance;
};

// Optionally export the instance directly if preferred, but getter ensures initialization
// export const sequelize = initializeSequelize();