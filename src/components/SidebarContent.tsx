import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApplicationService } from '../services/ApplicationService';
import type { ApplicationListItem } from '../types/types';

interface Application extends ApplicationListItem {
    car_info?: {
        _vehicleTitle?: string;
    };
}

import {
    LayoutDashboard,
    User,
    FileText,
    LogOut,
    Building2,
    Settings,
    Car,
    ChevronLeft,
    ChevronRight,
    Users,
    ListChecks,
    Heart,
    BriefcaseIcon,
    Camera,
    WrenchIcon,
    CalendarIcon,
    FileEdit,
    Loader2
} from 'lucide-react';

// @ts-ignore
import SurveyInvitation from './SurveyInvitation';
// @ts-ignore
import BetaSurveyInvitation from './BetaSurveyInvitation';

interface SidebarContentProps {
    isCollapsed: boolean;
    onToggle: () => void;
    isSurveyVisible: boolean;
    setIsSurveyVisible: React.Dispatch<React.SetStateAction<boolean>>;
    isBetaSurveyVisible: boolean;
    setIsBetaSurveyVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
    isCollapsed,
    onToggle,
}) => {
    const { user, profile, signOut, isAdmin, isSales } = useAuth();
    const [drafts, setDrafts] = useState<Application[]>([]);
    const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);

    useEffect(() => {
        if (user && !isCollapsed) {
            setIsLoadingDrafts(true);
            ApplicationService.getUserApplications(user.id)
                .then(apps => {
                    setDrafts(apps.filter(app => app.status === 'draft'));
                })
                .catch(console.error)
                .finally(() => setIsLoadingDrafts(false));
        }
    }, [user, isCollapsed]);

    const handleSignOut = async () => {
        await signOut();
    };

    const navItems = [
        { to: '/escritorio', label: 'Resumen', icon: LayoutDashboard, end: true },
        { to: '/escritorio/profile', label: 'Mi Perfil', icon: User },
        { to: '/escritorio/favoritos', label: 'Mis Favoritos', icon: Heart },
        { to: '/escritorio/seguimiento', label: 'Mis Solicitudes', icon: FileText },
        { to: '/escritorio/perfilacion-bancaria', label: 'Perfil Bancario', icon: Building2 },
        { to: '/escritorio/citas', label: 'Mantenimientos', icon: WrenchIcon },
        { to: '/escritorio/citas', label: 'Citas', icon: CalendarIcon },
        { to: '/escritorio/autos', label: 'Inventario', icon: Car },
        { to: '/escritorio/vende-tu-auto', label: 'Vender mi Auto', icon: Car },
        // Sales role specific link
        ...((isSales) ? [{ to: '/escritorio/admin/leads', label: 'Mis Leads', icon: Users }] : []),
        // Admin role specific links
        ...((isAdmin) ? [
            { to: '/escritorio/admin/vacantes', label: 'Vacantes', icon: BriefcaseIcon },
            { to: '/escritorio/admin/leads', label: 'Leads Dashboard', icon: Users },
            { to: '/escritorio/marketing', label: 'Marketing Hub', icon: Settings },
            { to: '/escritorio/car-studio', label: 'Car Studio', icon: Camera },
            { to: '/escritorio/admin/inspections', label: 'Inspecciones', icon: FileText },
        ] : []),
    ];

    const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
        `flex items-center px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
        isActive
            ? 'bg-primary-100 text-primary-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    } ${isCollapsed ? 'justify-center' : ''}`;

    const userRoleText = isAdmin ? 'Administrador' : isSales ? 'Ventas' : 'Miembro';

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            <div className={`p-4 border-b flex-shrink-0 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
                 <Link to="/" className="flex items-center">
                    <img src="/images/trefalogo.png" alt="TREFA Logo" className={`w-auto transition-all duration-300 ${isCollapsed ? 'h-6' : 'h-7'}`} />
                 </Link>
            </div>
            <div className="flex-grow p-4 overflow-y-auto">
                <nav className="space-y-2">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={navLinkClasses}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                            <span className={`transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {!isCollapsed && (
                    <div className="mt-6 pt-6 border-t">
                        <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                            <FileEdit className="w-4 h-4 mr-2" />
                            Borradores
                        </h3>
                        <div className="mt-2 space-y-1">
                            {isLoadingDrafts ? (
                                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400"/></div>
                            ) : drafts.length > 0 ? (
                                drafts.map(draft => (
                                    <Link 
                                        key={draft.id} 
                                        to={`/escritorio/aplicacion/${draft.id}`}
                                        className="block text-sm text-gray-600 p-3 rounded-lg hover:bg-gray-100"
                                    >
                                        {draft.car_info?._vehicleTitle || 'Borrador sin auto'}
                                    </Link>
                                ))
                            ) : (
                                <p className="p-3 text-sm text-gray-400">No hay borradores.</p>
                            )}
                        </div>
                    </div>
                )}
                
                {!isCollapsed && (
                     <div className="mt-6 pt-6 border-t">
                        <NavLink
                            to="/escritorio/encuesta"
                            className={navLinkClasses}
                        >
                            <ListChecks className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'}`} />
                            <span className={`transition-opacity duration-200 whitespace-nowrap ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Encuesta de Mejora</span>
                        </NavLink>
                    </div>
                )}
            </div>
            <div className="p-4 border-t flex-shrink-0">
                 <NavLink
                    to="/escritorio/profile"
                    className={`flex items-center mb-4 transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                 >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-gray-600" />
                    </div>
                    {!isCollapsed && (
                        <div className="ml-3 min-w-0">
                            <p className="font-semibold text-sm text-gray-800 truncate">{profile?.first_name || user?.email}</p>
                            <p className="text-xs text-gray-500">{userRoleText}</p>
                        </div>
                    )}
                </NavLink>
                <button
                    onClick={handleSignOut}
                    title={isCollapsed ? 'Cerrar Sesión' : undefined}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md text-white font-semibold bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 transform-gpu active:scale-95 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="ml-3">Cerrar Sesión</span>}
                </button>
            </div>
            <div className="p-2 border-t flex-shrink-0">
                 <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    title={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </div>
        </div>
    );
};

export default SidebarContent;