import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

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

// 添加 LoadingButton 组件
interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  children, 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}) => {
  return (
    <button
      className={`px-4 py-1 text-white bg-black rounded-sm hover:bg-gray-800 focus:outline-none transition-colors duration-200 cursor-pointer ${isLoading ? 'opacity-80' : ''} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      <div className="flex items-center justify-center min-w-[80px] min-h-[24px]">
        {isLoading ? (
          <AiOutlineLoading3Quarters className="animate-spin" />
        ) : (
          children
        )}
      </div>
    </button>
  );
}; 