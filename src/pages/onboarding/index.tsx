import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

// Placeholder Imports - Create these components next
import StatCardSimple from '@/components/ui/StatCardSimple';
import OnboardingList from '@/components/onboarding/OnboardingList';
import OnboardingTaskList from '@/components/onboarding/OnboardingTaskList';

// Define interfaces for fetched data
interface OnboardingStatData {
    active: number;
    completedThisMonth: number;
    overdueTasks: number;
}

interface OnboardingListItem {
    id: number;
    name: string; // Employee name
    startDate: string;
    progress: number; // Percentage
}

// Mock data removed

const OnboardingPage = () => {
  const [stats, setStats] = useState<OnboardingStatData>({ active: 0, completedThisMonth: 0, overdueTasks: 0 });
  const [onboardings, setOnboardings] = useState<OnboardingListItem[]>([]);
  const [selectedOnboardingId, setSelectedOnboardingId] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null); // Combined error state

  // Fetch stats and list on mount
  useEffect(() => {
    const fetchData = async () => {
        setLoadingStats(true);
        setLoadingList(true);
        setError(null);
        try {
            // Fetch concurrently
            const statsPromise = axios.get<OnboardingStatData>('/api/onboarding/stats');
            const listPromise = axios.get<OnboardingListItem[]>('/api/onboarding?status=active'); // Fetch active onboardings

            const [statsResponse, listResponse] = await Promise.all([statsPromise, listPromise]);

            setStats(statsResponse.data);
            setOnboardings(listResponse.data);

            // Optionally select the first item if list is not empty
            if (listResponse.data.length > 0 && !selectedOnboardingId) {
                 setSelectedOnboardingId(listResponse.data[0].id);
            }

        } catch (err: any) {
            console.error("Error fetching onboarding data:", err);
            setError(err.response?.data?.message || "Failed to load onboarding data.");
        } finally {
            setLoadingStats(false);
            setLoadingList(false);
        }
    };
    fetchData();
  }, []); // Run once on mount

  // Find the selected onboarding details from the fetched list
  const selectedOnboarding = onboardings.find(o => o.id === selectedOnboardingId);

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
              <p className="simple-stat-value">{loadingStats ? '...' : stats.active}</p>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">COMPLETED THIS MONTH</h4>
              <p className="simple-stat-value" style={{ color: 'var(--success)' }}>{loadingStats ? '...' : stats.completedThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="col-span-4">
          <div className="card simple-stat-card">
            <div className="card-body">
              <h4 className="simple-stat-title">OVERDUE TASKS</h4>
              <p className="simple-stat-value" style={{ color: 'var(--danger)' }}>{loadingStats ? '...' : stats.overdueTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-grid">
        {/* Left Column: Active Onboardings List */}
        <div className="col-span-4">
          {/* TODO: Handle loading/error state for the list */}
          {loadingList ? <p>Loading list...</p> : error ? <p className="text-red-500">{error}</p> :
            <OnboardingList
                onboardings={onboardings}
                selectedId={selectedOnboardingId}
                onSelect={setSelectedOnboardingId}
            />
          }
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

  // Data fetching moved to client-side useEffect

  return {
    props: { userRole: session.user?.role ?? null }, // Pass role if needed by child components
  };
};

export default OnboardingPage;