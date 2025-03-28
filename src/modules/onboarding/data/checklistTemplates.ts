// src/modules/onboarding/data/checklistTemplates.ts

export interface ChecklistItem {
    id: string; // Unique ID for the item within the template
    task: string; // Description of the task
    responsibleRole: 'Employee' | 'Manager' | 'HR' | 'IT'; // Who is typically responsible
    dueDays?: number; // Optional: Days relative to start date when this is due
    notes?: string; // Optional additional notes
}

export interface ChecklistTemplate {
    id: string; // Unique ID for the template (e.g., 'standard-employee', 'compounding-tech')
    name: string; // Display name of the template
    description?: string; // Optional description
    items: ChecklistItem[];
}

// Example Templates
export const onboardingChecklistTemplates: ChecklistTemplate[] = [
    {
        id: 'standard-employee-v1',
        name: 'Standard Employee Onboarding',
        description: 'Default checklist for all new hires.',
        items: [
            // Pre-boarding
            { id: 'pre-01', task: 'Send Welcome Email & First Day Info', responsibleRole: 'HR', dueDays: -7 },
            { id: 'pre-02', task: 'Prepare Workstation (Hardware/Software)', responsibleRole: 'IT', dueDays: -2 },
            { id: 'pre-03', task: 'Set up necessary system accounts (Email, HRIS, etc.)', responsibleRole: 'IT', dueDays: -2 },
            // Day 1
            { id: 'day1-01', task: 'Welcome & Team Introductions', responsibleRole: 'Manager' },
            { id: 'day1-02', task: 'Complete I-9 Verification', responsibleRole: 'HR' },
            { id: 'day1-03', task: 'Review Employee Handbook & Policies', responsibleRole: 'HR' },
            { id: 'day1-04', task: 'Provide Overview of Role & Responsibilities', responsibleRole: 'Manager' },
            { id: 'day1-05', task: 'Workstation Setup & Login Assistance', responsibleRole: 'IT' },
            // Week 1
            { id: 'week1-01', task: 'Complete New Hire Paperwork (W4, Direct Deposit, etc.)', responsibleRole: 'Employee', dueDays: 3 },
            { id: 'week1-02', task: 'Enroll in Benefits (if applicable)', responsibleRole: 'Employee', dueDays: 5 },
            { id: 'week1-03', task: 'Initial Project/Task Assignment', responsibleRole: 'Manager', dueDays: 5 },
            { id: 'week1-04', task: 'Schedule 1:1 Check-in Meeting', responsibleRole: 'Manager', dueDays: 5 },
            // Month 1
            { id: 'month1-01', task: '30-Day Performance Check-in', responsibleRole: 'Manager', dueDays: 30 },
            { id: 'month1-02', task: 'Complete Required Compliance Training', responsibleRole: 'Employee', dueDays: 30 },
        ],
    },
    {
        id: 'compounding-tech-v1',
        name: 'Compounding Technician Onboarding',
        description: 'Specific checklist for new Compounding Technicians.',
        items: [
            // Inherit standard items or list all explicitly
            // Pre-boarding
            { id: 'pre-01', task: 'Send Welcome Email & First Day Info', responsibleRole: 'HR', dueDays: -7 },
            { id: 'pre-02', task: 'Prepare Workstation (Hardware/Software)', responsibleRole: 'IT', dueDays: -2 },
            { id: 'pre-03', task: 'Set up necessary system accounts (Email, HRIS, etc.)', responsibleRole: 'IT', dueDays: -2 },
            // Day 1
            { id: 'day1-01', task: 'Welcome & Team Introductions', responsibleRole: 'Manager' },
            { id: 'day1-02', task: 'Complete I-9 Verification', responsibleRole: 'HR' },
            { id: 'day1-03', task: 'Review Employee Handbook & Policies', responsibleRole: 'HR' },
            { id: 'day1-04', task: 'Provide Overview of Role & Responsibilities', responsibleRole: 'Manager' },
            { id: 'day1-05', task: 'Workstation Setup & Login Assistance', responsibleRole: 'IT' },
            { id: 'day1-06', task: 'Review Lab Safety Procedures & PPE Requirements', responsibleRole: 'Manager' }, // Specific item
            // Week 1
            { id: 'week1-01', task: 'Complete New Hire Paperwork (W4, Direct Deposit, etc.)', responsibleRole: 'Employee', dueDays: 3 },
            { id: 'week1-02', task: 'Enroll in Benefits (if applicable)', responsibleRole: 'Employee', dueDays: 5 },
            { id: 'week1-03', task: 'Initial Compounding Training/Observation', responsibleRole: 'Manager', dueDays: 5 }, // Specific item
            { id: 'week1-04', task: 'Schedule 1:1 Check-in Meeting', responsibleRole: 'Manager', dueDays: 5 },
            // Month 1
            { id: 'month1-01', task: '30-Day Performance Check-in', responsibleRole: 'Manager', dueDays: 30 },
            { id: 'month1-02', task: 'Complete Required Compliance Training (including HIPAA)', responsibleRole: 'Employee', dueDays: 30 },
            { id: 'month1-03', task: 'Complete Initial Compounding Competency Assessment', responsibleRole: 'Manager', dueDays: 30 }, // Specific item
        ],
    },
    // Add more templates as needed (e.g., for Shipping, Admin roles)
];

// Function to get all templates (could be expanded later)
export const getOnboardingTemplates = (): ChecklistTemplate[] => {
    return onboardingChecklistTemplates;
};

// Function to get a specific template by ID
export const getOnboardingTemplateById = (id: string): ChecklistTemplate | undefined => {
    return onboardingChecklistTemplates.find(template => template.id === id);
};