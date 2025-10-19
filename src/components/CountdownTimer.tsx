
import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetTimestamp: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetTimestamp }) => {
  const calculateTimeLeft = () => {
    const difference = targetTimestamp - +new Date();
    let timeLeft = { horas: 0, minutos: 0, segundos: 0 };

    if (difference > 0) {
      const totalHours = Math.floor(difference / (1000 * 60 * 60));
      timeLeft = {
        horas: totalHours,
        minutos: Math.floor((difference / 1000 / 60) % 60),
        segundos: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-4 text-center">
        {Object.entries(timeLeft).map(([unit, value]) => (
            <div key={unit} className="flex items-baseline">
                <div className="flex flex-col items-center p-3 w-20 h-20 justify-center bg-white rounded-lg border border-gray-200 shadow-md">
                    <span className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-wider">
                        {String(value).padStart(2, '0')}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-gray-500">
                        {unit}
                    </span>
                </div>
                 {unit !== 'segundos' && <span className="text-3xl font-bold mx-2 text-primary-500">:</span>}
            </div>
        ))}
    </div>
  );
};

export default CountdownTimer;