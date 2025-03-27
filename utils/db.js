// MCHRT/utils/db.js (Production-Ready)

import { DataSource } from "typeorm";
// Ensure correct default imports for all entities
import User from "../entities/User";
import Department from "../entities/Department";
import Employee from "../entities/Employee";
import Attendance from "../entities/Attendance";
import Leave from "../entities/Leave";
import Compliance from "../entities/Compliance";
import Document from "../entities/Document";

// Validate DATABASE_URL environment variable
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Determine SSL configuration based on environment
const isProduction = process.env.NODE_ENV === "production";
let sslConfig = false;
if (isProduction) {
    // IMPORTANT SECURITY NOTE:
    // Using rejectUnauthorized: false is INSECURE and means TypeORM won't verify the server's certificate.
    // This should ONLY be used if your database provider requires it or if you understand the risks.
    // Ideally, for production, you should use `true` and provide the necessary CA certificate if required by your setup.
    // Platforms like Heroku/Vercel might manage SSL termination differently. Review your hosting provider's documentation.
    sslConfig = { rejectUnauthorized: false }; // Or set to true and configure CA if needed
    console.log("Production environment detected. Enabling SSL for database connection.");
}

// Create the TypeORM DataSource instance
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    User,
    Department,
    Employee,
    Attendance,
    Leave,
    Compliance,
    Document
  ],
  // Disable synchronization in production to prevent accidental data loss
  synchronize: !isProduction,
  // Configure logging (disable verbose logging in production)
  logging: !isProduction ? "all" : ["error"], // Log all in dev, only errors in prod
  // Apply SSL configuration
  ssl: sslConfig,
});

// --- DataSource Initialization (Singleton Pattern) ---

// Singleton promise to ensure initialization only happens once globally
let connectionPromise = null;

/**
 * Initializes the TypeORM DataSource if it hasn't been initialized already.
 * Returns a promise that resolves with the initialized DataSource instance.
 * Handles singleton pattern to prevent multiple initializations.
 * @returns {Promise<DataSource>} Promise resolving to the initialized DataSource.
 */
export const initializeDataSource = () => {
  // Check if the promise already exists or initialization is complete
  if (!connectionPromise) {
      // Log attempt only once per potential initialization cycle
      console.log(`Attempting to initialize DataSource (Initialized: ${AppDataSource.isInitialized})...`);
      connectionPromise = (async () => {
      try {
        // Double-check initialization status within the async task
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize();
          console.log("Data Source has been initialized successfully!");
        } else {
           console.log("Data Source was already initialized.");
        }
        return AppDataSource;
      } catch (error) {
        console.error("CRITICAL: Error during Data Source initialization:", error);
        // Reset promise on failure to allow potential retries if the app logic supports it
        connectionPromise = null;
        // Re-throw the error to propagate it to the caller (e.g., dbService)
        throw error;
      }
    })();
  } else {
       // Optional: Log if initialization was already in progress or completed
       // console.log("DataSource initialization already requested or completed.");
  }
  return connectionPromise;
};

// --- Optional Utility Exports (If needed outside dbService) ---

/**
 * Closes the DataSource connection if it is currently initialized.
 * Useful for graceful shutdowns or specific testing scenarios.
 */
export const closeDataSourceConnection = async () => {
    // Await the current connection promise first to handle ongoing initializations
    try {
        if (connectionPromise) await connectionPromise;
    } catch (initError) {
        console.warn("Attempted to close connection after an initialization error:", initError.message);
        // Continue to attempt closure if somehow initialized despite error
    }

    if (AppDataSource.isInitialized) {
      try {
          await AppDataSource.destroy();
          connectionPromise = null; // Reset the singleton promise
          console.log("Data Source connection has been closed.");
      } catch (closeError) {
          console.error("Error closing Data Source connection:", closeError);
          throw closeError; // Re-throw closure error
      }
    } else {
        // console.log("Data Source connection was not initialized, no need to close.");
        connectionPromise = null; // Ensure promise is reset even if not initialized
    }
};

// Note: The large 'db' object and functions like `runTransaction`, `executeRawQuery`
// have been removed, assuming dbService.js is the primary data access layer.
// If direct access via these utilities is still required elsewhere, they can be
// added back, ensuring they use the `initializeDataSource` function correctly.