import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import useSWR from 'swr';
import MainLayout from '@/components/layouts/MainLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { withPageAuth } from '@/lib/hoc/withPageAuth';
import { Role } from '@/types/roles';
import Department from '@/modules/organization/models/Department'; // Default import

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) {
        throw new Error('Failed to fetch department data');
    }
    return res.json();
});

const EditDepartmentPage = () => {
    const router = useRouter();
    const { id } = router.query; // Get department ID from URL query

    const { data: department, error: fetchError, isLoading: isFetching } = useSWR<Department>(
        id ? `/api/departments/${id}` : null, // Only fetch if ID is available
        fetcher
    );

    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Pre-fill the form when department data loads
    useEffect(() => {
        if (department) {
            setName(department.name);
        }
    }, [department]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        if (!name.trim()) {
            setError('Department name cannot be empty.');
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/departments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update department');
            }

            // Redirect to the departments list on success
            router.push('/admin/departments');

        } catch (err: any) {
            console.error('Update failed:', err);
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return <MainLayout><div className="text-center p-4">Loading department data...</div></MainLayout>;
    }

    if (fetchError) {
        return <MainLayout><Alert type="danger">Error loading department: {fetchError.message}</Alert></MainLayout>;
    }

    if (!department) {
         // Should ideally not happen if ID is present and no error, but good practice
        return <MainLayout><Alert type="warning">Department not found.</Alert></MainLayout>;
    }

    return (
        <MainLayout>
            <h1 className="text-2xl font-semibold mb-4">Edit Department: {department.name}</h1>

            {error && <Alert type="danger" className="mb-4">{error}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Department Name
                    </label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full"
                        disabled={isLoading}
                    />
                </div>

                <div className="flex justify-end space-x-3">
                    <Link href="/admin/departments" passHref>
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

export default withPageAuth(EditDepartmentPage, { requiredRoles: [Role.ADMIN] });