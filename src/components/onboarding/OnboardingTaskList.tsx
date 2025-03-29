import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios

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

// Mock data removed

const OnboardingTaskList: React.FC<OnboardingTaskListProps> = ({ onboarding }) => {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  // Fetch tasks when onboarding ID changes
  useEffect(() => {
    if (!onboarding?.id) return; // Don't fetch if no onboarding process is selected

    const fetchTasks = async () => {
        setLoadingTasks(true);
        setErrorTasks(null);
        try {
            // Assuming tasks are fetched based on employeeId or a specific onboarding process ID
            // Adjust endpoint as needed
            const response = await axios.get<OnboardingTask[]>(`/api/tasks`, {
                params: { employeeId: onboarding.id } // Or onboardingId=onboarding.id
            });
            setTasks(response.data);
        } catch (err: any) {
            console.error(`Error fetching tasks for onboarding ${onboarding.id}:`, err);
            setErrorTasks(err.response?.data?.message || "Failed to load tasks.");
        } finally {
            setLoadingTasks(false);
        }
    };

    fetchTasks();
  }, [onboarding?.id]); // Dependency on onboarding ID

  const handleTaskToggle = (taskId: string) => {
    // Find the task and its intended new status *before* the optimistic update
    const originalTask = tasks.find(task => task.id === taskId);
    if (!originalTask) {
        console.error("Task not found for toggling:", taskId);
        return; // Task not found in current state, abort
    }
    const newCompletedStatus = !originalTask.completed;

    // Optimistic UI update
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, completed: newCompletedStatus } : task
      )
    );

    // --- API Call to Update Task Status ---
    // Use newCompletedStatus determined before the state update

    // Optimistic update done above, now call API
    axios.put(`/api/tasks/${taskId}`, { completed: newCompletedStatus })
       .then(response => {
           // Optional: Update local state with potentially more complete data from response
           console.log(`Task ${taskId} status updated successfully to ${newCompletedStatus}`);
       })
       .catch(err => {
           console.error(`Error updating task ${taskId}:`, err);
           // Revert optimistic update on error
           // Revert optimistic update on error using the original task state
           setTasks(prevTasks =>
               prevTasks.map(task =>
                   task.id === taskId ? originalTask : task
               )
           );
           // Show error message to user
           alert(`Failed to update task status: ${err.response?.data?.message || err.message}`);
       });
    // --- End API Call ---
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

        {loadingTasks ? (
            <p className="text-gray-500 text-sm">Loading tasks...</p>
        ) : errorTasks ? (
            <p className="text-red-500 text-sm">Error: {errorTasks}</p>
        ) : tasks.length === 0 ? (
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