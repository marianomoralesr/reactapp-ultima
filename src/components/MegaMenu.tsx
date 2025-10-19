import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import {
  UserCircleIcon,
  LogOutIcon,
  UserIcon,
  WhatsAppIcon,
  ArrowRightIcon,
  TagIcon,
  CarIcon,
  SellCarIcon,
  LayoutDashboardIcon,
  HeartIcon,
  FileTextIcon,
  SuvIcon,
  SedanIcon,
  PickupIcon,
  HatchbackIcon,
  // FIX: Replaced 'Award' with 'AwardIcon' to match the exported component.
  AwardIcon,
  // FIX: Changed import from HelpCircle to HelpCircleIcon to resolve module export error.
  HelpCircleIcon
} from './icons';
import type { Profile } from '../types/types';
import MiniValuationForm from './MiniValuationForm';

import { BRAND_LOGOS } from '../utils/constants';

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const mainNavLinks = [
    { name: 'Inventario', to: '/autos', authRequired: false, icon: CarIcon },
    { name: 'Vender mi Auto', to: '/vender-mi-auto', authRequired: false, icon: SellCarIcon },
    { name: 'Promociones', to: '/promociones', authRequired: false, icon: TagIcon },
    { name: 'Kit de Confianza', to: '/kit-trefa', authRequired: false, icon: AwardIcon },
    { name: 'Ayuda / FAQ', to: '/faq', authRequired: false, icon: HelpCircleIcon },
];

const accountNavLinks = [
    { name: 'Mi Escritorio', to: '/escritorio', authRequired: true, icon: LayoutDashboardIcon },
    { name: 'CRM Leads', to: '/escritorio/admin/leads', authRequired: true, adminRequired: true, icon: FileTextIcon },
    { name: 'Mis Favoritos', to: '/escritorio/favoritos', authRequired: true, icon: HeartIcon },
    { name: 'Mis Solicitudes', to: '/escritorio/seguimiento', authRequired: true, icon: FileTextIcon },
    { name: 'Mi Perfil', to: '/escritorio/profile', authRequired: true, icon: UserIcon },
];


const HelpWidget: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const handleContactClick = (e: React.MouseEvent) => {
        e.preventDefault();
        onClose();
        window.open('https://wa.me/5218187049079?text=Hola,%20quisiera%20recibir%20asesoría%20para%20encontrar%20mi%20próximo%20auto.', '_blank');
    };

    return (
        <div className="w-full h-full rounded-lg p-6 flex flex-col justify-between text-left bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden relative shadow-lg">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/images/pattern-lines.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <div className="relative z-20">
                <h3 className="font-extrabold text-xl leading-tight">¿Necesitas Ayuda?</h3>
                <p className="mt-2 text-base text-white/90">Un experto de TREFA está listo para ayudarte a encontrar tu auto ideal.</p>
            </div>
            <a
                href="#"
                onClick={handleContactClick}
                className="mt-6 flex rounded-md font-bold text-base py-3 px-4 bg-green-500 hover:bg-green-600 transition-colors items-center justify-center gap-2 relative z-20 shadow-md"
            >
                <WhatsAppIcon className="w-5 h-5" />
                <span>Contactar Asesor</span>
            </a>
        </div>
    );
};

const AccountWidget: React.FC<{ profile: Profile; onSignOut: () => void; onLinkClick: (to: string) => void; }> = ({ profile, onSignOut, onLinkClick }) => (
    <div className="w-full h-full rounded-lg p-6 flex flex-col justify-between text-left bg-white border border-gray-200">
        <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-4">Mi Cuenta</h2>
            <div className="flex items-center gap-4">
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
                <div>
                    <p className="font-bold text-gray-800">{profile.first_name} {profile.last_name}</p>
                    <p className="text-sm text-gray-500 truncate">{profile.email}</p>
                </div>
            </div>
            <button onClick={() => onLinkClick('/escritorio/profile')} className="w-full flex justify-between items-center text-left p-3 mt-4 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                <span>Editar Perfil</span>
                <ArrowRightIcon className="w-4 h-4" />
            </button>
        </div>
        <button onClick={onSignOut} className="w-full flex items-center justify-center gap-2 p-3 mt-4 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors">
            <LogOutIcon className="w-5 h-5" />
            <span>Cerrar Sesión</span>
        </button>
    </div>
);


