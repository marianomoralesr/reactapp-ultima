import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import BottomNav from './BottomNav';

const MainLayout: React.FC = () => {
    const location = useLocation();
    const hideFooter = location.pathname.startsWith('/autos');

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden relative">
            {/* Added pt-24 lg:pt-28 to account for the fixed header */}
            <main className="flex-grow pt-24 lg:pt-28 pb-36 lg:pb-0 relative z-10">
                <Outlet />
            </main>
            {!hideFooter && <Footer />}
            <BottomNav />
        </div>
    );
};

export default MainLayout;