import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  selectClassName?: string;
  errorClassName?: string;
  children: React.ReactNode; // Ensure children are required for options
}

const Select: React.FC<SelectProps> = ({
  label,
  id,
  error,
  containerClassName = '',
  labelClassName = '',
  selectClassName = '',
  errorClassName = '',
  children,
  ...props
}) => {
  const selectId = id || props.name; // Use name as fallback for id if not provided

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-lg shadow-sm ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${selectClassName}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className={`mt-1 text-xs text-red-600 ${errorClassName}`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Select;