const MegaMenu: React.FC<MegaMenuProps> = ({ isOpen, onClose, triggerRef }) => {
    const { session, profile, signOut, isAdmin } = useAuth();
    const { vehicles: allVehicles } = useVehicles();
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);
    const classifications = [
        { name: 'SUV', slug: 'suv', icon: SuvIcon, imageUrl: '/images/suv-filter.png' },
        { name: 'Sedán', slug: 'sedan', icon: SedanIcon, imageUrl: '/images/sedan-filter.png' },
        { name: 'Pick Up', slug: 'pick-up', icon: PickupIcon, imageUrl: '/images/pickup-filter.png' },
        { name: 'Hatchback', slug: 'hatchback', icon: HatchbackIcon, imageUrl: '/images/hatchback-filter.png' },
    ];

    const marcas = useMemo(() => {
        if (!allVehicles) return [];
        const allMarcas = allVehicles.map(v => v.automarca).filter(Boolean);
        const uniqueMarcas = [...new Set(allMarcas)];
        return uniqueMarcas.slice(0, 12).map(marcaName => ({
            id: marcaName,
            name: marcaName,
            slug: marcaName.toLowerCase().replace(/\s+/g, '-'),
            logoUrl: BRAND_LOGOS[marcaName] || '/images/trefalogo.png'
        }));
    }, [allVehicles]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current && !menuRef.current.contains(event.target as Node) &&
                triggerRef.current && !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose, triggerRef]);

    const handleSignOut = () => {
        onClose();
        signOut();
    };
    
    const handleLinkClick = (to: string, authRequired: boolean) => {
        onClose();
        if (authRequired && !session) {
            localStorage.setItem('loginRedirect', to);
            navigate('/acceder');
        } else {
            navigate(to);
        }
    };

    const handleFilterClick = (filterKey: string, filterValue: string) => {
        onClose();
        if (filterKey === 'automarca') {
            navigate(`/marcas/${filterValue.toLowerCase()}`);
        } else if (filterKey === 'classification') {
            navigate(`/carroceria/${filterValue.toLowerCase()}`);
        } else {
            const params = new URLSearchParams();
            if (filterValue) {
                 params.set(filterKey, filterValue);
            }
            navigate(`/autos?${params.toString()}`);
        }
    };
    
    const visibleAccountLinks = accountNavLinks.filter(link => {
        if (!link.authRequired || !session) return false;
        if (link.adminRequired && !isAdmin) return false;
        return true;
    });

    if (!isOpen || !triggerRef.current) return null;

    return (
        <div
            ref={menuRef}
            className="absolute top-full left-0 right-0 w-full animate-slideDown z-40"
            style={{ transformOrigin: 'top' }}
        >
            <div className="mt-2 bg-white rounded-b-2xl shadow-2xl border border-gray-200/80">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-px">
                    {/* Navigation & Filters Section */}
                    <div className="lg:col-span-3 p-8 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-8">
                         {/* Column 1: Main Navigation */}
                        <div>
                            <h2 className="text font-semibold text-gray-800 mb-4">Navegación</h2>
                             <nav className="space-y-1">
                                {mainNavLinks.map(link => {
                                    if (link.authRequired && !session) return null;
                                    return (
                                        <button key={link.name} onClick={() => handleLinkClick(link.to, link.authRequired)} className="text-sm w-full text-left p-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-3">
                                            {link.icon && <link.icon className="w-5 h-5 text-primary-600" />}
                                            <span>{link.name}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                             <h2 className="font-semibold text-gray-800 mb-4 mt-8">Mi Cuenta</h2>
                             <nav className="space-y-1">
                                {visibleAccountLinks.map(link => (
                                    <button key={link.name} onClick={() => handleLinkClick(link.to, link.authRequired)} className="text-sm w-full text-left p-3 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-3">
                                        {link.icon && <link.icon className="w-5 h-5 text-primary-600" />}
                                        <span>{link.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        {/* Column 2: Carrocería */}
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-4">Carrocería</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {classifications.map(c => (
                                    <button key={c.name} onClick={() => handleFilterClick('classification', c.slug)} className="text-sm w-full flex flex-col items-center justify-center p rounded font-semibold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-100">
                                        <img src={c.imageUrl} alt={c.name} className="w-24 h-24" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Column 3: Marcas */}
                        <div>
                            <h2 className="font-semibold text-gray-800 mb-4">Marcas Populares</h2>
                            <nav className="space-y-1 max-h-96 overflow-y-auto pr-2">
                                {marcas.map(marca => (
                                                                                                              <button key={marca.id} onClick={() => handleFilterClick('automarca', marca.slug)} className="w-full flex items-center gap-2 p-2 rounded-lg font-medium text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                                                                                                 {marca.logoUrl && <img src={marca.logoUrl} alt={`${marca.name} Logo`} className="w-8 h-8 object-contain" />}
                                                                                                                 <span>{marca.name}</span>
                                                                                                             </button>
                                ))}
                                  <button onClick={() => handleFilterClick('automarca', '')} className="w-full text-left p-2 rounded-lg font-semibold text-sm text-primary-600 hover:bg-primary-50 transition-colors">
                                    Ver todas las marcas &rarr;
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Widgets Section */}
                    <div className="lg:col-span-2 p-6 bg-gray-50 rounded-br-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                        <MiniValuationForm onClose={onClose} />
                         {session && profile ? (
                            <AccountWidget profile={profile} onSignOut={handleSignOut} onLinkClick={(to) => handleLinkClick(to, true)} />
                        ) : (
                            <HelpWidget onClose={onClose} />
                        )}
                    </div>  
                </div>
            </div>
        </div>
    );
};

export default MegaMenu;