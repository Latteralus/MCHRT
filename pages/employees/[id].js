import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import { AppDataSource } from '../../utils/db';
import { Employee } from '../../entities/Employee';
import EmployeeProfile from '../../components/employee/EmployeeProfile';

// Import Layout component
import Layout from '../../components/common/Layout';

export default function EmployeeDetailPage({ employee }) {
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

      <EmployeeProfile 
        employeeId={employee?.id} 
        initialData={employee}
      />
    </Layout>
  );
}

export async function getServerSideProps(context) {
  // Check authentication
  const session = await getServerSession(context.req, context.res, authOptions);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
  
  try {
    // Get employee ID from URL
    const { id } = context.params;
    
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    
    // Get employee with related data
    const employeeRepository = AppDataSource.getRepository(Employee);
    const employee = await employeeRepository.findOne({
      where: { id },
      relations: ['department', 'manager']
    });
    
    // If employee not found, return 404
    if (!employee) {
      return {
        notFound: true,
      };
    }
    
    // Check if user has access to this employee
    if (session.user.role === 'department_head' && session.user.departmentId !== employee.departmentId) {
      return {
        redirect: {
          destination: '/employees',
          permanent: false,
        },
      };
    }
    
    // Return employee data
    return {
      props: {
        employee: JSON.parse(JSON.stringify(employee)),
      },
    };
  } catch (error) {
    console.error('Error fetching employee:', error);
    
    // Return not found on error
    return {
      notFound: true,
    };
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      // Leave connection open for other requests
      // await AppDataSource.destroy();
    }
  }
}