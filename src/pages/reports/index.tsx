import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link'; // Although not used in the static image, might be needed for category links

// Define interfaces for fetched data
interface DepartmentOption {
    id: number;
    name: string;
}

interface ReportRow {
    department: string;
    employees: number;
    present: number;
    absent: number;
    leave: number;
    attendanceRate: string; // Assuming API returns formatted string
}

interface ReportData {
    rows: ReportRow[];
    totals: {
        employees: number;
        present: number;
        absent: number;
        leave: number;
        attendanceRate: string; // Assuming API returns formatted string
    };
}

// Mock data removed


interface ReportsPageProps {
    departments: DepartmentOption[]; // Passed from SSR
}

const ReportsPage: React.FC<ReportsPageProps> = ({ departments }) => {
  const [selectedReport, setSelectedReport] = useState<string>('Attendance Summary');
  const [departmentFilter, setDepartmentFilter] = useState<string>(''); // Default to empty string for 'All'
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('Last 30 Days'); // Keep date range simple for now
  const [formatFilter, setFormatFilter] = useState<string>('Table');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);
  const [errorReport, setErrorReport] = useState<string | null>(null);

  const reportCategories = {
    'ATTENDANCE & LEAVE': ['Attendance Summary', 'Leave Balance', 'Absence Rate'],
    'EMPLOYEE': ['Employee Directory', 'Headcount by Department', 'Turnover Rate'],
    'COMPLIANCE': ['Certification Status', 'Upcoming Expirations', 'HIPAA Compliance'],
  };

  // Effect to fetch report data when filters change
  useEffect(() => {
    // Only fetch if the selected report is Attendance Summary for now
    if (selectedReport !== 'Attendance Summary') {
        setReportData(null); // Clear data if report type changes
        return;
    }

    const fetchReport = async () => {
        setLoadingReport(true);
        setErrorReport(null);
        try {
            // TODO: Implement date range parsing based on dateRangeFilter state
            const params = {
                departmentId: departmentFilter || undefined,
                // startDate: ...,
                // endDate: ...,
            };
            const response = await axios.get<ReportData>('/api/reports/attendance-summary', { params });
            setReportData(response.data);
        } catch (err: any) {
            console.error("Error fetching report data:", err);
            setErrorReport(err.response?.data?.message || "Failed to load report data.");
            setReportData(null); // Clear data on error
        } finally {
            setLoadingReport(false);
        }
    };

    fetchReport();
  }, [selectedReport, departmentFilter, dateRangeFilter]); // Add other filters as dependencies

  return (
    <div className="page-container p-8 bg-gray-50 min-h-screen">
      <Head>
        <title>Reports & Analytics - Mountain Care HR</title>
      </Head>

      {/* Header */}
      <div className="header flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h1>
        <div className="header-actions flex items-center gap-4">
          <button className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Export Report
          </button>
          <button className="btn btn-secondary text-blue-600 hover:text-blue-800 px-4 py-2">
            Schedule Report
          </button>
        </div>
      </div>

      {/* Main Content Area - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Report Categories */}
        <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Report Categories</h2>
          {Object.entries(reportCategories).map(([category, reports]) => (
            <div key={category} className="mb-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{category}</h3>
              <ul>
                {reports.map((report) => (
                  <li key={report} className="mb-1">
                    <button
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left px-3 py-1.5 rounded text-sm ${selectedReport === report ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      {report}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right Column: Report Preview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Report Preview</h2>

          {/* Filters */}
          <div className="filters grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                id="department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Departments</option>
                {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <select
                id="dateRange"
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Last 30 Days</option>
                <option>Last 60 Days</option>
                <option>Last 90 Days</option>
                <option>Year to Date</option>
                {/* Add custom range option later */}
              </select>
            </div>
            <div>
              <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <select
                id="format"
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Table</option>
                <option>Chart</option>
                {/* Add more formats */}
              </select>
            </div>
          </div>

          {/* Preview Content */}
          <div className="preview-area border-t border-gray-200 pt-6">
            {formatFilter === 'Table' && selectedReport === 'Attendance Summary' ? (
              // Placeholder Table - Replace with actual dynamic table component later
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employees</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData && reportData.rows.map((row) => (
                    <tr key={row.department}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.employees}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.present}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.absent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.leave}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.attendanceRate}</td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  {reportData && (
                     <tr className="bg-gray-50 font-semibold">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Total</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reportData.totals.employees}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reportData.totals.present}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reportData.totals.absent}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reportData.totals.leave}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{reportData.totals.attendanceRate}</td>
                      </tr>
                  )}
                </tbody>
              </table>
            ) : (
              // Placeholder for Chart or other reports / loading / error states
              loadingReport ? <p className="text-center py-10 text-gray-500">Loading report data...</p> :
              errorReport ? <p className="text-center py-10 text-red-500">Error: {errorReport}</p> :
              !reportData ? <p className="text-center py-10 text-gray-500">Select report options to view data.</p> :
              formatFilter !== 'Table' ? (
                  <div className="text-center py-10 text-gray-500">
                    <h3 className="text-lg font-medium mb-2">Report Chart Preview</h3>
                    <p>Data visualization will appear here</p>
                  </div>
              ) : null // Table is rendered above if format is Table and data exists
            )}
          </div>

        </div>
      </div>
       {/* Footer Placeholder Text */}
       <div className="mt-8 text-center text-sm text-gray-500">
         This is a placeholder page. In the full implementation, you would be able to generate various reports, export data, and view analytical insights about your workforce.
       </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  // Fetch departments for filter dropdown
  let departments: DepartmentOption[] = [];
  try {
      console.log('SSR: Fetching departments for report filter...');
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const url = new URL('/api/departments', baseUrl);
      url.searchParams.append('select', 'id,name'); // Request specific fields
      url.searchParams.append('sortBy', 'name');
      url.searchParams.append('sortOrder', 'asc');

      const response = await axios.get<DepartmentOption[]>(url.toString(), {
           headers: { Cookie: context.req.headers.cookie || '' }
      });
      departments = response.data;
  } catch (error: any) {
       console.error('SSR Error fetching departments for filter:', error.message);
       // Proceed with empty departments list
  }

  return {
    props: {
        departments,
        session // Pass session if needed by layout/components
    },
  };
};

export default ReportsPage;