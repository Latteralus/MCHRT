import { AppDataSource } from "./db";
import path from "path";
import fs from "fs";

/**
 * Utility to create and run TypeORM migrations
 */

// Ensure the migrations directory exists
const ensureMigrationsDir = () => {
  const migrationsDir = path.join(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log("Created migrations directory");
  }
  return migrationsDir;
};

// Initialize the database connection
const initializeDb = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log("Database connection initialized");
    }
    return AppDataSource;
  } catch (error) {
    console.error("Error initializing database connection:", error);
    throw error;
  }
};

// Generate a migration
export const generateMigration = async (name) => {
  const migrationsDir = ensureMigrationsDir();
  const dataSource = await initializeDb();

  try {
    // Generate timestamp for migration name
    const timestamp = new Date().getTime();
    const migrationName = `${timestamp}-${name}`;
    
    // Generate the migration
    await dataSource.driver.createSchemaBuilder().log("info", `Generating migration ${migrationName}`);
    await dataSource.migrations.generate({
      name: migrationName,
      directory: migrationsDir,
      run: false
    });
    
    console.log(`Migration ${migrationName} generated successfully`);
    return migrationName;
  } catch (error) {
    console.error("Error generating migration:", error);
    throw error;
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Run all pending migrations
export const runMigrations = async () => {
  const dataSource = await initializeDb();

  try {
    // Get pending migrations
    const pendingMigrations = await dataSource.showMigrations();
    
    if (!pendingMigrations.length) {
      console.log("No pending migrations to run");
      return;
    }
    
    // Run the migrations
    await dataSource.runMigrations();
    console.log("All pending migrations have been run successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// Revert the last migration
export const revertLastMigration = async () => {
  const dataSource = await initializeDb();

  try {
    // Revert the last migration
    await dataSource.undoLastMigration();
    console.log("Last migration has been reverted successfully");
  } catch (error) {
    console.error("Error reverting last migration:", error);
    throw error;
  } finally {
    // Close the connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

// CLI interface for running from scripts
if (require.main === module) {
  const command = process.argv[2];
  const name = process.argv[3];

  switch (command) {
    case "generate":
      if (!name) {
        console.error("Please provide a name for the migration");
        process.exit(1);
      }
      generateMigration(name).catch(() => process.exit(1));
      break;
    case "run":
      runMigrations().catch(() => process.exit(1));
      break;
    case "revert":
      revertLastMigration().catch(() => process.exit(1));
      break;
    default:
      console.error("Unknown command. Use 'generate', 'run', or 'revert'");
      process.exit(1);
  }
}