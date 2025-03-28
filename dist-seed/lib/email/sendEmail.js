"use strict";
// src/lib/email/sendEmail.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
/**
 * Sends an email.
 *
 * NOTE: This is a placeholder implementation. In a real application,
 * this function would integrate with an email sending service (e.g., SendGrid, Mailgun)
 * or use a library like Nodemailer with SMTP configuration.
 * It currently just logs the email details to the console.
 *
 * @param options - Email options including recipient, subject, and body.
 * @returns Promise<void>
 */
const sendEmail = async (options) => {
    const { to, subject, text, html, from = process.env.EMAIL_FROM || 'noreply@mountaincare.example' } = options;
    console.log('--- Sending Email (Placeholder) ---');
    console.log(`From: ${from}`);
    console.log(`To: ${Array.isArray(to) ? to.join(', ') : to}`);
    console.log(`Subject: ${subject}`);
    if (text) {
        console.log('--- Text Body ---');
        console.log(text);
        console.log('-----------------');
    }
    if (html) {
        console.log('--- HTML Body ---');
        console.log(html); // In a real scenario, avoid logging potentially large HTML
        console.log('-----------------');
    }
    console.log('---------------------------------');
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    // In a real implementation:
    // try {
    //   const transport = /* setup nodemailer or SDK */;
    //   await transport.sendMail({ from, to, subject, text, html });
    //   console.log('Email sent successfully.');
    // } catch (error) {
    //   console.error('Error sending email:', error);
    //   throw new Error('Failed to send email.'); // Re-throw or handle appropriately
    // }
};
exports.sendEmail = sendEmail;
