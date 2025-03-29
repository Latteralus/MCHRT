import type { NextApiRequest, NextApiResponse } from 'next';
// Removed duplicate Offboarding import
import Employee from '@/modules/employees/models/Employee';
import { Offboarding } from '@/modules/offboarding/models/Offboarding';
import { TaskTemplate } from '@/modules/offboarding/models/TaskTemplate';
import { OffboardingTask, TaskStatus } from '@/modules/offboarding/models/OffboardingTask'; // Import TaskStatus type
import { withErrorHandling } from '@/lib/api/withErrorHandling';
import { AuthenticatedNextApiHandler, withAuth } from '@/lib/middleware/withAuth';
import { defineAssociations } from '@/db/associations';
import { Op } from 'sequelize';
import { sequelize } from '@/db/sequelize'; // Import sequelize for transaction (optional but recommended)

// Define associations
defineAssociations();

// Define expected data structures
interface OffboardingListData {
  id: number;
  name: string; // Employee name
  exitDate: string;
  progress: number; // Progress based on status
  reason?: string;
  status: string; // Include status in response
}

interface NewOffboardingInput {
  employeeId: number;
  exitDate: string;
  reason?: string;
}

const handler: AuthenticatedNextApiHandler = async (req, res, session) => {
  const { method } = req;
  const userRole = session.user?.role; // Assuming role is available in session

  // Authorization: Only Admins and HR roles (adjust as needed) can manage offboarding
  if (userRole !== 'Admin' && userRole !== 'HR') { // Allow both Admin and HR
     return res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
  }

  switch (method) {
    case 'GET':
      // Fetch list of active offboarding processes
      try {
        // Define base filter to exclude 'Cancelled'
        const baseWhere: any = {
          status: { [Op.not]: 'Cancelled' }
        };

        // Add specific status filter if requested
        if (req.query.status === 'active') {
          baseWhere.status = { [Op.in]: ['Pending', 'InProgress'] };
        } else if (req.query.status === 'pending') {
            baseWhere.status = 'Pending';
        } else if (req.query.status === 'inprogress') {
            baseWhere.status = 'InProgress';
        } else if (req.query.status === 'completed') {
            baseWhere.status = 'Completed';
        }
        // If no specific status or 'all' (excluding cancelled), baseWhere is used

        const offboardings = await Offboarding.findAll({
          where: baseWhere,
          include: [{
            model: Employee,
            as: 'employee',
            attributes: ['firstName', 'lastName'], // Fetch employee name parts
          }],
          order: [['exitDate', 'ASC']],
        });

        // Format the response
        // Function to calculate progress based on status
        const calculateProgress = (status: Offboarding['status']): number => {
            switch (status) {
                case 'Pending': return 10;
                case 'InProgress': return 50;
                case 'Completed': return 100;
                default: return 0; // Should not happen due to filter
            }
        };

        const responseData: OffboardingListData[] = offboardings.map(ob => ({
          id: ob.id,
          name: `${ob.employee?.lastName ?? 'N/A'}, ${ob.employee?.firstName ?? 'N/A'}`,
          exitDate: ob.exitDate,
          reason: ob.reason,
          status: ob.status, // Include status
          progress: calculateProgress(ob.status), // Calculate progress
        }));

        res.status(200).json(responseData);
      } catch (error) {
        console.error('Error fetching offboardings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;

    case 'POST':
      // Create a new offboarding process
      // Consider using a transaction for atomicity
      const transaction = await sequelize.transaction();
      try {
        const { employeeId, exitDate, reason } = req.body as NewOffboardingInput; // Consider Zod validation

        // Basic validation
        if (!employeeId || !exitDate) {
          return res.status(400).json({ message: 'Employee ID and Exit Date are required.' });
        }

        // Check if employee exists (optional but good practice)
        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            await transaction.rollback(); // Rollback if employee not found
            return res.status(404).json({ message: 'Employee not found.' });
        }

        // Check if employee is already being offboarded (due to unique constraint)
        // The unique constraint on employeeId in the model/migration handles this,
        // but we can provide a friendlier error message.
        const existingOffboarding = await Offboarding.findOne({ where: { employeeId } });
        if (existingOffboarding) {
            await transaction.rollback();
            return res.status(409).json({ message: 'This employee is already in an offboarding process.' });
        }

        // 1. Create the Offboarding record

        const newOffboarding = await Offboarding.create({
          employeeId,
          exitDate,
          reason,
          status: 'Pending', // Initial status
        }, { transaction });

        // 2. Update Employee status
        employee.status = 'Terminating';
        await employee.save({ transaction });

        // 3. Create default OffboardingTasks
        const defaultTasks = await TaskTemplate.findAll({ transaction });
        if (defaultTasks.length > 0) {
            const tasksToCreate = defaultTasks.map(template => ({
                offboardingId: newOffboarding.id,
                description: template.description,
                status: 'Pending' as TaskStatus, // Explicitly cast to TaskStatus and removed duplicate line
                assignedRole: template.defaultAssignedRole, // Assign role from template
                // assignedToUserId: null, // Initially unassigned to specific user
            }));
            await OffboardingTask.bulkCreate(tasksToCreate, { transaction });
        }

        // Commit transaction if all steps succeed
        await transaction.commit();

        res.status(201).json(newOffboarding); // Return the created offboarding record

      } catch (error: any) {
        // Rollback transaction on any error
        await transaction.rollback();

        console.error('Error creating offboarding:', error);
        // Specific error for unique constraint handled by withErrorHandling or below if needed
        // if (error.name === 'SequelizeUniqueConstraintError') {
        //      return res.status(409).json({ message: 'This employee is already in an offboarding process.' });
        // }
        // Let withErrorHandling manage the response for other errors
        throw error; // Re-throw for withErrorHandling
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
};

// Wrap with authentication and error handling
export default withErrorHandling(withAuth(handler)); // Correct order: withAuth first