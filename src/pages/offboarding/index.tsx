import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

// Placeholder Imports - Create these components next
import StatCardSimple from '@/components/ui/StatCardSimple';
import OffboardingList from '@/components/offboarding/OffboardingList';
import OffboardingTaskList from '@/components/offboarding/OffboardingTaskList';

// Mock Data (Replace with actual data fetching later)
const mockOffboardings = [
  { id: 1, name: 'Michael Rodriguez', exitDate: '4/29/2025', reason: 'Resignation', progress: 45 },
  { id: 2, name: 'Sandra Williams', exitDate: '4/24/2025', reason: 'Retirement', progress: 70 },
  { id: 3, name: 'James Thompson', exitDate: '4/30/2025', reason: 'Resignation', progress: 25 },
];

const mockSelectedOffboarding = mockOffboardings[0]; // Default to the first one

const OffboardingPage = () => {
  // State to manage which offboarding process is selected
  const [selectedOffboardingId, setSelectedOffboardingId] = useState<number | null>(mockSelectedOffboarding?.id ?? null);

  // Find the selected offboarding details (in real app, might fetch this)
  const selectedOffboarding = mockOffboardings.find(o => o.id === selectedOffboardingId);

  return (
    <>
      <Head>
        <title>Employee Offboarding - Mountain Care HR</title>
      </Head>

      {/* Header */}
      <div className="header">
        <div className="page-title">
          <h1>Employee Offboarding</h1>
        </div>
        <div className="header-actions">
          <Link href="/offboarding/new" className="btn btn-primary">
            <i className="fas fa-user-minus"></i>
            Start New Offboarding
          </Link>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">ACTIVE OFFBOARDINGS</h4>
              <p className="simple-stat-value">3</p>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">COMPLETED THIS MONTH</h4>
              <p className="simple-stat-value" style={{ color: 'var(--success)' }}>2</p>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">OVERDUE TASKS</h4>
              <p className="simple-stat-value" style={{ color: 'var(--danger)' }}>4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-grid">
        {/* Left Column: Active Offboardings List */}
        <div className="col-span-4">
          <OffboardingList
            offboardings={mockOffboardings}
            selectedId={selectedOffboardingId}
            onSelect={setSelectedOffboardingId}
          />
        </div>

        {/* Right Column: Offboarding Tasks */}
        <div className="col-span-8">
          {selectedOffboarding ? (
            <OffboardingTaskList offboarding={selectedOffboarding} />
          ) : (
            <div className="card">
              <div className="card-body" style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
                Select an employee from the list to view their offboarding tasks.
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

  // TODO: Fetch initial data if needed (e.g., list of offboardings)

  return {
    props: { session }, // Pass session or other props
  };
};

export default OffboardingPage;