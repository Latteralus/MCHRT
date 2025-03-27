// pages/reports.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeReport, setActiveReport] = useState('attendance');
  
  // If loading session, show simple loading indicator
  if (status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading session...</p>
        </div>
      </Layout>
    );
  }

  // If no session and not loading, redirect to login
  if (!session && status !== 'loading') {
    return null; // Will redirect in useEffect
  }

  // Mock report categories and types
  const reportCategories = [
    {
      id: 'attendance',
      name: 'Attendance & Leave',
      reports: [
        { id: 'attendance-summary', name: 'Attendance Summary' },
        { id: 'leave-balance', name: 'Leave Balance' },
        { id: 'absence-rate', name: 'Absence Rate' }
      ]
    },
    {
      id: 'employees',
      name: 'Employee',
      reports: [
        { id: 'employee-directory', name: 'Employee Directory' },
        { id: 'headcount', name: 'Headcount by Department' },
        { id: 'turnover', name: 'Turnover Rate' }
      ]
    },
    {
      id: 'compliance',
      name: 'Compliance',
      reports: [
        { id: 'certification-status', name: 'Certification Status' },
        { id: 'expiry-alerts', name: 'Upcoming Expirations' },
        { id: 'hipaa-compliance', name: 'HIPAA Compliance' }
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mr-2">
              Export Report
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded">
              Schedule Report
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar - Report categories */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-medium text-gray-800">Report Categories</h2>
            </div>
            <div className="p-2">
              {reportCategories.map(category => (
                <div key={category.id} className="mb-4">
                  <h3 className="px-3 py-2 text-sm font-medium text-gray-500 uppercase">{category.name}</h3>
                  <ul>
                    {category.reports.map(report => (
                      <li key={report.id}>
                        <button
                          onClick={() => setActiveReport(report.id)}
                          className={`w-full text-left px-3 py-2 rounded-md ${
                            activeReport === report.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                          }`}
                        >
                          {report.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right content - Report preview */}
          <div className="flex-1 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-medium text-gray-800">
                {reportCategories.flatMap(c => c.reports).find(r => r.id === activeReport)?.name || 'Report Preview'}
              </h2>
            </div>
            <div className="p-6">
              {/* Report filters */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select className="w-full border-gray-300 rounded-md shadow-sm">
                    <option value="">All Departments</option>
                    <option>Administration</option>
                    <option>Operations</option>
                    <option>Finance</option>
                    <option>Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select className="w-full border-gray-300 rounded-md shadow-sm">
                    <option>Last 30 Days</option>
                    <option>Current Month</option>
                    <option>Previous Month</option>
                    <option>Year to Date</option>
                    <option>Custom Range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format
                  </label>
                  <select className="w-full border-gray-300 rounded-md shadow-sm">
                    <option>Table</option>
                    <option>Chart</option>
                    <option>Summary</option>
                  </select>
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-lg text-gray-500">Report Chart Preview</p>
                  <p className="text-sm text-gray-400">Data visualization will appear here</p>
                </div>
              </div>

              {/* Sample report data */}
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Nursing</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">68</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">62</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">91.2%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Administration</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">42</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">38</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">90.5%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Radiology</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">21</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">0</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">3</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">87.5%</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Pediatrics</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">35</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">32</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">91.4%</td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">169</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">153</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">4</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">12</td>
                      <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">90.5%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            This is a placeholder page. In the full implementation, you would be able to generate various reports, export data, and view analytical insights about your workforce.
          </p>
        </div>
      </div>
    </Layout>
  );
}