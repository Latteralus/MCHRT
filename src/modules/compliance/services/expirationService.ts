// src/modules/compliance/services/expirationService.ts
import { Compliance } from '../../../db'; // Use relative path
import { Op, literal } from 'sequelize';
import { getSequelizeInstance } from '@/db/mockDbSetup'; // Import the getter function
import { sendComplianceExpirationReminders } from '@/modules/notifications/services/reminderService'; // Import reminder service

const EXPIRING_SOON_DAYS = 30; // Define threshold for "ExpiringSoon"

/**
 * Checks compliance items for expiration and updates their status.
 * Runs within a transaction.
 */
export const checkComplianceExpirations = async (): Promise<{ updatedToExpired: number; updatedToExpiringSoon: number; revertedToActive: number }> => {
    console.log('Starting compliance expiration check...');
    const sequelize = getSequelizeInstance(); // Get the instance
    const transaction = await sequelize.transaction();
    let updatedToExpired = 0;
    let updatedToExpiringSoon = 0;
    let revertedToActive = 0;

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day for comparison

        const soonDate = new Date(today);
        soonDate.setDate(today.getDate() + EXPIRING_SOON_DAYS);

        // 1. Find items that are expired (expirationDate < today) and update status to 'Expired'
        // Only update if status is not already 'Expired'
        const [expiredCount] = await Compliance.update(
            { status: 'Expired' },
            {
                where: {
                    expirationDate: { [Op.lt]: today },
                    status: { [Op.ne]: 'Expired' } // Avoid unnecessary updates
                },
                transaction
            }
        );
        updatedToExpired = expiredCount;
        if (expiredCount > 0) console.log(`Updated ${expiredCount} items to 'Expired'.`);

        // 2. Find items expiring soon (today <= expirationDate < soonDate) and update status to 'ExpiringSoon'
        // Only update if status is not already 'ExpiringSoon' or 'Expired'
        const [expiringSoonCount] = await Compliance.update(
            { status: 'ExpiringSoon' },
            {
                where: {
                    expirationDate: {
                        [Op.gte]: today,
                        [Op.lt]: soonDate
                    },
                    status: { [Op.notIn]: ['ExpiringSoon', 'Expired'] } // Avoid unnecessary updates
                },
                transaction
            }
        );
        updatedToExpiringSoon = expiringSoonCount;
        if (expiringSoonCount > 0) console.log(`Updated ${expiringSoonCount} items to 'ExpiringSoon'.`);

        // 3. Find items previously 'ExpiringSoon' that are now outside the threshold (expirationDate >= soonDate)
        // and revert status to 'Active'. This handles cases where expiration dates might be pushed out.
        const [revertedCount] = await Compliance.update(
            { status: 'Active' },
            {
                where: {
                    expirationDate: { [Op.gte]: soonDate },
                    status: 'ExpiringSoon' // Only revert items currently marked as expiring soon
                },
                transaction
            }
        );
        revertedToActive = revertedCount;
        if (revertedCount > 0) console.log(`Reverted ${revertedCount} items from 'ExpiringSoon' back to 'Active'.`);


        await transaction.commit();
        console.log('Compliance expiration check completed successfully.');

        // After successful status updates, trigger reminder checks
        // Run these outside the transaction to avoid locking/long transactions if email sending is slow
        // Use a separate try/catch for reminders so failure doesn't affect the main function result
        try {
            console.log('Triggering compliance reminder checks...');
            // Run checks concurrently
            await Promise.all([
                sendComplianceExpirationReminders(30), // Check for 30 days out
                sendComplianceExpirationReminders(14), // Check for 14 days out
                sendComplianceExpirationReminders(7)   // Check for 7 days out
                // Add more intervals if needed (e.g., 1 day)
            ]);
            console.log('Compliance reminder checks completed.');
        } catch (reminderError) {
            console.error('Error during compliance reminder sending:', reminderError);
            // Decide how to handle reminder errors - log, alert, etc.
            // Don't re-throw here to allow the main function to return successfully
        }

        return { updatedToExpired, updatedToExpiringSoon, revertedToActive };

    } catch (error) {
        await transaction.rollback();
        console.error('Error during compliance expiration check. Transaction rolled back.', error);
        throw error; // Re-throw the error to be handled by the caller (e.g., the cron job runner)
    }
};