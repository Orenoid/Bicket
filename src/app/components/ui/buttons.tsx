import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      className={`px-4 py-1 text-white bg-black rounded-sm hover:bg-gray-800 focus:outline-none transition-colors duration-200 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const SecondaryButton: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      className={`px-3 py-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md focus:outline-none transition-colors duration-200 cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const ButtonGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`flex justify-end ${className}`}>
      {children}
    </div>
  );
}; 