import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
// Corrected import: Use named import and path alias
import { authOptions } from '@/pages/api/auth/[...nextauth]';
// Use dbService instead of directly using AppDataSource or Employee entity
import { dbService } from '@/utils/dbService';
import EmployeeForm from '@/components/employee/EmployeeForm'; // Use alias
import Layout from '@/components/common/Layout'; // Use alias

export default function EditEmployeePage({ employeeJson }) {
   // Re-parse employee data on client-side
   const employee = employeeJson ? JSON.parse(employeeJson) : null;

  return (
    <Layout>
      <Head>
        <title>
          {employee ? `Edit ${employee.firstName} ${employee.lastName} | Mountain Care HR` : 'Edit Employee | Mountain Care HR'}
        </title>
        <meta name="description" content="Edit employee details" />
      </Head>

      <div className="header">
         {employee ? (
             <div className="page-title">
                <Link href={`/employees/${employee.id}`} className="back-link">
                    <i className="fas fa-arrow-left"></i> {employee.firstName} {employee.lastName}
                </Link>
                <h1>Edit Employee</h1>
                <div className="page-subtitle">Update employee information</div>
            </div>
         ) : (
             <h1>Edit Employee</h1> // Fallback title if employee data failed
         )}
      </div>

       {employee ? (
           <EmployeeForm
            employeeId={employee.id}
            initialData={employee}
            />
       ) : (
           <p>Employee data could not be loaded.</p>
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
    const employee = await dbService.getEmployeeById(id);

    if (!employee) {
      return {
        notFound: true,
      };
    }

    // Check if user has permission to edit this employee
    const userRole = session.user.role;
    const userDeptId = session.user.departmentId;

    const canEdit =
        userRole === 'admin' ||
        userRole === 'hr_manager' ||
        (userRole === 'department_manager' && userDeptId === employee.departmentId);


    if (!canEdit) {
       console.warn(`Access denied for user ${session.user.id} to edit employee ${id}`);
      return {
        redirect: {
          destination: `/employees/${id}`, // Redirect back to profile view
          permanent: false,
        },
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
     console.error(`Error fetching employee ${context.params.id} for edit:`, error);
    return {
      notFound: true, // Treat errors as not found for simplicity
    };
  }
   // No need to manage DB connection explicitly when using dbService
}