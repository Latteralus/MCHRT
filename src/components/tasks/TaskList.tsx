// src/components/tasks/TaskList.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns'; // For formatting dates

// Define the structure for Task data received from the API
interface TaskData {
    id: number;
    title: string;
    description?: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Blocked';
    dueDate?: string; // Assuming API returns date as string
    assignedToId?: number;
    createdById?: number;
    // Add assignedToName etc. if API provides them
}

const TaskList: React.FC = () => {
    const [tasks, setTasks] = useState<TaskData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTasks = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch tasks - TODO: Add filtering based on user/context if needed
                const response = await axios.get<TaskData[]>('/api/tasks');
                setTasks(response.data);
            } catch (err: any) {
                console.error('Error fetching tasks:', err);
                setError(err.response?.data?.message || 'Failed to load tasks.');
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    // Helper to format date string
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'MM/dd/yyyy');
        } catch {
            return 'Invalid Date';
        }
    };

    // Helper to get status badge color
    const getStatusColor = (status: TaskData['status']) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'InProgress': return 'bg-blue-100 text-blue-800';
            case 'Blocked': return 'bg-red-100 text-red-800';
            case 'Pending':
            default: return 'bg-gray-100 text-gray-800';
        }
    };


    if (loading) {
        return <p className="text-gray-500">Loading tasks...</p>;
    }

    if (error) {
        return <p className="text-red-600">Error: {error}</p>;
    }

    return (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <tr key={task.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(task.dueDate)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedToId || 'Unassigned'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    {/* TODO: Add View/Edit/Complete actions */}
                                    <button disabled className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50">View</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                                No tasks found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default TaskList;