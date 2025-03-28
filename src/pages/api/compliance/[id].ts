import type { NextApiRequest, NextApiResponse } from 'next';
import Compliance from '@/modules/compliance/models/Compliance';
import { withRole } from '@/lib/middleware/withRole'; // Import withRole
import { AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth'; // Import handler type
// import { defineAssociations } from '@/db/associations';

// TODO: Add more granular authorization (e.g., Dept Head for own dept)
// TODO: Add proper error handling and validation

// Ensure associations are defined
// defineAssociations();

// Define the core handler logic expecting authentication and session
const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const { id } = req.query; // Get the compliance item ID from the URL path

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Compliance Item ID is required' });
  }

  const itemId = parseInt(id, 10);
  if (isNaN(itemId)) {
    return res.status(400).json({ message: 'Invalid Compliance Item ID format' });
  }

  let complianceItem; // To store the found item

  switch (method) {
    case 'GET':
      // Handle GET request - Retrieve a single item by ID
      try {
        complianceItem = await Compliance.findByPk(itemId);
        if (!complianceItem) {
          return res.status(404).json({ message: 'Compliance item not found' });
        }
        res.status(200).json(complianceItem);
      } catch (error) {
        console.error(`Error fetching compliance item ${itemId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'PUT':
      // Handle PUT request - Update an item by ID
      try {
        complianceItem = await Compliance.findByPk(itemId);
        if (!complianceItem) {
          return res.status(404).json({ message: 'Compliance item not found' });
        }

        // Allow updating most fields
        const {
          itemType,
          itemName,
          authority,
          licenseNumber,
          issueDate,
          expirationDate,
          status
        } = req.body;

        const updateData: Partial<Compliance> = {};
        if (itemType) updateData.itemType = itemType;
        if (itemName) updateData.itemName = itemName;
        if (authority !== undefined) updateData.authority = authority;
        if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
        if (issueDate !== undefined) updateData.issueDate = issueDate ? new Date(issueDate) : undefined;
        if (expirationDate !== undefined) updateData.expirationDate = expirationDate ? new Date(expirationDate) : undefined;
        if (status) updateData.status = status; // TODO: Validate status enum

        // Prevent changing employeeId via this route?
        // if (req.body.employeeId) {
        //   return res.status(400).json({ message: 'Cannot change employeeId via update.' });
        // }

        await complianceItem.update(updateData);
        res.status(200).json(complianceItem); // Return the updated item

      } catch (error: any) {
        console.error(`Error updating compliance item ${itemId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'DELETE':
      // Handle DELETE request - Delete an item by ID
      try {
        complianceItem = await Compliance.findByPk(itemId);
        if (!complianceItem) {
          return res.status(404).json({ message: 'Compliance item not found' });
        }

        await complianceItem.destroy();
        res.status(204).end(); // No content to send back
      } catch (error) {
        console.error(`Error deleting compliance item ${itemId}:`, error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap the handler with the RBAC middleware, allowing Admins and Department Heads
// TODO: Add more specific checks inside the handler (e.g., Dept Head only for own dept)
export default withRole(['Admin', 'DepartmentHead'], handler);