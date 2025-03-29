// src/pages/attendance/record.tsx
import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import AttendanceForm from '@/components/attendance/AttendanceForm';
// MainLayout is applied globally via _app.tsx
import axios from 'axios'; // Import axios for SSR fetch
// Placeholder: Import function to fetch employees
// import { fetchEmployeesForSelect } from '@/lib/api/employees'; // Adjust path
// Placeholder: Import Employee type if needed for props
// import { Employee } from '@/db';

interface RecordAttendancePageProps {
  employees: { id: number; name: string }[]; // Simplified employee list for select
}

const RecordAttendancePage: React.FC<RecordAttendancePageProps> = ({ employees }) => {
  // MainLayout is applied via _app.tsx, remove wrapper here
  return (
      <div className="container mx-auto p-4"> {/* Adjust container/padding as needed */}
        <AttendanceForm employees={employees} />
      </div>
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
    console.log('SSR: Fetching employees for attendance form...');
    try {
        // Construct absolute URL for server-side API call
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'; // Fallback for local dev
        const url = new URL('/api/employees', baseUrl);
        url.searchParams.append('select', 'id,firstName,lastName'); // Request specific fields
        url.searchParams.append('sortBy', 'lastName'); // Sort for dropdown
        url.searchParams.append('sortOrder', 'asc');

        const response = await axios.get<{ id: number; firstName: string; lastName: string }[]>(url.toString(), {
             // Pass cookies from the incoming request to the API route for authentication
             headers: {
                Cookie: context.req.headers.cookie || '',
             }
        });
        // Format name for display
        employees = response.data.map(emp => ({
            id: emp.id,
            name: `${emp.lastName}, ${emp.firstName}`
        }));

    } catch (error: any) {
        console.error('SSR Error fetching employees for filter:', error.message);
        // Keep employees array empty, page can handle this
    }

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