import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';

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

  // Initial dummy data to match the screenshot
  const dummyReportData: ReportData = {
    rows: [
      { department: 'Nursing', employees: 68, present: 62, absent: 2, leave: 4, attendanceRate: '91.2%' },
      { department: 'Administration', employees: 42, present: 38, absent: 1, leave: 3, attendanceRate: '90.5%' },
      { department: 'Radiology', employees: 24, present: 21, absent: 0, leave: 3, attendanceRate: '87.5%' },
      { department: 'Pediatrics', employees: 35, present: 32, absent: 1, leave: 2, attendanceRate: '91.4%' }
    ],
    totals: { employees: 169, present: 153, absent: 4, leave: 12, attendanceRate: '90.5%' }
  };

  useEffect(() => {
    // Set dummy data for demonstration
    setReportData(dummyReportData);
  }, []);

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

    // In a real implementation, you would fetch from API here
    // For demo purposes, we'll keep using the dummy data
    setReportData(dummyReportData);

    /* 
    // This would be the actual implementation
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
    */
  }, [selectedReport, departmentFilter, dateRangeFilter]); // Add other filters as dependencies

  return (
    <div className="page-container bg-slate-50 min-h-screen">
      <Head>
        <title>Reports & Analytics - Mountain Care HR</title>
      </Head>

      {/* Header */}
      <div className="header py-6 px-8 flex justify-between items-center">
        <h1 className="text-3xl font-semibold text-gray-800">Reports & Analytics</h1>
        <div className="header-actions flex items-center gap-4">
          <button className="btn btn-primary bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Export Report
          </button>
          <button className="btn btn-secondary text-gray-600 px-4 py-2">
            Schedule Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel: Report Categories */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-6">Report Categories</h2>
              
              {Object.entries(reportCategories).map(([category, reports]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{category}</h3>
                  <ul className="space-y-1">
                    {reports.map((report) => (
                      <li key={report}>
                        <button
                          onClick={() => setSelectedReport(report)}
                          className={`w-full text-left px-3 py-2 rounded ${
                            selectedReport === report
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {report}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: Report Preview */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-800 mb-6">Report Preview</h2>

              {/* Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <div className="relative">
                    <select
                      id="department"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id.toString()}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="dateRange" className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <div className="relative">
                    <select
                      id="dateRange"
                      value={dateRangeFilter}
                      onChange={(e) => setDateRangeFilter(e.target.value)}
                      className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Last 30 Days</option>
                      <option>Last 60 Days</option>
                      <option>Last 90 Days</option>
                      <option>Year to Date</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                  <div className="relative">
                    <select
                      id="format"
                      value={formatFilter}
                      onChange={(e) => setFormatFilter(e.target.value)}
                      className="block w-full appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-3 pr-8 rounded leading-tight focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option>Table</option>
                      <option>Chart</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Report Content Area */}
              <div className="mt-8">
                {formatFilter === 'Table' && selectedReport === 'Attendance Summary' ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Employees
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Present
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Absent
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Leave
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendance Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData && reportData.rows.map((row) => (
                          <tr key={row.department}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.department}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.employees}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.present}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.absent}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.leave}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{row.attendanceRate}</td>
                          </tr>
                        ))}
                        
                        {/* Total Row */}
                        {reportData && (
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totals.employees}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totals.present}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totals.absent}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totals.leave}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{reportData.totals.attendanceRate}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Chart view placeholder
                  <div className="flex flex-col items-center justify-center py-16 px-4 text-center text-gray-500 border border-gray-200 rounded-md">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Report Chart Preview</h3>
                    <p className="text-sm">Data visualization will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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