// scripts/add-username-migration.js
import { ensureDbConnected, AppDataSource } from "../utils/db";
import { UserEntity } from "../entities/User";

/**
 * This script adds a username field to all existing users.
 * Usernames are generated as first initial + last name (e.g., jsmith for John Smith)
 */
async function addUsernamesMigration() {
  try {
    // Initialize database connection
    await ensureDbConnected();
    console.log("Database connection established");

    // Get user repository
    const userRepository = AppDataSource.getRepository(UserEntity);
    
    // First, check if we need to add the username column
    try {
      // Attempt to find a user with username to check if the column exists
      await userRepository.findOneBy({ username: 'test' });
      console.log("Username column already exists");
    } catch (error) {
      if (error.message.includes("column \"username\" does not exist")) {
        console.log("Username column does not exist. Please run the database migration first.");
        console.log("Example migration SQL: ALTER TABLE users ADD COLUMN username VARCHAR(255) UNIQUE;");
        return;
      }
    }

    // Get all users
    const users = await userRepository.find();
    console.log(`Found ${users.length} users to update.`);

    // Track usernames to avoid duplicates
    const usedUsernames = new Set();

    // Process each user
    for (const user of users) {
      // Skip users who already have a username
      if (user.username) {
        usedUsernames.add(user.username.toLowerCase());
        console.log(`User ${user.id} already has username: ${user.username}`);
        continue;
      }

      if (!user.firstName || !user.lastName) {
        console.log(`User ${user.id} is missing first or last name, cannot generate username`);
        continue;
      }

      // Generate username as first initial + last name
      const firstInitial = user.firstName.charAt(0).toLowerCase();
      const lastName = user.lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
      let username = firstInitial + lastName;
      
      // Ensure username is unique
      let finalUsername = username;
      let counter = 1;
      
      while (usedUsernames.has(finalUsername.toLowerCase())) {
        finalUsername = `${username}${counter}`;
        counter++;
      }
      
      usedUsernames.add(finalUsername.toLowerCase());
      
      // Update user with new username
      user.username = finalUsername;
      await userRepository.save(user);
      
      console.log(`Updated user ${user.id}: ${user.firstName} ${user.lastName} with username: ${finalUsername}`);
    }

    // Find users without usernames and create default ones
    const remainingUsers = await userRepository.find({
      where: { username: null }
    });

    if (remainingUsers.length > 0) {
      console.log(`${remainingUsers.length} users still have no username. Creating default usernames.`);
      
      for (const user of remainingUsers) {
        // Use email prefix if available, otherwise use "user" + ID
        let baseUsername;
        if (user.email) {
          baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        } else {
          baseUsername = `user${user.id}`;
        }
        
        // Ensure username is unique
        let finalUsername = baseUsername;
        let counter = 1;
        
        while (usedUsernames.has(finalUsername.toLowerCase())) {
          finalUsername = `${baseUsername}${counter}`;
          counter++;
        }
        
        usedUsernames.add(finalUsername.toLowerCase());
        
        // Update user with new username
        user.username = finalUsername;
        await userRepository.save(user);
        
        console.log(`Created default username for user ${user.id}: ${finalUsername}`);
      }
    }

    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Error during migration:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    }
  }
}

// Run the migration if the script is executed directly
if (require.main === module) {
  addUsernamesMigration()
    .then(() => process.exit(0))
    .catch(error => {
      console.error("Unhandled error:", error);
      process.exit(1);
    });
}

export default addUsernamesMigration;