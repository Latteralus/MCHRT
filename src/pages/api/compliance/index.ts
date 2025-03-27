import type { NextApiRequest, NextApiResponse } from 'next';
import Compliance from '@/modules/compliance/models/Compliance';
import { Op } from 'sequelize';
// import { defineAssociations } from '@/db/associations';

// TODO: Add authentication and authorization checks
// TODO: Add proper error handling and validation
// TODO: Add logic to automatically update status based on expirationDate?

// Ensure associations are defined
// defineAssociations();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      // Handle GET request - List compliance items
      try {
        // TODO: Add filtering (employeeId, status, type, expiring soon), pagination, sorting
        const { employeeId, status, itemType } = req.query;
        const whereClause: any = {};
        if (employeeId) whereClause.employeeId = parseInt(employeeId as string, 10);
        if (status) whereClause.status = status as string;
        if (itemType) whereClause.itemType = itemType as string;

        // Example: Filter for items expiring within the next 30 days
        // if (req.query.expiringSoon === 'true') {
        //   const today = new Date();
        //   const futureDate = new Date(today.setDate(today.getDate() + 30));
        //   whereClause.expirationDate = {
        //     [Op.between]: [new Date(), futureDate]
        //   };
        //   whereClause.status = { [Op.ne]: 'Expired' }; // Exclude already expired
        // }

        const complianceItems = await Compliance.findAll({
            where: whereClause,
            order: [['expirationDate', 'ASC']] // Show soonest expiring first
            // TODO: Include Employee details if needed
        });
        res.status(200).json(complianceItems);
      } catch (error) {
        console.error('Error fetching compliance items:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Handle POST request - Create a new compliance item
      try {
        const {
          employeeId,
          itemType,
          itemName,
          authority,
          licenseNumber,
          issueDate,
          expirationDate,
          status // Allow setting status manually, or calculate it
        } = req.body;

        // Basic validation
        if (!employeeId || !itemType || !itemName) {
          return res.status(400).json({ message: 'Employee ID, item type, and item name are required' });
        }

        // TODO: Add validation for dates, status enum

        // Determine status automatically if not provided?
        let calculatedStatus = status;
        if (!calculatedStatus && expirationDate) {
            const expDate = new Date(expirationDate);
            const today = new Date();
            const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
            if (expDate < new Date()) {
                calculatedStatus = 'Expired';
            } else if (expDate <= thirtyDaysFromNow) {
                calculatedStatus = 'ExpiringSoon';
            } else {
                calculatedStatus = 'Active';
            }
        } else if (!calculatedStatus) {
            calculatedStatus = 'Active'; // Default if no expiration
        }


        const newItem = await Compliance.create({
          employeeId,
          itemType,
          itemName,
          authority,
          licenseNumber,
          issueDate: issueDate ? new Date(issueDate) : undefined,
          expirationDate: expirationDate ? new Date(expirationDate) : undefined,
          status: calculatedStatus,
        });
        res.status(201).json(newItem);
      } catch (error: any) {
        console.error('Error creating compliance item:', error);
        // Handle potential foreign key constraint errors
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}