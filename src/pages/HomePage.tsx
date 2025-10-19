import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import type { Vehicle } from '../types/types';
import useIntersectionObserver from '../hooks/useIntersectionObserver';
import { 
    CarIcon as Car,
    FileTextIcon as FileText, 
    CheckIcon as Check, 
    ArrowRightIcon as ArrowRight    
} from '../components/icons';
import WallOfLove from '../components/WallOfLove';
import { formatPrice, getPlaceholderImage } from '../utils/formatters';
import useSEO from '../hooks/useSEO';
import WhyChooseTrefaSection from '../components/WhyChooseTrefaSection';
import VehicleGridCard from '../components/VehicleGridCard';
import LazyImage from '../components/LazyImage';
import { proxyImage } from '../utils/proxyImage';

const HeroVehicleCard: React.FC<{ vehicle: Vehicle }> = React.memo(({ vehicle }) => {
    const imageSrc = vehicle.feature_image || getPlaceholderImage(vehicle);

    return (
        <div className="relative h-full group">
            <div className="h-full rounded-2xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="relative aspect-[4/3] bg-gray-100">
                    <LazyImage 
                        src={imageSrc} 
                        alt={vehicle.titulo} 
                        className="w-full h-full"
                        objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                        <h3 className="text-white font-bold text-sm truncate drop-shadow-md" title={vehicle.titulo}>
                            {vehicle.titulo}
                        </h3>
                        <p className="text-primary-400 font-semibold text-base drop-shadow-md">{formatPrice(vehicle.precio)}</p>
                    </div>
                </div>
            </div>
            <Link to={`/autos/${vehicle.slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">Ver detalles de {vehicle.titulo}</span>
            </Link>
        </div>
    );
});


const ShimmerSpan: React.FC<{children: React.ReactNode, className?: string}> = ({children, className}) => (
    <span className={`inline-block bg-gradient-to-r bg-[length:200%_100%] bg-clip-text text-transparent group-data-[visible=true]:animate-shimmer ${className}`}>
        {children}
    </span>
);


const ScrollerRow: React.FC<{ vehicles: Vehicle[], reverse?: boolean, speed?: number }> = ({ vehicles, reverse = false, speed = 40 }) => {
    // We need at least a few vehicles to make the loop seamless.
    const extendedVehicles = [...vehicles];
    while (extendedVehicles.length > 0 && extendedVehicles.length < 10) {
        extendedVehicles.push(...vehicles);
    }

    const ScrollerContent = () => (
        <>
            {extendedVehicles.map((v, i) => (
                <div key={`${v.id}-${i}`} className="flex-shrink-0 w-44 sm:w-60 h-auto">
                    <HeroVehicleCard vehicle={v} />
                </div>
            ))}
        </>
    );

    return (
        <div 
            className={`flex gap-4 ${reverse ? 'animate-scroll-right' : 'animate-scroll-left'}`} 
            style={{ animationDuration: `${speed}s` }}
        >
            <div className="flex flex-shrink-0 gap-4 min-w-full">
                <ScrollerContent />
            </div>
            <div className="flex flex-shrink-0 gap-4 min-w-full">
                <ScrollerContent />
            </div>
        </div>
    );
};

const NewHeroSection: React.FC = () => {
    const { vehicles: allVehicles, isLoading } = useVehicles();
    const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>([]);

    useEffect(() => {
        console.log('🎭 [Hero] Received vehicles:', allVehicles.length);

        if (allVehicles.length > 0) {
            const available = allVehicles.filter(v => !v.separado && !v.vendido);
            console.log(`🎭 [Hero] After filtering (not separado/vendido): ${available.length}/${allVehicles.length}`);

            // Debug: Log first 3 vehicles' status
            console.log('🎭 [Hero] Sample vehicle status:', allVehicles.slice(0, 3).map(v => ({
                titulo: v.titulo,
                separado: v.separado,
                vendido: v.vendido,
                slug: v.slug,
                feature_image: v.feature_image ? '✓' : '✗',
            })));

            const shuffled = [...available].sort(() => 0.5 - Math.random());
            setDisplayVehicles(shuffled);
            console.log(`🎭 [Hero] Set ${shuffled.length} vehicles for display`);
        } else {
            console.warn('⚠️ [Hero] No vehicles to display!');
        }
    }, [allVehicles]);

    const rows = useMemo(() => ({
        row1: displayVehicles.slice(0, 7),
        row2: displayVehicles.slice(7, 14)
    }), [displayVehicles]);

    return (
        <section className="relative w-full overflow-hidden lg:pt-12 pb-8">
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-24 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
                <div className="absolute top-1/2 -right-24 w-72 h-72 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-trefa-blue/10 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-2 mt-6 lg:mb-8">
                <h1 className="text-4xl sm:text-6xl lg:text-7xl lg:pt-4 font-black tracking-tight text-gray-900 leading-tight sm:leading-tight lg:leading-none animate-fade-in-down">
                    Estrenar un auto 🚗 nunca fue tan
                    <br />
                    <span>
                        <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">fácil</span> ✨,
                        <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]"> rápido</span> ⚡️ y
                        <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]"> seguro</span> 🛡️
                    </span>
                </h1>
            </div>

            {displayVehicles.length >= 1 ? (
                <div className="h-[320px] md:h-[420px] relative flex justify-start items-start mask-gradient">
                    <div className="absolute top-0 left-0 w-full flex flex-col justify-center gap-2 h-full">
                        <ScrollerRow vehicles={rows.row1} speed={25} />
                        <ScrollerRow vehicles={rows.row2} reverse speed={35} />
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-6">
                    <p className="text-gray-400">
                        {isLoading ? 'Cargando inventario...' : 'Actualizando lo más nuevo de nuestro inventario...'}
                    </p>
                </div>
            )}

            <div className="mt-12 sm:mt-14 text-center">
                <Link 
                    to="/autos"
                    data-gtm-id="cta-principal-inicio"
                    className="inline-block text-xl font-semibold transition-all duration-300 px-10 py-5 rounded-lg text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700"
                >
                    Ver el inventario completo
                </Link>
            </div>
        </section>
    );
};


const Section: React.FC<{ children: React.ReactNode, className?: string, id?: string }> = ({ children, className = '', id }) => (
    <section id={id} className={`relative py-20 sm:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 w-full overflow-hidden ${className}`}>
        <div className="max-w-7xl mx-auto">{children}</div>
    </section>
);

const AnimatedHeader: React.FC<{ title: React.ReactNode, subtitle: string }> = ({ title, subtitle }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });
    return (
        <div ref={ref} data-visible={isVisible} className={`text-center transition-all duration-700 ease-out group ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight text-gray-900 leading-snug lg:leading-tight">{title}</h2>
            <p className="mt-4 text-lg max-w-3xl mx-auto leading-relaxed">{subtitle}</p>
        </div>
    );
};

const StepCard: React.FC<{ icon: React.ElementType, title: string, description: string }> = React.memo(({ icon: Icon, title, description }) => {
    const [ref, isVisible] = useIntersectionObserver({ threshold: 0.2 });
    return (
        <div ref={ref} className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex items-center justify-center w-20 h-20 rounded-full border-4 mb-6 mx-auto bg-white/10 border-white/30">
                <Icon className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="mt-2 text-white/80">{description}</p>
        </div>
    );
});

const HowItWorksSection: React.FC = () => {
    const steps = useMemo(() => [
        { icon: Car, title: "1. Elige un auto", description: "Explora nuestro inventario certificado y encuentra el auto perfecto para ti." },
        { icon: FileText, title: "2. Haz click en Financiar", description: "Completa tu solicitud de financiamiento 100% en línea de forma rápida y segura." },
        { icon: Check, title: "3. Envía tu solicitud", description: "En menos de 24 horas recibirás una respuesta del banco con mayores probabilidades de aprobar tu crédito." }
    ], []);

    return (
        <Section className="bg-gradient-to-br from-orange-500 to-amber-700 hover:to-orange-700 text-white">
            <AnimatedHeader 
                title={<span className="text-white">Así de fácil es estrenar</span>} 
                subtitle="Nuestro proceso está diseñado para ser rápido, sencillo y completamente transparente. Además, cuentas con asesoría personalizada en cada paso del proceso vía WhatsApp. " 
            />
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 text-center">
                {steps.map((step, index) => <StepCard key={index} {...step} />)}
            </div>
        </Section>
    );
};

const FeaturedInventorySection: React.FC = () => {
    const { vehicles: allVehicles, isLoading } = useVehicles();
    const [displayVehicles, setDisplayVehicles] = useState<Vehicle[]>([]);

    useEffect(() => {
        console.log('⭐ [Featured] Received vehicles:', allVehicles.length);

        if (allVehicles.length > 0) {
            const available = allVehicles.filter(v => !v.separado && !v.vendido && v.feature_image);
            console.log(`⭐ [Featured] After filtering (not separado/vendido + has image): ${available.length}/${allVehicles.length}`);

            const shuffled = [...available].sort(() => 0.5 - Math.random()).slice(0, 4);
            setDisplayVehicles(shuffled);
            console.log(`⭐ [Featured] Set ${shuffled.length} vehicles for display`);
        }
    }, [allVehicles]);

    return (
        <Section className="bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <AnimatedHeader 
                    title={<ShimmerSpan className="from-gray-900 via-gray-600 to-gray-900">Inventario Destacado</ShimmerSpan>} 
                    subtitle="Una selección de nuestros autos más populares, inspeccionados rigurosamente y con el tanque lleno, listos para tu nueva aventura o regresar contigo a casa." 
                />
            </div>
            <div className="mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {isLoading ? (
                    <div className="col-span-full text-center text-gray-500">Cargando vehículos...</div>
                ) : displayVehicles.length > 0 ? (
                    displayVehicles.map(vehicle => <VehicleGridCard key={vehicle.id} vehicle={vehicle} />)
                ) : (
                    <div className="col-span-full text-center text-gray-500">No hay vehículos disponibles</div>
                )}
            </div>
            <div className="mt-12 text-center">
                <Link to="/autos" className="text-base font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                    Conocer nuestro famoso inventario &rarr;
                </Link>
            </div>
        </Section>
    );
};


