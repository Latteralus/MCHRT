// src/components/tasks/TaskForm.tsx
import React, { useState } from 'react';
import axios from 'axios';
import Button from '@/components/ui/Button'; // Assuming Button component exists
import Input from '@/components/ui/Input'; // Assuming Input component exists
import Select from '@/components/ui/Select'; // Assuming Select component exists
import Textarea from '@/components/ui/Textarea'; // Assuming Textarea component exists
// Assuming an EmployeeSelect component exists or we use a simple input for MVP
// import EmployeeSelect from '@/components/common/EmployeeSelect';

// Define the structure for form data
interface TaskFormData {
    title: string;
    description?: string;
    status: 'Pending' | 'InProgress' | 'Completed' | 'Blocked';
    dueDate?: string; // Use string for date input
    assignedToId?: string; // Use string for select input value
}

interface TaskFormProps {
    onClose: () => void; // Function to close the form/modal
    onTaskCreated?: (newTask: any) => void; // Optional callback after creation
    // Add props for editing if needed: initialData?: TaskData;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, onTaskCreated }) => {
    const [formData, setFormData] = useState<TaskFormData>({
        title: '',
        description: '',
        status: 'Pending',
        dueDate: '',
        assignedToId: '',
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Convert empty strings to undefined where appropriate for API
        const apiData = {
            ...formData,
            assignedToId: formData.assignedToId ? parseInt(formData.assignedToId) : undefined,
            dueDate: formData.dueDate || undefined,
            description: formData.description || undefined,
        };

        try {
            const response = await axios.post('/api/tasks', apiData);
            console.log('Task created:', response.data);
            if (onTaskCreated) {
                onTaskCreated(response.data);
            }
            onClose(); // Close form on success
        } catch (err: any) {
            console.error('Error creating task:', err);
            setError(err.response?.data?.message || 'Failed to create task.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Basic Modal Structure (Replace with actual Modal component if available)
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Task</h3>
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <Input
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        />
                        <Textarea
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            disabled={isSubmitting}
                        />
                        <Select
                            label="Status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                            disabled={isSubmitting}
                        >
                            {/* Pass options as children */}
                            <option value="Pending">Pending</option>
                            <option value="InProgress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Blocked">Blocked</option>
                        </Select>
                        <Input
                            label="Due Date"
                            name="dueDate"
                            type="date"
                            value={formData.dueDate}
                            onChange={handleChange}
                            disabled={isSubmitting}
                        />
                        {/* Placeholder for Employee Select - Using simple Input for now */}
                        <Input
                             label="Assign To (Employee ID)"
                             name="assignedToId"
                             type="number"
                             value={formData.assignedToId}
                             onChange={handleChange}
                             placeholder="Enter Employee ID"
                             disabled={isSubmitting}
                        />
                        {/* Replace above with:
                        <EmployeeSelect
                            label="Assign To"
                            value={formData.assignedToId}
                            onChange={(value) => setFormData(prev => ({ ...prev, assignedToId: value }))}
                            disabled={isSubmitting}
                        />
                        */}

                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <div className="flex items-center justify-end space-x-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Task'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaskForm;