import Head from 'next/head';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import EmployeeForm from '../../components/employee/EmployeeForm';

// Import Layout component
import Layout from '../../components/common/Layout';

export default function NewEmployeePage() {
  return (
    <Layout>
      <Head>
        <title>Add New Employee | Mountain Care HR</title>
        <meta name="description" content="Add a new employee to the system" />
      </Head>

      <div className="header">
        <div className="page-title">
          <Link href="/employees" className="back-link">
            <i className="fas fa-arrow-left"></i> Employees
          </Link>
          <h1>Add New Employee</h1>
          <div className="page-subtitle">Enter employee details to create a new record</div>
        </div>
      </div>

      <EmployeeForm />
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
  
  // Check if user has permission to add employees
  if (session.user.role !== 'admin' && session.user.role !== 'hr_manager') {
    return {
      redirect: {
        destination: '/employees',
        permanent: false,
      },
    };
  }
  
  return {
    props: {},
  };
}