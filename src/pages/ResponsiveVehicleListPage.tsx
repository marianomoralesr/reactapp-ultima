import React, { useState, useEffect, lazy, Suspense } from 'react';

const VehicleListPage = lazy(() => import('./VehicleListPage'));
const ResponsiveInventoryPage = lazy(() => import('./ResponsiveInventoryPage'));

const ResponsiveVehicleListPage: React.FC = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadingSpinner = (
        <div className="flex justify-center items-center h-screen w-full bg-gray-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
        </div>
    );

    return (
        <Suspense fallback={loadingSpinner}>
            {isMobile ? <ResponsiveInventoryPage /> : <VehicleListPage />}
        </Suspense>
    );
};

export default ResponsiveVehicleListPage;
