import React, { useState } from 'react';
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
import Department from '@/modules/organization/models/Department';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return res.json();
});

const NewUserPage = () => {
    const router = useRouter();
    const { data: departments, error: deptsError, isLoading: deptsLoading } = useSWR<Department[]>('/api/departments', fetcher);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<Role>(Role.EMPLOYEE); // Default to Employee
    const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>(''); // Store as string for Select value
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!username.trim() || !password.trim()) {
            setError('Username and password cannot be empty.');
            setIsLoading(false);
            return;
        }

        // Department is optional, especially for Admin role
        const departmentId = selectedDepartmentId ? parseInt(selectedDepartmentId, 10) : undefined;

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password, // Send plain password, API should hash it
                    role: selectedRole,
                    departmentId,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create user');
            }

            // Redirect to the users list on success
            router.push('/admin/users');

        } catch (err: any) {
            console.error('Creation failed:', err);
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    const roleOptions = Object.values(Role).map(role => ({ value: role, label: role }));
    const departmentOptions = departments
        ? departments.map(dept => ({ value: dept.id.toString(), label: dept.name }))
        : [];

    return (
        <MainLayout>
            <h1 className="text-2xl font-semibold mb-4">Create New User</h1>

            {error && <Alert type="danger" className="mb-4">{error}</Alert>}
            {deptsError && <Alert type="warning" className="mb-4">Could not load departments: {deptsError.message}</Alert>}

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

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                        disabled={isLoading || deptsLoading || !!deptsError}
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
                    <Button type="submit" disabled={isLoading || deptsLoading}>
                        {isLoading ? 'Creating...' : 'Create User'}
                    </Button>
                </div>
            </form>
        </MainLayout>
    );
};

export default withPageAuth(NewUserPage, { requiredRoles: [Role.ADMIN] });