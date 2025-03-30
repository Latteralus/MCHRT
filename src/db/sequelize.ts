import { Sequelize } from 'sequelize';
import path from 'path';

// --- Define types (consider moving to a shared file) ---
type Dialect = 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql';
interface DbConfigOptions {
    dialect: Dialect;
    storage?: string;
    logging?: boolean | ((sql: string, timing?: number) => void);
    host?: string;
    port?: number;
    database?: string;
    username?: string;
    password?: string;
    dialectOptions?: object;
}
interface DbConfigs {
    development: DbConfigOptions;
    test: DbConfigOptions;
    production: DbConfigOptions;
}

// --- Load config using require ---
// Use require as config.ts uses module.exports
const dbConfig = require('../config/config') as DbConfigs;

// --- Determine environment and get config ---
const env = process.env.NODE_ENV || 'development';

// --- Check loaded dbConfig ---
if (!dbConfig || typeof dbConfig !== 'object') {
    throw new Error(`[sequelize.ts] Required dbConfig is invalid (value: ${JSON.stringify(dbConfig)}). Check config.ts export.`);
}

const config = dbConfig[env as keyof DbConfigs];

if (!config) {
    throw new Error(`[sequelize.ts] Database configuration for environment '${env}' not found within loaded dbConfig.`);
}

// --- Resolve SQLite path ---
const currentConfig = { ...config }; // Use a mutable copy
if (currentConfig.dialect === 'sqlite' && currentConfig.storage && currentConfig.storage !== ':memory:' && !path.isAbsolute(currentConfig.storage)) {
    currentConfig.storage = path.join(process.cwd(), currentConfig.storage);
}

// --- Create and export the Sequelize instance ---
const sequelize = new Sequelize(currentConfig);

export { sequelize }; // Export the instance directly

// Import and define associations AFTER instance is exported
import { defineAssociations } from './associations';
defineAssociations(); // Call associations AFTER export