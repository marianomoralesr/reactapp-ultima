import React, { useState, useEffect } from 'react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import ReviewCard, { Review } from './ReviewCard';
import { GoogleIcon, FacebookIcon } from './icons';

const ShimmerSpan: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => (
     <span className={`inline-block bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent group-data-[visible=true]:animate-shimmer ${className}`}>
        {children}
    </span>
);

const AnimatedHeader: React.FC<{ title: React.ReactNode, subtitle: string }> = ({ title, subtitle }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    return (
        <div ref={ref} data-visible={isVisible} className={`text-center transition-all duration-700 ease-out group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900">{title}</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                {subtitle}
            </p>
        </div>
    );
};

const simulatedReviews: Review[] = [
    { source: 'Google', name: 'Mariana G.', avatar: 'https://randomuser.me/api/portraits/women/18.jpg', rating: 5, text: 'El proceso fue increíblemente rápido y transparente. En menos de 48 horas ya tenía mi nuevo auto. ¡El mejor servicio!', date: 'hace 2 semanas' },
    { source: 'Facebook', name: 'Carlos R.', avatar: 'https://randomuser.me/api/portraits/men/44.jpg', rating: 5, text: 'Vendí mi auto a un precio justo y sin salir de casa. El equipo de TREFA se encargó de todo. Totalmente recomendado.', date: 'hace 1 mes' },
    { source: 'Google', name: 'Sofía L.', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', rating: 5, text: 'Tenía dudas sobre el financiamiento, pero el asesor me guió paso a paso y encontró la mejor opción para mí. Súper pacientes y profesionales.', date: 'hace 3 semanas' },
    { source: 'Google', name: 'Javier Torres', avatar: 'https://randomuser.me/api/portraits/men/32.jpg', rating: 5, text: 'La calidad de los autos es de primera. Compré una camioneta y parece nueva. La inspección de 150 puntos realmente da confianza.', date: 'hace 5 días' },
    { source: 'Facebook', name: 'Laura Fernández', avatar: 'https://randomuser.me/api/portraits/women/44.jpg', rating: 5, text: 'Buen servicio en general. El proceso digital es muy cómodo, aunque la entrega tardó un día más de lo esperado. Aún así, los recomiendo.', date: 'hace 1 mes' },
    { source: 'Google', name: 'Ricardo Mendoza', avatar: 'https://randomuser.me/api/portraits/men/35.jpg', rating: 5, text: 'La mejor experiencia de compra que he tenido. Sin presión, sin trucos, solo un servicio honesto y eficiente. El portal de clientes es muy útil.', date: 'hace 2 meses' },
    { source: 'Facebook', name: 'Ana Patricia', avatar: 'https://randomuser.me/api/portraits/women/65.jpg', rating: 5, text: '¡Me encanta mi nuevo coche! Gracias a todo el equipo de TREFA por hacerlo tan fácil. El financiamiento que me consiguieron fue excelente.', date: 'hace 1 semana' },
    { source: 'Google', name: 'David Ortiz', avatar: 'https://randomuser.me/api/portraits/men/75.jpg', rating: 5, text: 'Desde la valuación de mi auto antiguo hasta la compra del nuevo, todo el proceso fue impecable. Muy profesionales.', date: 'hace 3 meses' },
    { source: 'Facebook', name: 'Valeria Sosa', avatar: 'https://randomuser.me/api/portraits/women/88.jpg', rating: 5, text: '10/10. El personal es amable y el proceso 100% digital me ahorró muchísimo tiempo. Definitivamente volvería a comprar aquí.', date: 'hace 6 días' },
    { source: 'Google', name: 'Fernando Díaz', avatar: 'https://randomuser.me/api/portraits/men/11.jpg', rating: 5, text: 'El auto está en excelentes condiciones. El único detalle fue que el papeleo final tomó un poco más de tiempo. Fuera de eso, todo perfecto.', date: 'hace 2 meses' },
    { source: 'Facebook', name: 'Gabriela Ríos', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', rating: 5, text: 'La atención por WhatsApp es súper rápida y eficiente. Resolvieron todas mis dudas al momento. ¡Gran servicio!', date: 'hace 3 semanas' },
    { source: 'Google', name: 'Andrés Paredes', avatar: 'https://randomuser.me/api/portraits/men/55.jpg', rating: 5, text: 'El equipo de post-venta es genial. Tuvieron un pequeño detalle con la entrega y lo solucionaron de inmediato con un gesto comercial. Así se gana un cliente.', date: 'hace 1 mes' },
    { source: 'Google', name: 'Alejandro V.', avatar: 'https://randomuser.me/api/portraits/men/4.jpg', rating: 5, text: 'El mejor trato que he recibido. Me explicaron todo sobre el financiamiento y me ayudaron a elegir la mejor opción. Cero presiones y muy transparentes.', date: 'hace 2 días' },
    { source: 'Facebook', name: 'Mónica S.', avatar: 'https://randomuser.me/api/portraits/women/5.jpg', rating: 5, text: 'Dejé mi auto a consignación y se vendió rapidísimo. El equipo de marketing hizo un gran trabajo promocionándolo. Muy contenta con el servicio.', date: 'hace 1 semana' },
    { source: 'Google', name: 'Roberto Garza', avatar: 'https://randomuser.me/api/portraits/men/6.jpg', rating: 5, text: 'Compré mi primer auto aquí y la experiencia fue de 10. Fernando, el asesor, fue súper amable y me ayudó a entender todo el proceso. El auto está impecable.', date: 'hace 4 días' }
];

const WallOfLove: React.FC = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 640); // sm breakpoint is 640px
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const reviewsToShow = isMobile ? simulatedReviews.slice(0, 6) : simulatedReviews;

    return (
        <section className="bg-white py-20 sm:py-24 lg:py-32 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 flex flex-col">
                <div className="order-1 max-w-7xl mx-auto">
                     <AnimatedHeader 
                        title={<>
                            <ShimmerSpan className="from-gray-900 via-gray-600 to-gray-900">Nuestros clientes</ShimmerSpan>
                            {' '}
                            <ShimmerSpan className="from-yellow-500 via-amber-300 to-yellow-500">nos respaldan</ShimmerSpan>
                        </>} 
                        subtitle="La experiencia de comprar o vender tu auto nunca fue tan fácil. Lee lo que dicen de nosotros en Google y Facebook." 
                    />
                </div>
                <div className="order-3 lg:order-2 mt-16 lg:mt-12 lg:mb-16 max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <a href="https://www.google.com/search?q=Autos+TREFA+reseñas" target="_blank" rel="noopener noreferrer" 
                           style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}
                           className="w-full sm:w-auto text-center text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 to-blue-500 bg-[length:200%_100%] animate-[neon-pan_3s_ease_infinite] flex items-center justify-center gap-3">
                            <GoogleIcon className="w-6 h-6" />
                            <span>Verificar en Google</span>
                        </a>
                         <a href="https://www.facebook.com/autostrefamx/reviews" target="_blank" rel="noopener noreferrer" 
                            style={{textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}
                            className="w-full sm:w-auto text-center text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-[length:200%_100%] animate-[neon-pan_3s_ease_infinite] flex items-center justify-center gap-3">
                            <FacebookIcon className="w-6 h-6" />
                            <span>Verificar en Facebook</span>
                        </a>
                    </div>
                </div>
                <div className="order-2 lg:order-3 mt-16 lg:mt-0">
                     <div className="w-full">
                         <div className="masonry-wall">
                            {reviewsToShow.map((review, index) => (
                                <ReviewCard key={index} review={review} index={index} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WallOfLove;