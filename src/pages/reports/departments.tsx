import React from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import Head from 'next/head';
// Placeholder: Import department selection component or data fetching

interface DepartmentReportsPageProps {
    currentUserRole: string | null;
    userDepartmentId?: number | null; // Pass department ID if user is a Dept Head
}

const DepartmentReportsPage: React.FC<DepartmentReportsPageProps> = ({ currentUserRole, userDepartmentId }) => {

    // TODO: Fetch and display department-specific reports based on role/selection
    // - Admins might select a department.
    // - Dept Heads see their own department.

    let content = <p>You do not have permission to view department reports.</p>;

    if (currentUserRole === 'Admin') {
        content = (
            <div>
                <p className="mb-4">Select a department to view its report.</p>
                {/* TODO: Add Department Select dropdown */}
            </div>
        );
    } else if (currentUserRole === 'DepartmentHead' && userDepartmentId) {
         content = (
            <div>
                <p className="mb-4">Displaying report for your department (ID: {userDepartmentId}).</p>
                {/* TODO: Fetch and display report data for userDepartmentId */}
            </div>
        );
    }


    return (
        <MainLayout>
            <Head>
                <title>Department Reports - Mountain Care HR</title>
            </Head>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-semibold mb-4">Department Reports</h1>
                {content}
            </div>
        </MainLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    const currentUserRole = session.user?.role as string | null;
    const userDepartmentId = session.user?.departmentId as number | undefined | null;

    // Allow Admins and Department Heads to access this page
    if (currentUserRole !== 'Admin' && currentUserRole !== 'DepartmentHead') {
         return {
            // Redirect or show a 'forbidden' message appropriate for your app
            // For simplicity, redirecting to dashboard
             redirect: { destination: '/', permanent: false },
             // Or: props: { currentUserRole: null, userDepartmentId: null } and handle in component
         };
    }

    // TODO: Fetch list of departments if Admin role for selection dropdown

    return {
        props: {
            currentUserRole,
            userDepartmentId: userDepartmentId ?? null,
        },
    };
};


export default DepartmentReportsPage;