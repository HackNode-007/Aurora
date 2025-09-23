import React from 'react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message, className = '' }) => {
  const alertClasses = {
    error: "bg-red-50 text-red-700 border-red-200",
    success: "bg-green-50 text-green-700 border-green-200"
  };

  return (
    <div className={`rounded-md p-3 text-sm border ${alertClasses[type]} ${className}`}>
      {message}
    </div>
  );
};