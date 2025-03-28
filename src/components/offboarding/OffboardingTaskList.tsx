import React, { useState } from 'react';

// Define the shape of an offboarding process object (matching the one in OffboardingList)
interface OffboardingProcess {
  id: number;
  name: string;
  exitDate: string;
  reason: string;
  progress: number; // May not be directly used here, but good for consistency
}

// Define the shape of an offboarding task
interface OffboardingTask {
  id: string; // Use string for potentially more complex IDs later
  description: string;
  completed: boolean;
  dueDate?: string; // Optional due date
  assignedTo?: string; // Optional assignee
}

interface OffboardingTaskListProps {
  offboarding: OffboardingProcess;
}

// Mock Task Data (Replace with actual data fetching based on offboarding.id)
const mockTasks: OffboardingTask[] = [
  { id: 't1', description: 'Submit Resignation Letter Acknowledgment', completed: true, dueDate: '4/15/2025' },
  { id: 't2', description: 'Conduct Exit Interview', completed: true, dueDate: '4/20/2025', assignedTo: 'HR Manager' },
  { id: 't3', description: 'Retrieve Company Assets (Laptop, Phone, Badge)', completed: false, dueDate: '4/29/2025' },
  { id: 't4', description: 'Disable System Access (Email, VPN, Software)', completed: false, dueDate: '4/29/2025', assignedTo: 'IT Department' },
  { id: 't5', description: 'Process Final Paycheck', completed: false, dueDate: '5/10/2025', assignedTo: 'Payroll' },
  { id: 't6', description: 'Update Employee Records', completed: false },
];


const OffboardingTaskList: React.FC<OffboardingTaskListProps> = ({ offboarding }) => {
  // State to manage task completion (in a real app, this would trigger API calls)
  const [tasks, setTasks] = useState<OffboardingTask[]>(mockTasks);

  const handleTaskToggle = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    // TODO: Add API call here to update task status in the backend
    console.log(`Toggled task ${taskId} for ${offboarding.name}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{offboarding.name}</h2>
        <p className="text-sm text-gray-500">Exit Date: {offboarding.exitDate} | Reason: {offboarding.reason}</p>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">Offboarding Checklist</h3>

      {tasks.length === 0 ? (
         <p className="text-gray-500 text-sm">No tasks defined for this offboarding process.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-start p-3 bg-gray-50 rounded-md border border-gray-100">
              <input
                type="checkbox"
                id={`task-${task.id}`}
                checked={task.completed}
                onChange={() => handleTaskToggle(task.id)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 mr-3 flex-shrink-0"
              />
              <div className="flex-grow">
                <label
                  htmlFor={`task-${task.id}`}
                  className={`block text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}
                >
                  {task.description}
                </label>
                {(task.dueDate || task.assignedTo) && (
                   <div className="text-xs text-gray-500 mt-1">
                     {task.dueDate && <span>Due: {task.dueDate}</span>}
                     {task.dueDate && task.assignedTo && <span className="mx-1">|</span>}
                     {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
                   </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
       {/* Add Task Button - Placeholder */}
       <div className="mt-6 text-right">
         <button className="btn btn-secondary text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded-md">
           + Add Task
         </button>
       </div>
    </div>
  );
};

export default OffboardingTaskList;