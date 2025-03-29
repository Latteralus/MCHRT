import React, { useState, useEffect } from 'react'; // Import useEffect
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios'; // Import axios

// Placeholder Imports - Create these components next
import StatCardSimple from '@/components/ui/StatCardSimple';
import OffboardingList from '@/components/offboarding/OffboardingList';
import OffboardingTaskList from '@/components/offboarding/OffboardingTaskList';

// Define interfaces for fetched data (similar to onboarding)
interface OffboardingStatData {
    active: number;
    completedThisMonth: number;
    overdueTasks: number;
}

interface OffboardingListItem {
    id: number;
    name: string; // Employee name
    exitDate: string; // Changed from startDate
    progress: number; // Percentage
    reason: string; // Make reason required to match child components
}

// Mock data removed

const OffboardingPage = () => {
  // State variables for data, loading, and errors
  const [stats, setStats] = useState<OffboardingStatData>({ active: 0, completedThisMonth: 0, overdueTasks: 0 });
  const [offboardings, setOffboardings] = useState<OffboardingListItem[]>([]);
  const [selectedOffboardingId, setSelectedOffboardingId] = useState<number | null>(null);
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
            // Fetch concurrently - Assuming API endpoints exist
            const statsPromise = axios.get<OffboardingStatData>('/api/offboarding/stats');
            const listPromise = axios.get<OffboardingListItem[]>('/api/offboarding?status=active'); // Fetch active offboardings

            const [statsResponse, listResponse] = await Promise.all([statsPromise, listPromise]);

            setStats(statsResponse.data);
            setOffboardings(listResponse.data);

            // Optionally select the first item if list is not empty
            if (listResponse.data.length > 0 && !selectedOffboardingId) {
                 setSelectedOffboardingId(listResponse.data[0].id);
            }

        } catch (err: any) {
            console.error("Error fetching offboarding data:", err);
            setError(err.response?.data?.message || "Failed to load offboarding data.");
        } finally {
            setLoadingStats(false);
            setLoadingList(false);
        }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Find the selected offboarding details from the fetched list
  const selectedOffboarding = offboardings.find(o => o.id === selectedOffboardingId);

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
        {/* Left Column: Active Offboardings List */}
        <div className="col-span-4">
          {/* TODO: Handle loading/error state for the list */}
          {loadingList ? <p>Loading list...</p> : error ? <p className="text-red-500">{error}</p> :
            <OffboardingList
                offboardings={offboardings} // Use fetched data
                selectedId={selectedOffboardingId}
                onSelect={setSelectedOffboardingId}
            />
          }
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

  // Data fetching moved to client-side useEffect

  return {
    props: { userRole: session.user?.role ?? null }, // Pass role if needed by child components
  };
};

export default OffboardingPage;