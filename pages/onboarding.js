// pages/onboarding.js
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/common/Layout';

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeEmployee, setActiveEmployee] = useState(null);
  
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

  // Mock onboarding employees
  const onboardingEmployees = [
    {
      id: 1,
      name: 'Jennifer Adams',
      position: 'Pharmacist',
      department: 'Operations',
      startDate: '2025-04-15',
      progress: 65
    },
    {
      id: 2,
      name: 'Robert Chen',
      position: 'Accounting Specialist',
      department: 'Finance',
      startDate: '2025-04-08',
      progress: 80
    },
    {
      id: 3,
      name: 'Emily Garcia',
      position: 'Project Manager',
      department: 'Administration',
      startDate: '2025-03-30',
      progress: 95
    }
  ];

  // Mock onboarding tasks
  const onboardingTasks = [
    {
      id: 1,
      name: 'Complete personal information',
      category: 'Documentation',
      status: 'complete',
      dueDate: '2025-04-01',
      assignedTo: 'Employee'
    },
    {
      id: 2,
      name: 'Submit I-9 form',
      category: 'Documentation',
      status: 'complete',
      dueDate: '2025-04-01',
      assignedTo: 'Employee'
    },
    {
      id: 3,
      name: 'Complete W-4',
      category: 'Documentation',
      status: 'complete',
      dueDate: '2025-04-01',
      assignedTo: 'Employee'
    },
    {
      id: 4,
      name: 'Setup computer and accounts',
      category: 'Equipment',
      status: 'in-progress',
      dueDate: '2025-04-05',
      assignedTo: 'IT Department'
    },
    {
      id: 5,
      name: 'Assign ID badge',
      category: 'Equipment',
      status: 'complete',
      dueDate: '2025-04-02',
      assignedTo: 'Security'
    },
    {
      id: 6,
      name: 'Orientation session',
      category: 'Training',
      status: 'pending',
      dueDate: '2025-04-10',
      assignedTo: 'HR Department'
    },
    {
      id: 7,
      name: 'Department-specific training',
      category: 'Training',
      status: 'pending',
      dueDate: '2025-04-12',
      assignedTo: 'Department Manager'
    },
    {
      id: 8,
      name: 'HIPAA compliance training',
      category: 'Compliance',
      status: 'pending',
      dueDate: '2025-04-15',
      assignedTo: 'Compliance Officer'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Employee Onboarding</h1>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Add New Employee
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 uppercase">Active Onboardings</h3>
            <p className="text-2xl font-bold text-blue-600">3</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 uppercase">Completed This Month</h3>
            <p className="text-2xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-sm text-gray-500 uppercase">Overdue Tasks</h3>
            <p className="text-2xl font-bold text-red-600">2</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Left panel - Employee list */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-medium text-gray-800">Active Onboardings</h2>
            </div>
            <ul className="p-2">
              {onboardingEmployees.map(employee => (
                <li key={employee.id}>
                  <button
                    onClick={() => setActiveEmployee(employee)}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      activeEmployee?.id === employee.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-xs text-gray-500">Starts: {new Date(employee.startDate).toLocaleDateString()}</div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${employee.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-right text-gray-500">{employee.progress}% complete</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right panel - Onboarding tasks */}
          <div className="flex-1 bg-white rounded-lg shadow">
            {activeEmployee ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="font-medium text-gray-800">
                    Onboarding Tasks for {activeEmployee.name}
                  </h2>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>{activeEmployee.position} • {activeEmployee.department}</p>
                    <p>Start Date: {new Date(activeEmployee.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${activeEmployee.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-right text-gray-500">{activeEmployee.progress}% complete</div>
                  </div>
                  
                  <div>
                    {['Documentation', 'Equipment', 'Training', 'Compliance'].map(category => (
                      <div key={category} className="mb-6">
                        <h3 className="text-md font-medium text-gray-700 mb-2">{category}</h3>
                        <div className="space-y-2">
                          {onboardingTasks
                            .filter(task => task.category === category)
                            .map(task => {
                              // Task status styles
                              let statusBadgeClass = '';
                              if (task.status === 'complete') {
                                statusBadgeClass = 'bg-green-100 text-green-800';
                              } else if (task.status === 'in-progress') {
                                statusBadgeClass = 'bg-blue-100 text-blue-800';
                              } else {
                                statusBadgeClass = 'bg-gray-100 text-gray-800';
                              }
                              
                              return (
                                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center">
                                    <input
                                      type="checkbox"
                                      checked={task.status === 'complete'}
                                      readOnly
                                      className="h-4 w-4 text-blue-600 rounded"
                                    />
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">{task.name}</div>
                                      <div className="text-xs text-gray-500">Assigned to: {task.assignedTo}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`mr-3 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeClass}`}>
                                      {task.status === 'in-progress' ? 'In Progress' : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                    </span>
                                    <div className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <p>Select an employee to view their onboarding checklist</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-sm text-blue-800">
            This is a placeholder page. In the full implementation, you would be able to create and manage onboarding workflows, assign tasks, and track progress.
          </p>
        </div>
      </div>
    </Layout>
  );
}