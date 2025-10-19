import React, { useState } from 'react';
import { BellIcon } from './icons';
import { usePriceWatch } from '../hooks/usePriceWatch';

interface PriceDropNotificationToggleProps {
  vehicleId: number;
}

const PriceDropNotificationToggle: React.FC<PriceDropNotificationToggleProps> = ({ vehicleId }) => {
    const { isWatched, toggleWatch, isLoading } = usePriceWatch();
    const isEnabled = isWatched(vehicleId);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const willBeEnabled = !isEnabled;
        toggleWatch(vehicleId);

        if (willBeEnabled) {
            setToastMessage('Recibirás un correo (y futuramente una notificación push) si este auto baja de precio.');
        } else {
            setToastMessage('Ya no recibirás notificaciones por este auto.');
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-between py-2">
                <div className="h-5 bg-gray-200 rounded w-48"></div>
                <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
        );
    }

    return (
        <>
            {showToast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-full z-50 shadow-lg animate-fade-in-out">
                    {toastMessage}
                </div>
            )}
            <div className="flex items-center justify-between py-2">
                <label htmlFor={`price-watch-${vehicleId}`} className="text-sm font-medium text-gray-700 flex items-center gap-2 cursor-pointer">
                    <BellIcon className={`w-4 h-4 transition-colors ${isEnabled ? 'text-primary-600' : 'text-gray-400'}`} />
                    Notificarme si baja de precio
                </label>
                <button
                    id={`price-watch-${vehicleId}`}
                    onClick={handleToggle}
                    role="switch"
                    aria-checked={isEnabled}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                    isEnabled ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                >
                    <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                    />
                </button>
            </div>
        </>
    );
};

export default PriceDropNotificationToggle;