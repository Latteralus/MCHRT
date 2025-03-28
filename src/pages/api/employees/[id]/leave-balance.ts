// src/pages/api/employees/[id]/leave-balance.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { Employee, LeaveBalance } from '@/db'; // Import models
import { withAuth, AuthenticatedNextApiHandler } from '@/lib/middleware/withAuth';
// Import the service function (or create a new one for getting all balances)
import { getLeaveBalance } from '@/modules/leave/services/leaveBalanceService';

// Define the handler logic, wrapped with authentication
const handler: AuthenticatedNextApiHandler = async (req, res, session): Promise<void> => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { id } = req.query; // Get the employee ID from the URL path
  const requestingUserId = session.user?.id;
  const requestingUserRole = session.user?.role;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ message: 'Employee ID is required' }); return;
  }

  const targetEmployeeId = parseInt(id, 10);
  if (isNaN(targetEmployeeId)) {
    res.status(400).json({ message: 'Invalid Employee ID format' }); return;
  }

  let employeeRecord: Employee | null = null;

  // Fetch the target employee for authorization checks
  try {
      employeeRecord = await Employee.findByPk(targetEmployeeId, { attributes: ['id', 'userId', 'departmentId'] });
  } catch (error) {
      console.error(`Error fetching employee ${targetEmployeeId} for balance check:`, error);
      res.status(500).json({ message: 'Internal Server Error' }); return;
  }

   if (!employeeRecord) {
    res.status(404).json({ message: 'Employee not found' }); return;
  }

  // Authorization Check:
  let authorized = false;
  if (requestingUserRole === 'Admin') {
    authorized = true; // Admins can view anyone's balance
  } else if (requestingUserRole === 'DepartmentHead') {
    // Check if the employee belongs to the manager's department
    const managerDepartmentId = session.user?.departmentId;
    if (managerDepartmentId && employeeRecord.departmentId === managerDepartmentId) {
      authorized = true;
    }
  } else if (requestingUserRole === 'Employee') {
    // Check if the employee is viewing their own balance
    if (employeeRecord.userId === requestingUserId) {
      authorized = true;
    }
  }

  if (!authorized) {
    res.status(403).json({ message: 'Forbidden: You do not have permission to view this employee\'s leave balance.' }); return;
  }

  // Fetch all leave balances for the authorized employee
  try {
    const balances = await LeaveBalance.findAll({
      where: { employeeId: targetEmployeeId },
      order: [['leaveType', 'ASC']], // Order alphabetically by leave type
    });

    // If no records found, it might mean they haven't accrued/used any yet.
    // The getLeaveBalance service function handles creation on demand,
    // but findAll won't create them. Return empty array is appropriate here.
    res.status(200).json(balances);

  } catch (error) {
    console.error(`Error fetching leave balances for employee ${targetEmployeeId}:`, error);
    res.status(500).json({ message: 'Internal Server Error fetching balances.' });
  }
};

// Apply authentication middleware
export default withAuth(handler);