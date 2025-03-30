import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Employee, Attendance, Leave, Compliance } from '@/db'; // Import initialized models from central index
import { withErrorHandling } from '@/lib/api/withErrorHandling'; // Assuming this utility exists
import { withRole } from '@/lib/middleware/withRole';
import { Op } from 'sequelize'; // Import Op for date comparisons
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns'; // Import date functions
// Placeholder types for the response data
interface DashboardMetrics {
    employeeStats: {
        total: number;
        trendPercent: number; // Placeholder
        trendDirection: 'up' | 'down'; // Placeholder
    };
    attendanceStats: {
        rate: number; // Placeholder calculation
        trendPercent: number; // Placeholder
        trendDirection: 'up' | 'down'; // Placeholder
    };
    leaveStats: {
        pendingRequests: number;
        trendPercent: number; // Placeholder
        trendDirection: 'up' | 'down'; // Placeholder
    };
    complianceStats: {
        rate: number; // Placeholder calculation
        trendPercent: number; // Placeholder
        trendDirection: 'up' | 'down'; // Placeholder
    };
}

// Helper function to calculate trend percentage and direction
const calculateTrend = (current: number, previous: number): { trendPercent: number; trendDirection: 'up' | 'down' } => {
    if (previous === 0) {
        // Avoid division by zero; if previous was 0 and current is > 0, it's a 100% increase (or infinite)
        // Represent as 100% increase for simplicity, or handle as a special case if needed.
        return { trendPercent: current > 0 ? 100 : 0, trendDirection: current > 0 ? 'up' : 'down' };
    }
    const change = ((current - previous) / previous) * 100;
    return {
        trendPercent: Math.abs(parseFloat(change.toFixed(1))), // Keep one decimal place
        trendDirection: change >= 0 ? 'up' : 'down',
    };
};

