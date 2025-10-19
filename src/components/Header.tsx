import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserIcon, LogOutIcon, ChevronDownIcon } from './icons';
import { useAuth } from '../context/AuthContext';
import MegaMenu from './MegaMenu';
import HeaderSearchBar from './HeaderSearchBar';


const Header: React.FC = () => {
    const [megaMenuOpen, setMegaMenuOpen] = useState(false);
    const { session, profile, signOut } = useAuth();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);
    const location = useLocation();
    const isListPage = location.pathname === '/autos';
    // FIX: Added state and an effect with MutationObserver to hide the header when a lightbox is active anywhere on the page.
    const [isHidden, setIsHidden] = useState(false);

    useEffect(() => {
        // Initial check in case the component mounts after the class is added
        setIsHidden(document.body.classList.contains('lightbox-active'));

        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target as HTMLElement;
                    setIsHidden(target.classList.contains('lightbox-active'));
                }
            }
        });

        observer.observe(document.body, { attributes: true });

        return () => {
            observer.disconnect();
        };
    }, []);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        setProfileMenuOpen(false);
    };

    if (isHidden) {
        return null;
    }

    return (
      <header className="fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-gray-200/80">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24 lg:h-28 gap-x-4">
            {/* Left Section */}
            <div className={`flex justify-start items-center ${!isListPage ? 'lg:w-1/3' : ''}`}>
                <div className="flex items-center">
                    <Link to="/" className="flex items-center space-x-4">
                      <img 
                        src={"/images/trefalogo.png"}
                        alt="TREFA" 
                        className="w-auto object-contain transition-all h-7 lg:h-9"
                      />
                    </Link>
                </div>
            </div>

            {/* Center Section (Search) */}
            {!isListPage && (
             <div className="flex-1 flex justify-center min-w-0 px-2">
                    <HeaderSearchBar />
                </div>
            )}
            
            {/* Right Section */}
            <div className={`flex justify-end items-center ${!isListPage ? 'lg:w-1/3' : ''}`}>
                <div className="flex items-center space-x-6">
                  <div className="hidden lg:block">
                      <button ref={menuButtonRef} onClick={() => setMegaMenuOpen(o => !o)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-base font-bold transition-colors text-primary-600 border-b hover:bg-gray-100">
                          <span>Menú</span>
                          <ChevronDownIcon className={`w-5 h-5 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} fill="currentColor"/>
                      </button>
                  </div>

                  {session ? (
                     <div className="relative hidden lg:block" ref={profileMenuRef}>
                        <button
                            onClick={() => setProfileMenuOpen(o => !o)}
                            className="flex items-center gap-2 text-base font-semibold transition-colors text-gray-700 hover:text-primary-600"
                        >
                            <UserIcon className="w-8 h-8 rounded-full p-1.5 bg-white text-gray-500" />
                            <span className="hidden sm:inline">{profile?.first_name ? `Hola, ${profile.first_name}` : ' '}</span>
                        </button>
                        {profileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-40 bg-white">
                                <Link
                                    to="/escritorio"
                                    onClick={() => setProfileMenuOpen(false)}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 active:bg-red-100"
                                >
                                    <LogOutIcon className="w-4 h-4" /> Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                  ) : (
                    <Link
                      to="/acceder"
                      data-gtm-id="header-login-button"
                      className="hidden lg:block text-base font-semibold transition-all duration-300 px-5 py-2.5 rounded-lg text-white shadow-sm hover:shadow-md bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 transform-gpu active:scale-95"
                    >
                      Iniciar Sesión
                    </Link>
                  )}
                </div>
            </div>
          </div>
          <MegaMenu 
            isOpen={megaMenuOpen} 
            onClose={() => setMegaMenuOpen(false)}
            triggerRef={menuButtonRef as any}
          />
        </div>
      </header>
    );
};

export default Header;