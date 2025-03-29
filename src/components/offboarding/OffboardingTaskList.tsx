import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios'; // Import axios

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

// Mock Task Data removed
const OffboardingTaskList: React.FC<OffboardingTaskListProps> = ({ offboarding }) => {
  // State for tasks, loading, and errors
  const [tasks, setTasks] = useState<OffboardingTask[]>([]);
  const [loadingTasks, setLoadingTasks] = useState<boolean>(true);
  const [errorTasks, setErrorTasks] = useState<string | null>(null);

  // Fetch tasks when onboarding ID changes
  useEffect(() => {
    if (!offboarding?.id) return; // Don't fetch if no offboarding process is selected

    const fetchTasks = async () => {
        setLoadingTasks(true);
        setErrorTasks(null);
        try {
            // Assuming tasks are fetched based on employeeId
            // Adjust endpoint and parameter name if needed (e.g., offboardingId)
            const response = await axios.get<OffboardingTask[]>(`/api/tasks`, {
                params: { employeeId: offboarding.id, processType: 'offboarding' } // Assuming API can filter by type
            });
            setTasks(response.data);
        } catch (err: any) {
            console.error(`Error fetching tasks for offboarding ${offboarding.id}:`, err);
            setErrorTasks(err.response?.data?.message || "Failed to load tasks.");
        } finally {
            setLoadingTasks(false);
        }
    };

    fetchTasks();
  }, [offboarding?.id]); // Dependency on offboarding ID

  const handleTaskToggle = (taskId: string) => {
    // Find the original task before optimistic update
    const originalTask = tasks.find(task => task.id === taskId);
    if (!originalTask) return;
    const newCompletedStatus = !originalTask.completed;

    // Optimistic UI update
    setTasks(currentTasks =>
      currentTasks.map(task =>
        task.id === taskId ? { ...task, completed: newCompletedStatus } : task
      )
    );

    // API Call to Update Task Status
    axios.put(`/api/tasks/${taskId}`, { completed: newCompletedStatus })
       .then(response => {
           console.log(`Task ${taskId} status updated successfully to ${newCompletedStatus}`);
           // Optional: Update state with response data if needed
           // setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? response.data : t));
       })
       .catch(err => {
           console.error(`Error updating task ${taskId}:`, err);
           // Revert optimistic update on error
           setTasks(prevTasks =>
               prevTasks.map(task =>
                   task.id === taskId ? originalTask : task
               )
           );
           alert(`Failed to update task status: ${err.response?.data?.message || err.message}`);
       });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">{offboarding.name}</h2>
        <p className="text-sm text-gray-500">Exit Date: {offboarding.exitDate} | Reason: {offboarding.reason}</p>
      </div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">Offboarding Checklist</h3>

      {loadingTasks ? (
          <p className="text-gray-500 text-sm">Loading tasks...</p>
      ) : errorTasks ? (
          <p className="text-red-500 text-sm">Error: {errorTasks}</p>
      ) : tasks.length === 0 ? (
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