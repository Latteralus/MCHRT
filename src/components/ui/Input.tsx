import React from 'react';

// Allow props for both input and textarea, plus our custom ones
type InputElementProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextAreaElementProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

interface CustomInputProps {
  as?: 'input' | 'textarea'; // Add 'as' prop
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
}

// Combine element props with custom props, making element props optional based on 'as'
type InputProps = CustomInputProps & Omit<InputElementProps, keyof CustomInputProps> & Omit<TextAreaElementProps, keyof CustomInputProps>;


const Input: React.FC<InputProps> = ({
  as = 'input', // Default to 'input'
  label,
  id,
  error,
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  rows, // Destructure rows for textarea
  ...props
}) => {
  const inputId = id || props.name; // Use name as fallback for id if not provided
  const commonInputStyles = `block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm ${error ? 'border-red-500' : 'border-gray-300'} ${inputClassName}`;

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      {as === 'textarea' ? (
        <textarea
          id={inputId}
          rows={rows || 3} // Default rows for textarea
          className={commonInputStyles}
          {...(props as TextAreaElementProps)} // Cast props for textarea
        />
      ) : (
        <input
          id={inputId}
          className={commonInputStyles}
          {...(props as InputElementProps)} // Cast props for input
        />
      )}
      {error && (
        <p className={`mt-1 text-xs text-red-600 ${errorClassName}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;