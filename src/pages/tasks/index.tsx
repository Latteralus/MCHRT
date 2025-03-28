// src/pages/tasks/index.tsx
import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import MainLayout from '@/components/layouts/MainLayout';
import TaskList from '@/components/tasks/TaskList'; // Import TaskList (to be created)
// import TaskForm from '@/components/tasks/TaskForm'; // Import TaskForm later

interface TasksPageProps {
    userRole: string | null;
    // Pass any other necessary props, e.g., userId or employeeId if needed for filtering
}

const TasksPage: React.FC<TasksPageProps> = ({ userRole }) => {
    // State for potentially showing/hiding a TaskForm modal could go here
    // const [showCreateForm, setShowCreateForm] = useState(false);

    // Determine if user can create tasks based on role
    const canCreateTasks = userRole === 'Admin' || userRole === 'Manager' || userRole === 'DepartmentHead';

    return (
        <> {/* Removed redundant MainLayout wrapper */}
            <Head>
                <title>Tasks - Mountain Care HR</title>
            </Head>
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Task Management</h1>
                    {/* Button to open TaskForm modal (implement later) */}
                    {canCreateTasks && ( // Corrected operator
                        <button
                            // onClick={() => setShowCreateForm(true)}
                            disabled // Disable until form/modal is implemented
                            className="btn btn-primary bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {/* <Icon iconName="fas fa-plus" /> */}
                            Create Task
                        </button>
                    )}
                </div>

                {/* TODO: Add filtering options for tasks */}

                <div className="mt-4">
                    <TaskList /> {/* Render the list component */}
                </div>

                {/* TODO: Implement TaskForm modal */}
                {/* {showCreateForm &amp;&amp; <TaskForm onClose={() => setShowCreateForm(false)} />} */}

            </div>
        </> // Moved parenthesis and semicolon after fragment
    );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session) {
        return { redirect: { destination: '/login', permanent: false } };
    }

    // Pass necessary user info (like role) to the page
    return {
        props: {
            userRole: session.user?.role ?? null,
        },
    };
};

export default TasksPage;