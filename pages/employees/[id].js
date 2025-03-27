import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
// Corrected import: Use named import and path alias
import { authOptions } from '@/pages/api/auth/[...nextauth]';
// Use dbService instead of directly using AppDataSource or Employee entity
import { dbService } from '@/utils/dbService';
import EmployeeProfile from '@/components/employee/EmployeeProfile'; // Use alias
import Layout from '@/components/common/Layout'; // Use alias

export default function EmployeeDetailPage({ employeeJson }) {
  // Re-parse employee data on client-side if needed, or use directly
   const employee = employeeJson ? JSON.parse(employeeJson) : null;

  return (
    <Layout>
      <Head>
        <title>
          {employee ? `${employee.firstName} ${employee.lastName} | Mountain Care HR` : 'Employee | Mountain Care HR'}
        </title>
        <meta name="description" content="Employee profile details" />
      </Head>

      <div className="header">
        <div className="page-title">
          <Link href="/employees" className="back-link">
            <i className="fas fa-arrow-left"></i> Employees
          </Link>
          <h1>Employee Profile</h1>
        </div>
      </div>

       {/* Pass parsed data or ID to profile component */}
      {employee ? (
          <EmployeeProfile
            employeeId={employee?.id}
            initialData={employee}
          />
      ) : (
          <p>Employee not found.</p> // Handle case where employee might be null
      )}

    </Layout>
  );
}

export async function getServerSideProps(context) {
  // Check authentication
  const session = await getServerSession(context.req, context.res, authOptions); // Use imported authOptions

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const { id } = context.params;

    // Use dbService to get employee data
    // Assuming getEmployeeById fetches necessary relations ('department', 'manager')
    const employee = await dbService.getEmployeeById(id);

    if (!employee) {
      return {
        notFound: true,
      };
    }

    // Check if user has access to this employee (using helper function might be better here)
    // Simplified check for now: Admin/HR or own record or dept manager for own dept
    const userRole = session.user.role;
    const userDeptId = session.user.departmentId;
    const userEmployeeId = session.user.employeeId;

    const hasAccess =
        userRole === 'admin' ||
        userRole === 'hr_manager' ||
        userEmployeeId === employee.id ||
        (userRole === 'department_manager' && userDeptId === employee.departmentId);


    if (!hasAccess) {
       console.warn(`Access denied for user ${session.user.id} to view employee ${id}`);
       // Redirect to a safe page like dashboard or employees list instead of 404
      return {
         redirect: {
            destination: '/employees', // Or '/'
            permanent: false,
         }
      };
    }

    // Need to stringify complex objects like Date for props
    const employeeJson = JSON.stringify(employee);


    return {
      props: {
        employeeJson, // Pass stringified JSON
      },
    };
  } catch (error) {
    console.error(`Error fetching employee ${context.params.id}:`, error);
    return {
      notFound: true, // Return 404 on error
    };
  }
  // No need to manage DB connection explicitly when using dbService
}