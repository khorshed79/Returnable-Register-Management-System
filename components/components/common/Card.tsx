
import React from 'react';

interface CardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  className?: string;
}

const Card: React.FC<CardProps> = ({ icon, title, value, change, changeType, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
          </div>
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center space-x-1">
          <span className={`text-xs font-semibold ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default Card;
