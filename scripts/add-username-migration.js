// scripts/add-username-migration.js
// Refactored to use dbService
import { dbService } from '@/utils/dbService'; // Use path alias
// NOTE: Removed imports for ensureDbConnected, AppDataSource, UserEntity

/**
 * This script adds a username field to all existing users.
 * Usernames are generated as first initial + last name (e.g., jsmith for John Smith)
 * IMPORTANT: This script assumes usernames should be unique.
 * It's designed for a one-time run. Back up your data before executing.
 */
async function addUsernamesMigration() {
  try {
    console.log(`Starting username migration... (Using ${dbService.isMockDb() ? 'Mock DB' : 'Real DB'})`);

    // Get all users using dbService
    const users = await dbService.getUsers();
    console.log(`Found ${users.length} users to potentially update.`);

    // Track usernames to avoid duplicates during this run
    const usedUsernames = new Set();
    const usersToUpdate = [];

    // First pass: populate usedUsernames set with existing usernames
    for (const user of users) {
        if (user.username) {
            usedUsernames.add(user.username.toLowerCase());
        }
    }
    console.log(`Found ${usedUsernames.size} existing unique usernames.`);

    // Second pass: generate usernames for users without one
    for (const user of users) {
      // Skip users who already have a username
      if (user.username) {
        console.log(`User ${user.id} (${user.email}) already has username: ${user.username}`);
        continue;
      }

      // Generate username attempt
      let baseUsername = '';
      // Try generating from name first if possible (assuming name format 'First Last')
      if (user.name) {
          const nameParts = user.name.trim().split(/\s+/); // Split by spaces
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : ''; // Get last part as last name

          if (firstName && lastName) {
              const firstInitial = firstName.charAt(0).toLowerCase();
              const lastNameClean = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
              if (lastNameClean) {
                 baseUsername = firstInitial + lastNameClean;
              }
          }
      }

      // Fallback to email prefix if name-based generation failed
      if (!baseUsername && user.email) {
        baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      }

      // Fallback to user+id if other methods failed
      if (!baseUsername) {
        baseUsername = `user${user.id}`;
      }

      // Ensure username is unique for this run
      let finalUsername = baseUsername;
      let counter = 1;
      while (usedUsernames.has(finalUsername.toLowerCase())) {
        finalUsername = `${baseUsername}${counter}`;
        counter++;
      }

      // Add to set and prepare update payload
      usedUsernames.add(finalUsername.toLowerCase());
      usersToUpdate.push({ id: user.id, username: finalUsername, name: user.name || user.email }); // Include name/email for logging

    }

    // Perform updates using dbService
    if (usersToUpdate.length > 0) {
        console.log(`Attempting to update ${usersToUpdate.length} users with new usernames...`);
        let updatedCount = 0;
        for (const updateInfo of usersToUpdate) {
            try {
                await dbService.updateUser(updateInfo.id, { username: updateInfo.username });
                console.log(`Updated user ${updateInfo.id} (${updateInfo.name}) with username: ${updateInfo.username}`);
                updatedCount++;
            } catch (updateError) {
                console.error(`Failed to update user ${updateInfo.id} (${updateInfo.name}) with username ${updateInfo.username}:`, updateError);
                // Decide if you want to stop or continue on error
            }
        }
        console.log(`Successfully updated ${updatedCount} users.`);
    } else {
        console.log("No users required username updates.");
    }


    console.log("Username migration script finished.");

  } catch (error) {
    console.error("Error during username migration script:", error);
  } finally {
    // No explicit connection closing needed when using dbService abstraction
    console.log("Migration process ended.");
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