import React, { useState } from 'react';

// Define the shape of an onboarding process object (matching OnboardingList)
interface OnboardingProcess {
  id: number;
  name: string;
  startDate: string;
  progress: number;
}

// Define the shape of an onboarding task
interface OnboardingTask {
  id: string;
  description: string;
  completed: boolean;
  dueDate?: string;
  category?: string; // e.g., Paperwork, IT Setup, Team Intro
}

interface OnboardingTaskListProps {
  onboarding: OnboardingProcess;
}

// Mock Task Data (Replace with actual data fetching based on onboarding.id)
const mockTasks: OnboardingTask[] = [
  { id: 'ot1', description: 'Complete I-9 Form', completed: true, category: 'Paperwork', dueDate: '4/14/2025' },
  { id: 'ot2', description: 'Sign Employment Agreement', completed: true, category: 'Paperwork', dueDate: '4/14/2025' },
  { id: 'ot3', description: 'Set up Workstation & Peripherals', completed: true, category: 'IT Setup' },
  { id: 'ot4', description: 'Grant System Access (Email, Software)', completed: false, category: 'IT Setup', dueDate: '4/15/2025' },
  { id: 'ot5', description: 'Attend New Hire Orientation', completed: false, category: 'Training', dueDate: '4/16/2025' },
  { id: 'ot6', description: 'Introduction to Team Members', completed: false, category: 'Team Intro' },
  { id: 'ot7', description: 'Review Department Goals & Objectives', completed: false, category: 'Team Intro' },
];

const OnboardingTaskList: React.FC<OnboardingTaskListProps> = ({ onboarding }) => {
  // State to manage task completion
  const [tasks, setTasks] = useState<OnboardingTask[]>(mockTasks);

  const handleTaskToggle = (taskId: string) => {
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    // TODO: Add API call here to update task status
    console.log(`Toggled task ${taskId} for ${onboarding.name}`);
  };

  return (
    // Using card styling similar to the old structure
    <div className="card">
       <div className="card-header" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', marginBottom: '1rem' }}>
         <h2 className="card-title" style={{ fontSize: '1.25rem' }}>{onboarding.name}</h2>
         <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Start Date: {onboarding.startDate}</p>
       </div>
      <div className="card-body">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Onboarding Checklist</h3>

        {tasks.length === 0 ? (
           <p className="text-gray-500 text-sm">No tasks defined for this onboarding process.</p>
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
                  {(task.dueDate || task.category) && (
                     <div className="text-xs text-gray-500 mt-1">
                       {task.category && <span className="font-medium">{task.category}</span>}
                       {task.category && task.dueDate && <span className="mx-1">|</span>}
                       {task.dueDate && <span>Due: {task.dueDate}</span>}
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
    </div>
  );
};

export default OnboardingTaskList;