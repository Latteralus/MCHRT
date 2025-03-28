import React from 'react';

// Define the shape of an offboarding process object (based on mock data)
interface OffboardingProcess {
  id: number;
  name: string;
  exitDate: string;
  reason: string;
  progress: number;
}

interface OffboardingListProps {
  offboardings: OffboardingProcess[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const OffboardingList: React.FC<OffboardingListProps> = ({
  offboardings,
  selectedId,
  onSelect,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Active Offboardings</h2>
      {offboardings.length === 0 ? (
        <p className="text-gray-500 text-sm">No active offboarding processes.</p>
      ) : (
        <ul className="space-y-3">
          {offboardings.map((offboarding) => (
            <li key={offboarding.id}>
              <button
                onClick={() => onSelect(offboarding.id)}
                className={`w-full text-left p-3 rounded-md border ${
                  selectedId === offboarding.id
                    ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                } transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-900">{offboarding.name}</span>
                  <span className="text-xs text-gray-500">{offboarding.exitDate}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Reason: {offboarding.reason}</div>
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${offboarding.progress}%` }}
                  ></div>
                </div>
                 <span className="text-xs text-gray-500 mt-1 block text-right">{offboarding.progress}% Complete</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OffboardingList;