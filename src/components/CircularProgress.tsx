import React from 'react';
import { User } from 'lucide-react';

interface CircularProgressProps {
  progress: number; // 0 to 100
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        className="transform -rotate-90"
      >
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#3b82f6" // Darker blue for progress
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <User className="w-8 h-8 text-gray-600 pb-1" />
        <span className="text-lg font-bold text-gray-800 mt-1 mt-2">{`${Math.round(progress)}%`}</span>
      </div>
      <p className="mt-4 text-center font-semibold text-gray-700">Progreso Total</p>
    </div>
  );
};

export default CircularProgress;