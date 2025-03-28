import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link'; // Although not used in the static image, might be needed for category links

// Mock data for the table preview
const mockReportData = [
  { department: 'Administration', employees: 68, present: 62, absent: 2, leave: 4, attendanceRate: '91.2%' },
  { department: 'Human Resources', employees: 42, present: 38, absent: 1, leave: 3, attendanceRate: '90.5%' },
  { department: 'Operations', employees: 24, present: 21, absent: 0, leave: 3, attendanceRate: '87.5%' },
  { department: 'Compounding', employees: 35, present: 32, absent: 1, leave: 2, attendanceRate: '91.4%' },
];

// Calculate totals
const totals = mockReportData.reduce(
  (acc, row) => {
    acc.employees += row.employees;
    acc.present += row.present;
    acc.absent += row.absent;
    acc.leave += row.leave;
    return acc;
  },
  { employees: 0, present: 0, absent: 0, leave: 0 }
);
// Basic average calculation for total attendance rate (can be refined)
const totalAttendanceRate = ((totals.present / totals.employees) * 100).toFixed(1) + '%';


const ReportsPage = () => {
  // State for selected report category, filters, etc. - Add later
  const [selectedReport, setSelectedReport] = useState<string>('Attendance Summary'); // Example state
  const [departmentFilter, setDepartmentFilter] = useState<string>('All Departments');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('Last 30 Days');
  const [formatFilter, setFormatFilter] = useState<string>('Table');

  const reportCategories = {
    'ATTENDANCE & LEAVE': ['Attendance Summary', 'Leave Balance', 'Absence Rate'],
    'EMPLOYEE': ['Employee Directory', 'Headcount by Department', 'Turnover Rate'],
    'COMPLIANCE': ['Certification Status', 'Upcoming Expirations', 'HIPAA Compliance'],
  };

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
                <option>All Departments</option>
                <option>Nursing</option>
                <option>Administration</option>
                <option>Radiology</option>
                <option>Pediatrics</option>
                {/* Add more departments */}
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
                  {mockReportData.map((row) => (
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
                   <tr className="bg-gray-50 font-semibold">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">Total</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{totals.employees}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{totals.present}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{totals.absent}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{totals.leave}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{totalAttendanceRate}</td>
                    </tr>
                </tbody>
              </table>
            ) : (
              // Placeholder for Chart or other reports
              <div className="text-center py-10 text-gray-500">
                <h3 className="text-lg font-medium mb-2">Report Chart Preview</h3>
                <p>Data visualization will appear here</p>
                {/* Add logic to show different previews based on selectedReport */}
              </div>
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

  // TODO: Fetch initial data if needed (e.g., list of departments for filter)

  return {
    props: { session }, // Pass session or other props
  };
};

export default ReportsPage;