import React, { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layouts/MainLayout';
import Table from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { Department } from '@/db'; // Import from central db index
import { withPageAuth } from '@/lib/hoc/withPageAuth'; // Use the page HOC
import { Role } from '@/types/roles'; // Correct enum name

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch departments');
    }
    return res.json();
});

const DepartmentsAdminPage = () => {
    const router = useRouter();
    // Assuming API returns data compatible with Department model structure
    const { data: departments, error, isLoading, mutate } = useSWR<InstanceType<typeof Department>[]>('/api/departments', fetcher); // Use InstanceType
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this department? This might fail if employees are assigned to it.')) {
            setIsDeleting(id);
            setDeleteError(null);
            try {
                const res = await fetch(`/api/departments/${id}`, { method: 'DELETE' });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || 'Failed to delete department');
                }
                // Revalidate the data after successful deletion
                mutate();
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
        { key: 'name', header: 'Name' },
        // Add more columns if needed, e.g., number of employees
    ];

    return (
        <MainLayout>
            <h1 className="text-2xl font-semibold mb-4">Manage Departments</h1>

            {deleteError && <Alert type="danger" className="mb-4">{`Deletion failed: ${deleteError}`}</Alert>}

            <div className="mb-4 flex justify-end">
                <Link href="/admin/departments/new" passHref>
                    <Button>Create New Department</Button>
                </Link>
            </div>

            <Table<InstanceType<typeof Department>> // Use InstanceType
                columns={columns}
                data={departments || []}
                isLoading={isLoading}
                error={error?.message}
                renderActions={(department) => (
                    <div className="space-x-2">
                        <Button
                            size="sm"
                            variant="outline" // Use valid variant
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent row click if any
                                router.push(`/admin/departments/${department.id}/edit`);
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            size="sm"
                            variant="outline" // Use valid variant (consider adding 'danger' later)
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(department.id);
                            }}
                            disabled={isDeleting === department.id}
                        >
                            {isDeleting === department.id ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                )}
            />
        </MainLayout>
    );
};

// Secure this page, only allow Admins
export default withPageAuth(DepartmentsAdminPage, { requiredRoles: [Role.ADMIN] }); // Use correct HOC and options