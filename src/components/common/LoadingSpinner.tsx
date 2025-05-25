import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  message?: string;
  fullPage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'indigo',
  message = 'Loading...',
  fullPage = false,
}) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };
  
  const colorMap = {
    indigo: 'border-indigo-500',
    gray: 'border-gray-500',
    red: 'border-red-500',
    green: 'border-green-500',
    blue: 'border-blue-500',
    yellow: 'border-yellow-500',
  };
  
  const spinnerSizeClass = sizeMap[size] || sizeMap.md;
  const spinnerColorClass = colorMap[color as keyof typeof colorMap] || colorMap.indigo;
  
  const spinner = (
    <div className="flex flex-col items-center">
      <div className={`animate-spin rounded-full border-b-2 ${spinnerSizeClass} ${spinnerColorClass}`}></div>
      {message && <p className="mt-3 text-gray-600">{message}</p>}
    </div>
  );
  
  if (fullPage) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        {spinner}
      </div>
    );
  }
  
  return (
    <div className="flex justify-center py-6">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;
