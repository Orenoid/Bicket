import React from 'react';

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className = "" }) => {
  return (
    <div className={`px-4 ${className}`}>
      <div className="h-px bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
};

export default Divider;