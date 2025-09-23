import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  id,
  value,
  onChange,
  placeholder,
  required = false
}) => (
  <div className="mb-5">
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      placeholder={placeholder}
      required={required}
    />
  </div>
);