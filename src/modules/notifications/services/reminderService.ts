// src/modules/notifications/services/reminderService.ts

import Compliance from '@/modules/compliance/models/Compliance'; // Corrected default import
import Employee from '@/modules/employees/models/Employee'; // Corrected default import
import User from '@/modules/auth/models/User'; // Corrected default import
import { sendEmail } from '@/lib/email/sendEmail';
import { Op, literal } from 'sequelize';
import { format } from 'date-fns'; // For formatting dates in emails

interface ComplianceItemWithEmployee extends Compliance {
    employee?: Employee & { user?: User }; // Corrected operator: Include nested Employee and User
}

/**
 * Checks for compliance items expiring soon and sends email reminders.
 * @param daysUntilExpiry - Number of days before expiry to send the reminder (e.g., 30, 14, 7).
 */
export const sendComplianceExpirationReminders = async (daysUntilExpiry: number): Promise<void> => {
    console.log(`Checking for compliance items expiring in exactly ${daysUntilExpiry} days...`);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysUntilExpiry);

    try {
        const expiringItems: ComplianceItemWithEmployee[] = await Compliance.findAll({
            where: {
                // Compare only the date part, ignoring time
                expirationDate: {
                    [Op.eq]: literal(`date('${targetDate.toISOString().split('T')[0]}')`),
                },
                // Optionally filter out items already marked as 'Renewed' or 'Inactive' if applicable
                // status: { [Op.notIn]: ['Renewed', 'Inactive'] }
            },
            include: [
                {
                    model: Employee,
                    as: 'employee', // Ensure alias matches association definition
                    attributes: ['id', 'firstName', 'lastName', 'userId'], // Include userId
                    include: [{
                        model: User,
                        as: 'user', // Ensure alias matches association definition
                        attributes: ['username'], // Fetch username (assuming it's the email)
                        required: true // Only include if user exists
                    }]
                }
            ],
        });

        if (expiringItems.length === 0) {
            console.log(`No compliance items found expiring in ${daysUntilExpiry} days.`);
            return;
        }

        console.log(`Found ${expiringItems.length} compliance items expiring in ${daysUntilExpiry} days. Sending reminders...`);

        for (const item of expiringItems) {
            const employee = item.employee;
            const user = employee?.user;
            const recipientEmail = user?.getDataValue('username'); // Use getDataValue, assuming username is email
            const employeeName = `${employee?.firstName || ''} ${employee?.lastName || ''}`.trim();

            if (!recipientEmail) {
                console.warn(`Skipping reminder for compliance item ID ${item.id}: No associated user email found for employee ID ${employee?.id}.`);
                continue;
            }

            // Skip if expiration date is null
            if (!item.expirationDate) {
                 console.warn(`Skipping reminder for compliance item ID ${item.id}: Expiration date is null.`);
                 continue;
            }

            const subject = `Compliance Reminder: ${item.itemName} Expires Soon`; // Use itemName
            // expirationDate is DATEONLY, so new Date() should parse it correctly
            const formattedExpiryDate = format(new Date(item.expirationDate), 'MMMM d, yyyy');
            const textBody = `Dear ${employeeName || 'Employee'},\n\nThis is a reminder that your compliance item "${item.itemName}" is set to expire on ${formattedExpiryDate}.\n\nPlease take the necessary steps to renew it before the expiration date.\n\nThank you,\nMountain Care HR`; // Use itemName
            // TODO: Create a proper HTML template later
            const htmlBody = `<p>Dear ${employeeName || 'Employee'},</p><p>This is a reminder that your compliance item "<strong>${item.itemName}</strong>" is set to expire on <strong>${formattedExpiryDate}</strong>.</p><p>Please take the necessary steps to renew it before the expiration date.</p><p>Thank you,<br/>Mountain Care HR</p>`; // Use itemName

            try {
                await sendEmail({
                    to: recipientEmail,
                    subject: subject,
                    text: textBody,
                    html: htmlBody,
                });
                console.log(`Reminder sent to ${recipientEmail} for compliance item ID ${item.id}.`);
            } catch (emailError) {
                console.error(`Failed to send reminder for compliance item ID ${item.id} to ${recipientEmail}:`, emailError);
                // Decide if you want to stop or continue processing other reminders
            }
        }

        console.log('Finished sending compliance expiration reminders.');

    } catch (error) {
        console.error('Error fetching or processing compliance expiration reminders:', error);
        // Handle or throw the error as appropriate for the calling context (e.g., a cron job)
    }
};

// TODO: Add functions for other reminder types (e.g., onboarding task due dates)
// export const sendOnboardingTaskReminders = async () => { ... };