import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '@/components/layouts/MainLayout';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { withPageAuth } from '@/lib/hoc/withPageAuth';
import { Role } from '@/types/roles';

const NewDepartmentPage = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            const res = await fetch('/api/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create department');
            }

            // Redirect to the departments list on success
            router.push('/admin/departments');

        } catch (err: any) {
            console.error('Creation failed:', err);
            setError(err.message || 'An unexpected error occurred.');
            setIsLoading(false);
        }
    };

    return (
        <MainLayout>
            <h1 className="text-2xl font-semibold mb-4">Create New Department</h1>

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
                        {isLoading ? 'Creating...' : 'Create Department'}
                    </Button>
                </div>
            </form>
        </MainLayout>
    );
};

export default withPageAuth(NewDepartmentPage, { requiredRoles: [Role.ADMIN] });