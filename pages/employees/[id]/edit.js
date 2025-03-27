import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import { AppDataSource } from '../../../utils/db';
import { Employee } from '../../../entities/Employee';
import EmployeeForm from '../../../components/employee/EmployeeForm';

// Import Layout component
import Layout from '../../../components/common/Layout';

export default function EditEmployeePage({ employee }) {
  return (
    <Layout>
      <Head>
        <title>
          {employee ? `Edit ${employee.firstName} ${employee.lastName} | Mountain Care HR` : 'Edit Employee | Mountain Care HR'}
        </title>
        <meta name="description" content="Edit employee details" />
      </Head>

      <div className="header">
        <div className="page-title">
          <Link href={`/employees/${employee.id}`} className="back-link">
            <i className="fas fa-arrow-left"></i> {employee.firstName} {employee.lastName}
          </Link>
          <h1>Edit Employee</h1>
          <div className="page-subtitle">Update employee information</div>
        </div>
      </div>

      <EmployeeForm 
        employeeId={employee.id} 
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
    
    // Check if user has permission to edit this employee
    const canEdit = session.user.role === 'admin' || 
                   session.user.role === 'hr_manager' || 
                   (session.user.role === 'department_head' && session.user.departmentId === employee.departmentId);
    
    if (!canEdit) {
      return {
        redirect: {
          destination: `/employees/${id}`,
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