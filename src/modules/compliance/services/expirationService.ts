// src/modules/compliance/services/expirationService.ts
import { Compliance } from '@/db';
import { Op, literal } from 'sequelize';
import { sequelize } from '@/db/mockDbSetup'; // For transaction

const EXPIRING_SOON_DAYS = 30; // Define threshold for "ExpiringSoon"

/**
 * Checks compliance items for expiration and updates their status.
 * Runs within a transaction.
 */
export const checkComplianceExpirations = async (): Promise<{ updatedToExpired: number; updatedToExpiringSoon: number; revertedToActive: number }> => {
    console.log('Starting compliance expiration check...');
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
        return { updatedToExpired, updatedToExpiringSoon, revertedToActive };

    } catch (error) {
        await transaction.rollback();
        console.error('Error during compliance expiration check. Transaction rolled back.', error);
        throw error; // Re-throw the error to be handled by the caller (e.g., the cron job runner)
    }
};