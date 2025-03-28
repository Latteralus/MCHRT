// src/components/ui/Textarea.tsx
import React from 'react';

// Define props, extending standard textarea attributes
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    name: string; // Make name mandatory for forms
    error?: string; // Optional error message
    className?: string; // Allow custom styling
}

const Textarea: React.FC<TextareaProps> = ({
    label,
    name,
    id,
    error,
    className = '',
    ...rest // Pass down other props like rows, placeholder, value, onChange, etc.
}) => {
    const textareaId = id || name; // Use name as fallback id

    return (
        <div className={`mb-4 ${className}`}>
            {label && ( // Corrected operator
                <label htmlFor={textareaId} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <textarea
                id={textareaId}
                name={name}
                className={`shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md ${error ? 'border-red-500' : ''}`}
                {...rest} // Spread remaining props
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
};

export default Textarea;