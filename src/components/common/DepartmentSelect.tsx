import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select, { type SelectProps } from '@/components/ui/Select'; // Try importing as type

interface Department {
    id: number;
    name: string;
    // Add other fields if needed
}

interface DepartmentSelectProps extends Omit<SelectProps, 'options' | 'value' | 'onChange'> {
    value: string | number | undefined; // Allow number or string ID
    onChange: (value: string) => void; // Pass selected value (as string)
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
}

const DepartmentSelect: React.FC<DepartmentSelectProps> = ({
    value,
    onChange,
    placeholder = "Select a department...",
    required,
    disabled,
    className,
    ...rest // Pass any remaining props to the underlying Select component
}) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get('/api/departments');
                if (Array.isArray(response.data)) {
                    setDepartments(response.data);
                } else {
                    throw new Error('Invalid data structure received for departments');
                }
            } catch (err: any) {
                console.error('Error fetching departments:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load departments.');
            } finally {
                setLoading(false);
            }
        };

        fetchDepartments();
    }, []);

    const options = departments.map(dept => ({
        value: dept.id.toString(), // Ensure value is string for consistency
        label: dept.name,
    }));

    // Handle change event from the underlying Select component
    const handleChange = (selectedValue: string) => {
        onChange(selectedValue);
    };

    if (loading) {
        return <p className="text-sm text-gray-500">Loading departments...</p>;
    }

    if (error) {
        return <p className="text-sm text-red-600">Error: {error}</p>;
    }

    return (
        <Select
            options={options}
            value={value?.toString()} // Ensure value passed to Select is string
            onChange={handleChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled || loading}
            className={className}
            {...rest} // Pass down other props like 'name', 'id', etc.
        />
    );
};

export default DepartmentSelect;