const CTACardsSection: React.FC = () => (
    <Section className="bg-white">
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Top Card */}
            <div className="bg-trefa-bgradient-down text-white rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="p-4 md:p-12 flex flex-col md:flex-row md:items-center justify-between">
                    <div className="relative z-10 text-center md:text-left md:w-1/2 lg:w-3/5">
                        <h2 className="text-4xl md:text-5xl font-extrabold">Conoce nuestro inventario</h2>
                        <p className="mt-4 text-lg text-gray-300">Autos seminuevos seleccionados cuidadosamente para ti.</p>
                        <Link to="/autos" className="mt-8 inline-flex items-center font-semibold group text-lg">
                            Ver inventario
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="relative md:w-1/2 lg:w-3/5 mt-7 md:mt-0 h-32 md:h-64">
                        <img src={proxyImage("http://5.183.8.48/wp-content/uploads/2025/01/autos-trefa-.png")} alt="Black SUV" className="absolute bottom-0 right-0 w-full h-auto max-h-full object-contain object-right-bottom transition-transform duration-300 group-hover:scale-105" />
                    </div>
                </div>
            </div>
            {/* Middle Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Sell Car Card */}
                <div className="bg-trefa-bgradient-right text-white rounded-3xl p-6 md:p-10 relative overflow-hidden min-h-[20rem] flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative z-10">
                        <h3 className="text-4xl font-extrabold">¿Quieres vender tu auto?</h3>
                        <p className="mt-2 text-gray-300">Recibe una oferta por tu auto en un proceso rápido y transparente.</p>
                        <Link to="/vender-mi-auto" className="mt-6 inline-flex items-center font-semibold group text-lg">
                            Recibir una oferta
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <img src="https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/klipartz.com.png" alt="Vende tu auto" className="absolute bottom-0 right-0 w-1/2 max-w-[200px] object-contain pointer-events-none opacity-40 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110" />
                </div>
                {/* Contact Advisor Card */}
                <div className="bg-trefa-bgradient-left text-white rounded-3xl p-6 md:p-10 relative overflow-hidden min-h-[20rem] flex flex-col justify-between group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative z-10">
                        <h3 className="text-4xl font-extrabold">Hablar con un asesor</h3>
                        <p className="mt-2 text-gray-300">Obtén una asesoría personalizada de un experto de nuestro equipo.</p>
                        <a href="https://wa.me/5218187049079" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center font-semibold group text-lg">
                            Iniciar chat
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </a>
                    </div>
                    <img src="/images/fer-help.png" alt="Trefa Fernando" className="absolute bottom-0 right-0 w-1/2 max-w-[150px] object-contain pointer-events-none opacity-40 group-hover:opacity-60 transition-all duration-300 group-hover:scale-110" />
                </div>
            </div>
            {/* Bottom Card */}
            <div className="bg-trefa-bgradient-up text-white border-xl rounded-3xl relative overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                <div className="p-6 md:p-14 flex flex-col md:flex-row md:items-center justify-between">
                    <div className="relative z-10 text-center md:text-left md:w-1/2 lg:w-3/5">
                        <h2 className="text-4xl md:text-5xl font-extrabold">Tramita tu crédito en línea</h2>
                        <p className="mt-4 text-lg text-gray-100">Nuevo portal de financiamiento con respuesta en 24 horas o menos.</p>
                        <Link to="/escritorio/aplicacion" className="mt-8 text-trefa-primary inline-flex items-center font-semibold group text-lg">
                            Ver autos elegibles
                            <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="relative md:w-1/2 lg:w-2/5 mt-8 md:mt-0 h-40 md:h-64">
                         <img src="https://jjepfehmuybpctdzipnu.supabase.co/storage/v1/object/public/fotos_airtable/app/financiamiento.png" alt="Financiamiento en línea"  className="absolute bottom-0 right-0 w-full h-auto max-h-[80%] md:max-h-full object-contain transition-transform duration-300 group-hover:scale-105" />
                    </div>
                </div>
            </div>
        </div>
    </Section>
);


const HomePage: React.FC = () => {
    useSEO({
        title: 'Autos Seminuevos Certificados y con Financiamiento | TREFA',
        description: 'Compra y vende tu auto de forma segura. En TREFA ofrecemos seminuevos certificados con inspección de 150 puntos y financiamiento ágil 100% digital.',
        keywords: 'autos seminuevos, seminuevos monterrey, venta de autos, financiamiento automotriz, comprar auto, vender auto, agencia de seminuevos, trefa'
    });

    return (
        <main className="relative z-10">
            <NewHeroSection />
            <CTACardsSection />
          <WhyChooseTrefaSection />
            <FeaturedInventorySection />
            <HowItWorksSection />
            <WallOfLove />
        </main>
    );
};

export default HomePage;