const handler = async (req: NextApiRequest, res: NextApiResponse<DashboardMetrics | { message: string }>) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }

    const session = await getSession({ req });
    if (!session?.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    // Optional: Add role check if only specific roles can view dashboard metrics
    // await checkRole(['Admin', 'Manager'])(req, res); // Example usage

    try {
        // --- Define Date Ranges ---
        const now = new Date();
        const todayStart = startOfDay(now); // Use startOfDay for today's attendance
        const todayEnd = endOfDay(now);     // Use endOfDay for today's attendance
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        const previousMonthStart = startOfMonth(subMonths(now, 1));
        const previousMonthEnd = endOfMonth(subMonths(now, 1));

        // --- Fetch Metrics ---

        // 1. Employee Stats & Trend
        const totalEmployees = await Employee.count(); // Assuming count is for active employees if model has status
        const employeesAtStartOfMonth = await Employee.count({
             where: {
                 // Count employees hired on or before the start of the current month
                 // AND who haven't been terminated before the start of the month (if termination date exists)
                 hireDate: { [Op.lte]: currentMonthStart },
                 // terminationDate: { [Op.or]: [null, { [Op.gte]: currentMonthStart }] } // Example if terminationDate exists
             }
        });
        const employeeTrend = calculateTrend(totalEmployees, employeesAtStartOfMonth);

        // 2. Attendance Stats & Trend (Simplified Rate Calculation based on record existence)
        // Note: This is a very basic rate. A real rate needs total expected workdays.
        // Count unique employee days with attendance records in the current month
        const attendanceCurrentMonth = await Attendance.count({
            distinct: true, // Count distinct employeeId-date pairs if needed, or just total records
            col: 'employeeId', // Example: Count distinct employees who attended at least once
            where: {
                date: { [Op.between]: [formatDate(currentMonthStart), formatDate(currentMonthEnd)] },
                // Optionally add: timeIn: { [Op.ne]: null } // Count only if clocked in
            }
        });
        // Calculate Today's Attendance Rate
        const attendedTodayCount = await Attendance.count({
            distinct: true,
            col: 'employeeId',
            where: {
                date: { [Op.between]: [formatDate(todayStart), formatDate(todayEnd)] }, // Check for today's date
                timeIn: { [Op.not]: undefined } // Ensure they actually clocked in (Try checking against undefined)
            }
        });

        // Calculate the rate based on today's attendance vs total employees
        const currentAttendanceRate = totalEmployees > 0
            ? (attendedTodayCount / totalEmployees) * 100
            : 0; // Avoid division by zero, default to 0% if no employees

        // Use monthly counts for trend calculation
        const currentAttendanceMetric = attendanceCurrentMonth;
        // Count unique employee days with attendance records in the previous month
        const attendancePreviousMonth = await Attendance.count({
             distinct: true,
             col: 'employeeId',
             where: {
                 date: { [Op.between]: [formatDate(previousMonthStart), formatDate(previousMonthEnd)] },
                 // Optionally add: timeIn: { [Op.ne]: null }
             }
        });
        const previousAttendanceMetric = attendancePreviousMonth; // Use count as the metric for trend

        // Calculate trend based on the counts (or placeholder rates if counts aren't comparable)
        const attendanceTrend = calculateTrend(currentAttendanceMetric, previousAttendanceMetric);


        // 3. Leave Stats & Trend
        const pendingLeaveRequests = await Leave.count({ where: { status: 'Pending' } });
        // Count pending requests at the start of the month (created before month start, still pending)
        const pendingAtStartOfMonth = await Leave.count({
            where: {
                status: 'Pending',
                createdAt: { [Op.lt]: currentMonthStart } // Created before this month started
            }
         });
         // Estimate previous pending: pending now - created this month + resolved this month
         // This is complex without historical status. Simpler: compare pending now vs pending at start of month.
        const leaveTrend = calculateTrend(pendingLeaveRequests, pendingAtStartOfMonth);


        // 4. Compliance Stats & Trend (Simplified Rate, No Trend Yet)
        // TODO: Define what constitutes a "compliant" item vs total relevant items.
        // Example: Count items not expired vs total items.
        const totalComplianceItems = await Compliance.count(); // Or count based on active employees/required items
        const nonCompliantItems = await Compliance.count({
            where: {
                // Define non-compliant criteria, e.g., expired date or specific status
                // expirationDate: { [Op.lt]: now }, // Example: expired items
                status: 'NonCompliant' // Example if status field exists
            }
        });
        const compliantItems = totalComplianceItems - nonCompliantItems;
        const currentComplianceRate = totalComplianceItems > 0 ? (compliantItems / totalComplianceItems) * 100 : 100; // Default to 100% if no items?

        // TODO: Compliance trend calculation is complex without historical data or status changes.
        // Skipping trend calculation for now.
        const complianceTrend = { trendPercent: 0, trendDirection: 'up' as 'up' | 'down' }; // Placeholder trend

        // --- Construct Response ---
        const metrics: DashboardMetrics = {
            employeeStats: {
                total: totalEmployees,
                trendPercent: employeeTrend.trendPercent,
                trendDirection: employeeTrend.trendDirection,
            },
            attendanceStats: {
                rate: parseFloat(currentAttendanceRate.toFixed(1)), // Format rate
                trendPercent: attendanceTrend.trendPercent,
                trendDirection: attendanceTrend.trendDirection,
            },
            leaveStats: {
                pendingRequests: pendingLeaveRequests,
                trendPercent: leaveTrend.trendPercent,
                trendDirection: leaveTrend.trendDirection,
            },
            complianceStats: {
                rate: parseFloat(currentComplianceRate.toFixed(1)), // Format rate
                trendPercent: complianceTrend.trendPercent, // Using placeholder
                trendDirection: complianceTrend.trendDirection, // Using placeholder
            },
        };

        return res.status(200).json(metrics);

    } catch (error) {
        // Error handling is managed by withErrorHandling, but you can add specific logging here
        console.error('Error fetching dashboard metrics:', error);
        // Let the wrapper handle the response
        throw error;
    }
};

// Wrap the handler with error handling and potentially other middleware
// Helper to format date for Sequelize query
const formatDate = (date: Date): string => {
    // Format as YYYY-MM-DD, suitable for DATEONLY fields
    return date.toISOString().split('T')[0];
};

export default withErrorHandling(handler);
// If using role check: export default withErrorHandling(checkRole(['Admin', 'Manager'])(handler));