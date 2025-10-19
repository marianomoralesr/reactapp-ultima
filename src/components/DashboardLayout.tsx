


import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import {
    Menu,
    X,
} from 'lucide-react';
import BottomNav from './BottomNav';
import SidebarContent from './SidebarContent';



const DashboardLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile
    const [isCollapsed, setIsCollapsed] = useState(false); // For desktop
    const [isSurveyVisible, setIsSurveyVisible] = useState(true); // New state
    const [isBetaSurveyVisible, setIsBetaSurveyVisible] = useState(true); // New state
    const location = useLocation();
    const noPadding = location.pathname.endsWith('/encuesta');
    const mainContentRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo(0, 0);
        }
    }, [location.pathname]);

    return (
        <div className="flex h-screen bg-gray-100 overflow-x-hidden">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex lg:flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-24' : 'w-64'}`}>
                <SidebarContent
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                    isSurveyVisible={isSurveyVisible}
                    setIsSurveyVisible={setIsSurveyVisible}
                    isBetaSurveyVisible={isBetaSurveyVisible}
                    setIsBetaSurveyVisible={setIsBetaSurveyVisible}
                />
            </aside>
            {/* Mobile Sidebar */}
            <div className={`fixed inset-0 z-40 flex lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
                {/* Overlay */}
                <div 
                    className={`absolute inset-0 bg-black/60 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setSidebarOpen(false)}
                ></div>
                {/* Drawer */}
                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white/80 backdrop-blur-lg transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className={`absolute top-0 right-0 -mr-12 pt-2 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}>
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sr-only">Cerrar menú</span>
                            <X className="h-6 w-6 text-white" aria-hidden="true" />
                        </button>
                    </div>
                    {/* The mobile sidebar should always be full width, so we pass hardcoded props */}
                    <SidebarContent
                        isCollapsed={false}
                        onToggle={() => setSidebarOpen(false)}
                        isSurveyVisible={isSurveyVisible}
                        setIsSurveyVisible={setIsSurveyVisible}
                        isBetaSurveyVisible={isBetaSurveyVisible}
                        setIsBetaSurveyVisible={setIsBetaSurveyVisible}
                    />
                </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <main ref={mainContentRef} className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className={`py-8 px-4 sm:px-6 lg:px-8 ${noPadding ? '' : 'pb-24 lg:pb-8'}`}>
                        <Outlet />
                    </div>
                </main>
            </div>
            <BottomNav />
            {/* <EbookCta /> */}
        </div>
    );
};

export default DashboardLayout;