import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { format, subMonths } from 'date-fns';
import StatCard from './StatCard';
import { useAuth } from '../auth/AuthProvider';

const DashboardGrid = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  // Stats state
  const [stats, setStats] = useState({
    totalEmployees: {
      current: null,
      previous: null,
      loading: true
    },
    activeEmployees: {
      current: null, 
      previous: null,
      loading: true
    },
    onboarding: {
      current: null,
      previous: null,
      loading: true
    },
    onLeave: {
      current: null,
      previous: null,
      loading: true
    },
    upcomingCompliance: {
      current: null,
      previous: null,
      loading: true
    },
    attendanceRate: {
      current: null,
      previous: null,
      loading: true
    },
    departments: {
      current: null,
      loading: true
    },
    recentDocuments: {
      current: [],
      loading: true
    }
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        const data = await response.json();
        
        if (data.success) {
          setStats({
            totalEmployees: {
              current: data.totalEmployees.current,
              previous: data.totalEmployees.previous,
              loading: false
            },
            activeEmployees: {
              current: data.activeEmployees.current,
              previous: data.activeEmployees.previous,
              loading: false
            },
            onboarding: {
              current: data.onboarding.current,
              previous: data.onboarding.previous,
              loading: false
            },
            onLeave: {
              current: data.onLeave.current,
              previous: data.onLeave.previous,
              loading: false
            },
            upcomingCompliance: {
              current: data.upcomingCompliance.current,
              previous: data.upcomingCompliance.previous,
              loading: false
            },
            attendanceRate: {
              current: data.attendanceRate.current,
              previous: data.attendanceRate.previous,
              loading: false
            },
            departments: {
              current: data.departments,
              loading: false
            },
            recentDocuments: {
              current: data.recentDocuments,
              loading: false
            }
          });
        } else {
          console.error('Failed to fetch dashboard stats:', data.error);
          // Set loading to false but keep values as null
          setStats(prevStats => {
            const newStats = { ...prevStats };
            Object.keys(newStats).forEach(key => {
              newStats[key].loading = false;
            });
            return newStats;
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set loading to false but keep values as null
        setStats(prevStats => {
          const newStats = { ...prevStats };
          Object.keys(newStats).forEach(key => {
            newStats[key].loading = false;
          });
          return newStats;
        });
      }
    };
    
    fetchDashboardStats();
  }, []);

  // Format attendance rate to percentage
  const formatAttendanceRate = (rate) => {
    return rate !== null ? `${(rate * 100).toFixed(1)}%` : 'N/A';
  };
  
  // Navigate to filtered views on card click
  const navigateToEmployees = (filter) => {
    router.push({
      pathname: '/employees',
      query: filter
    });
  };
  
  const navigateToCompliance = () => {
    router.push('/compliance?expiringWithin=30');
  };
  
  const navigateToAttendance = () => {
    router.push('/attendance');
  };
  
  const navigateToLeave = () => {
    router.push('/leave');
  };
  
  const navigateToDocuments = () => {
    router.push('/documents');
  };
  
  // Department-specific filtering based on user role
  const isDepartmentHead = user?.role === 'department_head';
  const departmentFilter = isDepartmentHead ? { departmentId: user?.departmentId } : {};
  
  // Get current date for display
  const currentDate = format(new Date(), 'MMMM d, yyyy');
  
  return (
    <div className="dashboard-grid">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">{currentDate}</div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Total Employees */}
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees.loading ? null : stats.totalEmployees.current}
          prevValue={stats.totalEmployees.previous}
          icon={<i className="fas fa-users"></i>}
          color="blue"
          loading={stats.totalEmployees.loading}
          onClick={() => navigateToEmployees(departmentFilter)}
        />
        
        {/* Active Employees */}
        <StatCard
          title="Active Employees"
          value={stats.activeEmployees.loading ? null : stats.activeEmployees.current}
          prevValue={stats.activeEmployees.previous}
          icon={<i className="fas fa-user-check"></i>}
          color="green"
          loading={stats.activeEmployees.loading}
          onClick={() => navigateToEmployees({ ...departmentFilter, status: 'active' })}
        />
        
        {/* Onboarding */}
        <StatCard
          title="Employees Onboarding"
          value={stats.onboarding.loading ? null : stats.onboarding.current}
          prevValue={stats.onboarding.previous}
          icon={<i className="fas fa-user-plus"></i>}
          color="purple"
          loading={stats.onboarding.loading}
          onClick={() => navigateToEmployees({ ...departmentFilter, status: 'onboarding' })}
        />
        
        {/* On Leave */}
        <StatCard
          title="Employees on Leave"
          value={stats.onLeave.loading ? null : stats.onLeave.current}
          prevValue={stats.onLeave.previous}
          icon={<i className="fas fa-user-clock"></i>}
          color="yellow"
          loading={stats.onLeave.loading}
          onClick={() => navigateToLeave()}
        />
        
        {/* Upcoming Compliance */}
        <StatCard
          title="Upcoming Compliance Items"
          value={stats.upcomingCompliance.loading ? null : stats.upcomingCompliance.current}
          prevValue={stats.upcomingCompliance.previous}
          icon={<i className="fas fa-exclamation-circle"></i>}
          color="red"
          loading={stats.upcomingCompliance.loading}
          onClick={() => navigateToCompliance()}
          footer="Expiring in next 30 days"
        />
        
        {/* Attendance Rate */}
        <StatCard
          title="Monthly Attendance Rate"
          value={stats.attendanceRate.loading ? null : formatAttendanceRate(stats.attendanceRate.current)}
          prevValue={stats.attendanceRate.previous !== null ? stats.attendanceRate.previous : null}
          icon={<i className="fas fa-calendar-check"></i>}
          color="blue"
          loading={stats.attendanceRate.loading}
          onClick={() => navigateToAttendance()}
          footer="Based on this month's records"
        />
      </div>
      
      {/* Department Stats */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Department Overview</h2>
        
        {stats.departments.loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200"></div>
            ))}
          </div>
        ) : stats.departments.current && stats.departments.current.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stats.departments.current.map((dept) => (
              <StatCard
                key={dept.id}
                title={dept.name}
                value={`${dept.employeeCount} Employees`}
                icon={<i className="fas fa-building"></i>}
                color="gray"
                onClick={() => navigateToEmployees({ departmentId: dept.id })}
                footer={dept.managerName ? `Manager: ${dept.managerName}` : 'No manager assigned'}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            No department data available
          </div>
        )}
      </div>
      
      {/* Recent Documents */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Recent Documents</h2>
        
        {stats.recentDocuments.loading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-lg bg-gray-200"></div>
            ))}
          </div>
        ) : stats.recentDocuments.current && stats.recentDocuments.current.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Modified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {stats.recentDocuments.current.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50" onClick={() => router.push(`/documents/${doc.id}`)}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="mr-2">
                          {getDocumentIcon(doc.fileType)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {doc.ownerName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {doc.fileType}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-gray-500">
            No recent documents available
          </div>
        )}
        
        <div className="mt-4 text-right">
          <button 
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
            onClick={() => navigateToDocuments()}
          >
            View all documents →
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to get document icon based on file type
const getDocumentIcon = (fileType) => {
  switch (fileType?.toLowerCase()) {
    case 'pdf':
      return <i className="fas fa-file-pdf text-red-500"></i>;
    case 'doc':
    case 'docx':
      return <i className="fas fa-file-word text-blue-500"></i>;
    case 'xls':
    case 'xlsx':
      return <i className="fas fa-file-excel text-green-500"></i>;
    case 'ppt':
    case 'pptx':
      return <i className="fas fa-file-powerpoint text-orange-500"></i>;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <i className="fas fa-file-image text-purple-500"></i>;
    default:
      return <i className="fas fa-file text-gray-500"></i>;
  }
};

export default DashboardGrid;