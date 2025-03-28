import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

// Placeholder Imports - Create these components next
import StatCardSimple from '@/components/ui/StatCardSimple';
import OnboardingList from '@/components/onboarding/OnboardingList';
import OnboardingTaskList from '@/components/onboarding/OnboardingTaskList';

// Mock Data (Replace with actual data fetching later)
const mockOnboardings = [
  { id: 1, name: 'Jennifer Adams', startDate: '4/14/2025', progress: 65 },
  { id: 2, name: 'Robert Chen', startDate: '4/1/2025', progress: 90 },
  { id: 3, name: 'Emily Garcia', startDate: '3/28/2025', progress: 95 },
];

const mockSelectedOnboarding = mockOnboardings[0]; // Default to the first one

const OnboardingPage = () => {
  // State to manage which onboarding process is selected
  const [selectedOnboardingId, setSelectedOnboardingId] = useState<number | null>(mockSelectedOnboarding?.id ?? null);

  // Find the selected onboarding details (in real app, might fetch this)
  const selectedOnboarding = mockOnboardings.find(o => o.id === selectedOnboardingId);

  return (
    <>
      <Head>
        <title>Employee Onboarding - Mountain Care HR</title>
      </Head>

      {/* Header */}
      <div className="header">
        <div className="page-title">
          <h1>Employee Onboarding</h1>
        </div>
        <div className="header-actions">
          <Link href="/employees/new" className="btn btn-primary">
            <i className="fas fa-plus"></i>
            Add New Employee
          </Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">ACTIVE ONBOARDINGS</h4>
              <p className="simple-stat-value">3</p>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">COMPLETED THIS MONTH</h4>
              <p className="simple-stat-value" style={{ color: 'var(--success)' }}>5</p>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">OVERDUE TASKS</h4>
              <p className="simple-stat-value" style={{ color: 'var(--danger)' }}>2</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-grid">
        {/* Left Column: Active Onboardings List */}
        <div className="col-span-4">
          <OnboardingList
            onboardings={mockOnboardings}
            selectedId={selectedOnboardingId}
            onSelect={setSelectedOnboardingId}
          />
        </div>

        {/* Right Column: Onboarding Tasks */}
        <div className="col-span-8">
          {selectedOnboarding ? (
            <OnboardingTaskList onboarding={selectedOnboarding} />
          ) : (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                Select an employee from the list to view their onboarding tasks.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  // TODO: Fetch initial data if needed (e.g., list of onboardings)

  return {
    props: { session }, // Pass session or other props
  };
};

export default OnboardingPage;