import React from 'react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'neutral' | 'increase' | 'decrease';
  icon: React.ElementType;
  color: string; // e.g. 'blue', 'purple', 'yellow'
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, changeType, icon: Icon, color }) => {
  const changeColorClass = {
    increase: 'text-green-600',
    decrease: 'text-red-600',
    neutral: 'text-gray-500',
  }[changeType];

  const colorVariants: { [key: string]: { icon: string, bg: string } } = {
    blue: { icon: 'text-blue-600', bg: 'bg-blue-100' },
    purple: { icon: 'text-purple-600', bg: 'bg-purple-100' },
    yellow: { icon: 'text-yellow-600', bg: 'bg-yellow-100' },
  };
  
  const selectedColor = colorVariants[color] || colorVariants.blue;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-gray-600 truncate">{title}</p>
          <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-lg ${selectedColor.bg}`}>
            <Icon className={`w-5 h-5 ${selectedColor.icon}`} />
          </div>
        </div>
        <div className="mt-1">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <p className={`text-sm ${changeColorClass} mt-2`}>{change}</p>
    </div>
  );
};

export default StatsCard;