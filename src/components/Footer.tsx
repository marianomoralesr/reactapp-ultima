import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, LinkedInIcon, GoogleIcon } from './icons';
import { useAuth } from '../context/AuthContext';

const Footer: React.FC = () => {
    const socialLinks = [
        { name: 'Facebook', href: 'https://facebook.com/autostrefamx', icon: FacebookIcon },
        { name: 'Instagram', href: 'https://instagram.com/autostrefamx', icon: InstagramIcon },
        { name: 'LinkedIn', href: 'https://linkedin.com/company/autostrefamx', icon: LinkedInIcon },
        { name: 'Google', href: 'https://maps.app.goo.gl/qRWitFgU7Hy7zEWw9', icon: GoogleIcon }

    ];

    const { session } = useAuth();
    const navigate = useNavigate();

    const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string, authRequired: boolean) => {
        if (authRequired && !session) {
            e.preventDefault();
            localStorage.setItem('loginRedirect', to);
            navigate('/acceder');
        }
    };

    const LinkItem: React.FC<{ to: string; children: React.ReactNode; authRequired?: boolean }> = ({ to, children, authRequired = false }) => (
        <li>
            <Link 
                to={to} 
                className="text-base text-gray-400 hover:text-white transition-colors"
                onClick={(e) => handleLinkClick(e, to, authRequired)}
            >
                {children}
            </Link>
        </li>
    );

    return (
        <footer className="bg-gray-900 border-t border-gray-800 text-gray-400 pb-20 lg:pb-0">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo and mission */}
                    <div className="space-y-4">
                        <Link to="/" aria-label="Volver a la página de inicio">
                            <img 
                                src="/images/logoblanco.png" 
                                alt="TREFA Logo" 
                                className="h-20 lg:h-24 w-auto" 
                                loading="lazy"
                                decoding="async"
                            />
                        </Link>
                        <p className="text-base">
                            Tu auto seminuevo con financiamiento a tu medida. Proceso 100% digital, seguro y transparente.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Explorar</h3>
                            <ul className="mt-4 space-y-2">
                                <LinkItem to="/">Inicio</LinkItem>
                                <LinkItem to="/autos">Inventario</LinkItem>
                                <LinkItem to="/vender-mi-auto">Vender mi Auto</LinkItem>
                                <LinkItem to="/promociones">Promociones</LinkItem>
                                <LinkItem to="/kit-trefa">Kit de Confianza</LinkItem>
                                <LinkItem to="/carroceria/suv">SUVs</LinkItem>
                                <LinkItem to="/carroceria/sedan">Sedanes</LinkItem>
                                <LinkItem to="/carroceria/pick-up">Pick Ups</LinkItem>
                            </ul>
                        </div>
                        <div>
                             <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Mi Cuenta</h3>
                            <ul className="mt-4 space-y-2">
                                <LinkItem to="/acceder">Iniciar Sesión</LinkItem>
                                <LinkItem to="/escritorio" authRequired={true}>Mi Escritorio</LinkItem>
                                <LinkItem to="/escritorio/favoritos" authRequired={true}>Mis Favoritos</LinkItem>
                                <LinkItem to="/escritorio/aplicacion" authRequired={true}>Solicitar Financiamiento</LinkItem>
                            </ul>
                        </div>
                         <div>
                             <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Soporte y Legal</h3>
                            <ul className="mt-4 space-y-2">
                                <LinkItem to="/faq">Preguntas Frecuentes</LinkItem>
                               <LinkItem to="/vacantes">Vacantes</LinkItem>
                                <LinkItem to="/politica-de-privacidad">Política de Privacidad</LinkItem>
                               <li>
                                    <a aria-label="Visitar blog" href="https://blog.trefa.mx" target="_blank" rel="noopener noreferrer" className="text-base text-gray-400 hover:text-white transition-colors"> Blog </a>
                                </li>
                            </ul>
                            <address className="mt-6 pt-4 border-t border-gray-700 space-y-2 not-italic">
                                <p>Aarón Sáenz Garza 1902, Plaza Oasis, Local 1109, Monterrey, NL</p>
                                <p>
                                    <a href="tel:+528187049079" className="hover:text-white">
                                        Tel: (+52)8187049079
                                    </a>
                                </p>
                            </address>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Grupo TREFA </p> <span className="text-sm pt-2 items-center"> Este sitio está en etapa beta y puede sufrir modificaciones significativas. </span>   <Link to="/beta-v.0.1" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white"> Danos tu opinión </Link> 
                    <div className="flex items-right space-x-6 mt-4 sm:mt-0">
                        {socialLinks.map((item) => (
                            <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                                <span className="sr-only">{item.name}</span>
                                <item.icon className="h-6 w-6" aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;