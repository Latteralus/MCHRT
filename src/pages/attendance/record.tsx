// src/pages/attendance/record.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import AttendanceForm from '@/components/attendance/AttendanceForm';
import MainLayout from '@/components/layouts/MainLayout'; // Assuming a main layout exists
// Placeholder: Import function to fetch employees
// import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Adjust path
// Placeholder: Import Employee type if needed for props
// import { Employee } from '@/db';

interface RecordAttendancePageProps {
  employees: { id: number; name: string }[]; // Simplified employee list for select
}

const RecordAttendancePage: React.FC<RecordAttendancePageProps> = ({ employees }) => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <AttendanceForm employees={employees} />
      </div>
    </MainLayout>
  );
};

// Fetch employees server-side to populate the dropdown
export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  // Protect route: Redirect if not authenticated
  if (!session) {
    return {
      redirect: {
        destination: '/login', // Adjust login path if needed
        permanent: false,
      },
    };
  }

  // TODO: Add role-based access control here if needed (e.g., only Admins/Managers can record for others)
  // const userRole = session.user?.role;
  // if (userRole !== 'Admin' && userRole !== 'DepartmentHead') {
  //   return {
  //     redirect: { destination: '/', permanent: false }, // Or a 'forbidden' page
  //   };
  // }


  let employees: { id: number; name: string }[] = [];
  try {
    // Placeholder: Replace with actual API call or direct DB query if appropriate for SSR
    console.log('SSR: Fetching employees for attendance form...');
    // employees = await fetchEmployeesForSelect(); // Example API call
    // Or direct DB access (ensure DB connection is handled properly in SSR context)
    // const employeeRecords = await Employee.findAll({ attributes: ['id', 'firstName', 'lastName'], order: [['lastName', 'ASC']] });
    // employees = employeeRecords.map(emp => ({ id: emp.id, name: `${emp.lastName}, ${emp.firstName}` }));

    // Using placeholder data for now
    employees = [
      { id: 1, name: 'Doe, John' },
      { id: 2, name: 'Smith, Jane' },
      { id: 3, name: 'Williams, Bob' },
    ];

  } catch (error) {
    console.error('SSR Error fetching employees:', error);
    // Handle error appropriately, maybe return an empty list or show an error state
  }

  return {
    props: {
      employees,
      session, // Pass session to the page if needed by MainLayout or other components
    },
  };
};

export default RecordAttendancePage;