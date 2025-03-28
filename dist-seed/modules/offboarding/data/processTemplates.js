"use strict";
// src/modules/offboarding/data/processTemplates.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOffboardingTemplateById = exports.getOffboardingTemplates = exports.offboardingProcessTemplates = void 0;
// Example Templates
exports.offboardingProcessTemplates = [
    {
        id: 'standard-exit-v1',
        name: 'Standard Employee Offboarding',
        description: 'Default process for all departing employees.',
        steps: [
            // Before Last Day
            { id: 'pre-01', task: 'Receive and Acknowledge Resignation', responsibleRole: 'Manager', timing: 'Before Last Day' },
            { id: 'pre-02', task: 'Notify HR and IT of Departure Date', responsibleRole: 'Manager', timing: 'Before Last Day' },
            { id: 'pre-03', task: 'Plan Knowledge Transfer / Handover', responsibleRole: 'Manager', timing: 'Before Last Day' },
            { id: 'pre-04', task: 'Calculate Final Pay & Accrued Leave', responsibleRole: 'HR', timing: 'Before Last Day' },
            { id: 'pre-05', task: 'Prepare COBRA & Benefits Information', responsibleRole: 'HR', timing: 'Before Last Day' },
            // On Last Day
            { id: 'lastday-01', task: 'Conduct Exit Interview (Optional)', responsibleRole: 'HR', timing: 'On Last Day' },
            { id: 'lastday-02', task: 'Collect Company Property (Laptop, Badge, Keys, etc.)', responsibleRole: 'Manager', timing: 'On Last Day' },
            { id: 'lastday-03', task: 'Review Final Paycheck Details', responsibleRole: 'HR', timing: 'On Last Day' },
            { id: 'lastday-04', task: 'Disable System Access (Email, HRIS, etc.)', responsibleRole: 'IT', timing: 'On Last Day', notes: 'Coordinate timing with Manager/HR' },
            { id: 'lastday-05', task: 'Remove from Building Access Systems', responsibleRole: 'IT', timing: 'On Last Day' },
            // After Last Day
            { id: 'post-01', task: 'Process Final Paycheck', responsibleRole: 'Finance', timing: 'After Last Day' },
            { id: 'post-02', task: 'Send COBRA Notification', responsibleRole: 'HR', timing: 'After Last Day' },
            { id: 'post-03', task: 'Update Employee Records to Terminated Status', responsibleRole: 'HR', timing: 'After Last Day' },
            { id: 'post-04', task: 'Archive User Data (as per policy)', responsibleRole: 'IT', timing: 'After Last Day' },
        ],
    },
    // Add more templates if needed (e.g., for involuntary termination, manager exit)
];
// Function to get all templates
const getOffboardingTemplates = () => {
    return exports.offboardingProcessTemplates;
};
exports.getOffboardingTemplates = getOffboardingTemplates;
// Function to get a specific template by ID
const getOffboardingTemplateById = (id) => {
    return exports.offboardingProcessTemplates.find(template => template.id === id);
};
exports.getOffboardingTemplateById = getOffboardingTemplateById;
