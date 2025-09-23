import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  readOnly?: boolean;
  className?: string;
  rightElement?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  readOnly = false,
  className = '',
  rightElement
}) => (
  <div className="mb-5">
    <div className="flex justify-between items-center mb-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {rightElement}
    </div>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        readOnly ? 'bg-gray-100 cursor-not-allowed text-gray-700' : ''
      } ${className}`}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
    />
  </div>
);