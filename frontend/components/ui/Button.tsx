import React from 'react';

interface ButtonProps {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className = ''
}) => {
  const baseClasses = "w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};