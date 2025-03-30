import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/MainLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { withPageAuth } from '@/lib/hoc/withPageAuth';
import { Role } from '@/types/roles';
// import User from '@/modules/auth/models/User'; // Don't import the Sequelize model directly for frontend typing
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
    role: string;
    departmentId?: number;
    // Add other relevant fields if needed
}

const UsersAdminPage = () => {
    const router = useRouter();
    // Use the UserType interface for SWR data
    const { data: users, error: usersError, isLoading: usersLoading, mutate: mutateUsers } = useSWR<UserType[]>('/api/users', fetcher);
    // Assuming API returns data compatible with Department model structure
    const { data: departments, error: deptsError, isLoading: deptsLoading } = useSWR<InstanceType<typeof Department>[]>('/api/departments', fetcher); // Use InstanceType

    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    // Create a map for quick lookup of department names
    const departmentMap = useMemo(() => {
        if (!departments) return new Map<number, string>();
        return new Map(departments.map(dept => [dept.id, dept.name]));
    }, [departments]);

    const handleDelete = async (id: number) => {
        // Add confirmation, maybe check if deleting self?
        if (window.confirm('Are you sure you want to delete this user?')) {
            setIsDeleting(id);
            setDeleteError(null);
            try {
                const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to delete user');
                }
                mutateUsers(); // Revalidate user list
            } catch (err: any) {
                console.error('Delete failed:', err);
                setDeleteError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'username', header: 'Username' },
        { key: 'role', header: 'Role' },
        {
            key: 'department', // Custom key for display
            header: 'Department',
            // Use UserType here
            render: (user: UserType) => user.departmentId ? (departmentMap.get(user.departmentId) || `ID: ${user.departmentId}`) : 'N/A', // Handle undefined ID
        },
    ];

    const isLoading = usersLoading || deptsLoading;
    const error = usersError || deptsError;

    return (
        <MainLayout>
            <h1 className="text-2xl font-semibold mb-4">Manage Users</h1>

            {deleteError && <Alert type="danger" className="mb-4">{`Deletion failed: ${deleteError}`}</Alert>}

            <div className="mb-4 flex justify-end">
                <Link href="/admin/users/new" passHref>
                    <Button>Create New User</Button>
                </Link>
            </div>

            {/* Use UserType for the Table */}
            <Table<UserType>
                columns={columns}
                data={users || []}
                isLoading={isLoading}
                error={error?.message}
                renderActions={(user: UserType) => ( // Explicitly type user here
                    <div className="space-x-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/admin/users/${user.id}/edit`);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline" // Consider danger variant
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(user.id);
                            }}
                            disabled={isDeleting === user.id}
                        >
                            {isDeleting === user.id ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                )}
            />
        </MainLayout>
    );
};

export default withPageAuth(UsersAdminPage, { requiredRoles: [Role.ADMIN] });