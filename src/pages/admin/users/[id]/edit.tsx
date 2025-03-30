import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import MainLayout from '@/components/layouts/MainLayout';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { withPageAuth } from '@/lib/hoc/withPageAuth';
import { Role } from '@/types/roles';
import { Department } from '@/db'; // Import from central db index

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return res.json();
});

// Define a type for the user data structure expected from the API
interface UserType {
    id: number;
    username: string;
    role: Role; // Use the Role enum
    departmentId?: number;
}

const EditUserPage = () => {
    const router = useRouter();
    const { id } = router.query;

    // Fetch user data
    const { data: user, error: userError, isLoading: userLoading } = useSWR<UserType>(
        id ? `/api/users/${id}` : null,
        fetcher
    );
    // Fetch departments for the dropdown
    // Assuming the API returns data compatible with Department model structure
    const { data: departments, error: deptsError, isLoading: deptsLoading } = useSWR<InstanceType<typeof Department>[]>('/api/departments', fetcher); // Use InstanceType

    const [username, setUsername] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role>(Role.EMPLOYEE);
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pre-fill form when user data loads
    useEffect(() => {
        if (user) {
            setUsername(user.username);
            setSelectedRole(user.role);
            setSelectedDepartmentId(user.departmentId?.toString() || '');
        }
    }, [user]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!username.trim()) {
            setError('Username cannot be empty.');
            setIsLoading(false);
            return;
        }

        const departmentId = selectedDepartmentId ? parseInt(selectedDepartmentId, 10) : undefined;

        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    role: selectedRole,
                    departmentId,
                    // Not sending password for update in this version
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update user');
            }

            router.push('/admin/users');

        } catch (err: any) {
            console.error('Update failed:', err);
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    const roleOptions = Object.values(Role).map(role => ({ value: role, label: role }));
    const departmentOptions = departments
        ? departments.map(dept => ({ value: dept.id.toString(), label: dept.name }))
        : [];

    const isDataLoading = userLoading || deptsLoading;
    const fetchError = userError || deptsError;

    if (isDataLoading) {
        return <MainLayout><div className="text-center p-4">Loading user data...</div></MainLayout>;
    }

    if (fetchError) {
        return <MainLayout><Alert type="danger">Error loading data: {fetchError.message}</Alert></MainLayout>;
    }

    if (!user) {
        return <MainLayout><Alert type="warning">User not found.</Alert></MainLayout>;
    }

    return (
        <MainLayout>
            <h1 className="text-2xl font-semibold mb-4">Edit User: {user.username}</h1>

            {error && <Alert type="danger" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                {/* Username */}
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                    </label>
                    <Input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>

                {/* Role */}
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                    </label>
                    <Select
                        id="role"
                        name="role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as Role)}
                        required
                        className="w-full"
                        disabled={isLoading}
                    >
                        {roleOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>

                {/* Department (Optional) */}
                <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        Department (Optional)
                    </label>
                    <Select
                        id="department"
                        name="department"
                        value={selectedDepartmentId}
                        onChange={(e) => setSelectedDepartmentId(e.target.value)}
                        className="w-full"
                        disabled={isLoading} // Already handled deptsLoading/error above
                    >
                        <option value="">Select Department...</option>
                        {departmentOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <Link href="/admin/users" passHref>
                        <Button type="button" variant="outline" disabled={isLoading}>
                            Cancel
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </MainLayout>
    );
};

export default withPageAuth(EditUserPage, { requiredRoles: [Role.ADMIN] });