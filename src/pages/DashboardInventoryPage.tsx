import React from 'react';
import useIsMobile from '../hooks/useIsMobile';
import VehicleListPage from './VehicleListPage';
import ResponsiveInventoryPage from './ResponsiveInventoryPage';

const DashboardInventoryPage: React.FC = () => {
    const isMobile = useIsMobile();
    
    return isMobile ? <ResponsiveInventoryPage /> : <VehicleListPage />;
};

export default DashboardInventoryPage;
