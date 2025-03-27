// MCHRT/utils/db.js (Mock DB Aware)

// Determine if using mock DB BEFORE importing TypeORM
const USE_MOCK_DB = process.env.USE_MOCK_DB === 'true';

let DataSource, User, Department, Employee, Attendance, Leave, Compliance, Document;
let AppDataSource = null;
let initializeDataSource = async () => {
  console.warn("Attempted to initialize DataSource while USE_MOCK_DB is true.");
  return null; // Return null or throw error if real DB needed but mock is forced
};
let db = {}; // Default to empty object for mock scenario

// --- Only load real DB stuff if NOT using Mock DB ---
if (!USE_MOCK_DB) {
  // --- TypeORM and Entity Imports ---
  // Wrap imports to prevent loading if using mock DB
  try {
    DataSource = require("typeorm").DataSource;
    User = require("../entities/User").default;
    Department = require("../entities/Department").default;
    Employee = require("../entities/Employee").default;
    Attendance = require("../entities/Attendance").default;
    Leave = require("../entities/Leave").default;
    Compliance = require("../entities/Compliance").default;
    Document = require("../entities/Document").default;
  } catch (e) {
      console.error("Failed to import TypeORM or Entities for Real DB:", e);
      // If these fail, the real DB path won't work anyway
      // Throw error or handle depending on desired behavior if real DB is expected
      throw new Error("TypeORM/Entity import failed. Check dependencies.");
  }


  // --- Real DataSource Configuration ---
  // Validate DATABASE_URL only if using real DB
  if (!process.env.DATABASE_URL) {
    // This check might still fail build if Next.js analyzes file before env vars are fully set.
    // Consider moving DB initialization entirely out of global scope if issues persist.
    console.error("DATABASE_URL environment variable is not set for real database connection.");
    // throw new Error("DATABASE_URL environment variable is not set."); // Fails build loudly
  }

  const isProduction = process.env.NODE_ENV === "production";
  let sslConfig = false;
  if (isProduction) {
    // IMPORTANT SECURITY NOTE ON rejectUnauthorized: false (see previous explanations)
    sslConfig = { rejectUnauthorized: false };
    console.log("Production environment detected. Enabling SSL for database connection.");
  }

  // Create the DataSource instance ONLY if using real DB
  AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL, // Can be undefined here if check above doesn't throw
    entities: [User, Department, Employee, Attendance, Leave, Compliance, Document],
    synchronize: !isProduction,
    logging: !isProduction ? "all" : ["error"],
    ssl: sslConfig,
  });

  // --- Real DataSource Initialization (Singleton Pattern) ---
  let connectionPromise = null;
  initializeDataSource = () => { // Reassign the real function
    if (!connectionPromise) {
      connectionPromise = (async () => {
        try {
          // Check URL again before initializing
          if (!AppDataSource.options.url) {
               throw new Error("Cannot initialize DataSource, DATABASE_URL is missing.");
          }
          if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log("Real Data Source has been initialized!");
          }
          return AppDataSource;
        } catch (error) {
          console.error("CRITICAL: Error during Real Data Source initialization:", error);
          connectionPromise = null;
          throw error;
        }
      })();
    }
    return connectionPromise;
  };

  // --- Real DB Methods Object ---
  // Assign the real 'db' object methods ONLY if using real DB
  // This uses the structure from the fetched file, relying on ensureDbConnected
  const ensureDbConnected = initializeDataSource; // Use the same initializer
  db = {
      // User operations
      async getUsers() {
        const ds = await ensureDbConnected(); return ds.getRepository(User).find();
      },
      async getUserById(id) {
        const ds = await ensureDbConnected(); return ds.getRepository(User).findOneBy({ id });
      },
      async getUserByEmail(email) {
         const ds = await ensureDbConnected(); return ds.getRepository(User).findOneBy({ email });
      },
       async getUserByUsername(username) {
         const ds = await ensureDbConnected(); return ds.getRepository(User).findOneBy({ username });
       },
      async createUser(userData) {
        const ds = await ensureDbConnected(); const repo = ds.getRepository(User);
        const user = repo.create(userData); return repo.save(user);
      },
      async updateUser(id, userData) {
        const ds = await ensureDbConnected(); const repo = ds.getRepository(User);
        await repo.update(id, userData); return repo.findOneBy({ id });
      },
      async deleteUser(id) {
        const ds = await ensureDbConnected(); const repo = ds.getRepository(User);
        const res = await repo.delete(id); return { success: res.affected > 0 };
      },
     // --- Department operations --- (Example)
      async getDepartments() {
        const ds = await ensureDbConnected(); return ds.getRepository(Department).find();
      },
     // ... Add ALL other methods (Employee, Attendance, Leave, etc.) from the original 'db' object here ...
     // ... Make sure they use 'await ensureDbConnected()' and the correct 'ds.getRepository(...)' ...
     // Example:
      async getEmployees(filter = {}) {
         const ds = await ensureDbConnected();
         const repo = ds.getRepository(Employee);
         // ... (add query builder logic as in original db object) ...
         let query = repo.createQueryBuilder("employee").leftJoinAndSelect("employee.department", "department");
         // Apply filters...
         return query.getMany();
      },
      // --- Transaction support ---
      async transaction(callback) {
          const ds = await ensureDbConnected();
          const qr = ds.createQueryRunner(); await qr.connect(); await qr.startTransaction();
          try { const result = await callback(qr.manager); await qr.commitTransaction(); return result; }
          catch (error) { await qr.rollbackTransaction(); throw error; }
          finally { await qr.release(); }
      },
      // ... Add ALL other utility methods like executeRawQuery, getEntityByName, etc. ...
  };

} else {
   console.log("Mock DB mode: Skipping Real DB setup in utils/db.js");
}


// --- Exports ---
// Export AppDataSource (will be null if mock) and initializeDataSource (will be dummy if mock)
// These might not be needed if dbService is the only consumer and uses the default export.
// export { AppDataSource, initializeDataSource }; // Optional named exports

// Export the 'db' object (will be empty {} if mock, or full object if real)
export default db;