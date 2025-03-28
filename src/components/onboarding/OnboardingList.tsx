import React from 'react';

// Define the shape of an onboarding process object (based on mock data)
interface OnboardingProcess {
  id: number;
  name: string;
  startDate: string;
  progress: number;
}

interface OnboardingListProps {
  onboardings: OnboardingProcess[];
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const OnboardingList: React.FC<OnboardingListProps> = ({
  onboardings,
  selectedId,
  onSelect,
}) => {
  return (
    // Using card styling similar to the old structure seen in index.tsx for consistency
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Active Onboardings</h3>
      </div>
      <div className="card-body" style={{ padding: '1rem' }}> {/* Add some padding */}
        {onboardings.length === 0 ? (
          <p className="text-gray-500 text-sm">No active onboarding processes.</p>
        ) : (
          <ul className="space-y-3">
            {onboardings.map((onboarding) => (
              <li key={onboarding.id}>
                <button
                  onClick={() => onSelect(onboarding.id)}
                  // Basic styling, can be refined with Tailwind later if needed
                  className={`w-full text-left p-3 rounded-md border ${
                    selectedId === onboarding.id
                      ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-300' // Example selection style
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  } transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50`}
                  style={{ display: 'block' }} // Ensure button takes full width
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{onboarding.name}</span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>Start: {onboarding.startDate}</span>
                  </div>
                  {/* Progress Bar */}
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '0.375rem' }}>
                    <div
                      style={{ backgroundColor: '#2563eb', height: '0.375rem', borderRadius: '9999px', width: `${onboarding.progress}%` }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem', display: 'block', textAlign: 'right' }}>{onboarding.progress}% Complete</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OnboardingList;