import React, { useState, useMemo, useEffect } from 'react';
import { Navigation } from 'lucide-react';
import type { WordPressVehicle } from '../types/types';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

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

// Centralized branch data
const branchData: { [key: string]: { name: string; address: string; mapUrl: string; directionsUrl: string; } } = {
    'Monterrey': {
        name: 'Monterrey',
        address: 'Av. Aaron Saenz Garza 1902, Santa Maria, 64650 Monterrey, N.L.',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3596.223032128542!2d-100.3582293849808!3d25.6640582836821!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86629606d152a58b%3A0x83363c6511a932d!2sAutos%20TREFA%20Suc.%20Santa%20Mar%C3%ADa!5e0!3m2!1sen!2smx!4v1663000000000!5m2!1sen!2smx',
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Autos+TREFA+Suc.+Santa+Mar%C3%ADa,+Monterrey'
    },
    'Guadalupe': {
        name: 'Guadalupe',
        address: 'Blvd. Miguel de la Madrid 100, Guadalupe, N.L.',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3595.34085802187!2d-100.2520864259508!3d25.69269771239968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8662953266911c37%3A0x946b52c3c138122d!2sAutos%20TREFA!5e0!3m2!1ses-419!2smx!4v1709660249619!5m2!1ses-419!2smx',
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Autos+TREFA,+Blvd.+Miguel+de+la+Madrid+100,+Guadalupe'
    },
    'Reynosa': {
        name: 'Reynosa',
        address: 'Carr. a Matamoros 200, Reynosa, Tamaulipas',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3581.657861961917!2d-98.24346692593409!3d26.1424683921589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8669837941743833%3A0x9560f7e435a29881!2sTREFA%20Reynosa!5e0!3m2!1ses-419!2smx!4v1709660305638!5m2!1ses-419!2smx',
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=TREFA+Reynosa'
    },
    'Saltillo': {
        name: 'Saltillo',
        address: 'Blvd. Venustiano Carranza 5800, Saltillo, Coahuila',
        mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3602.810577905786!2d-100.99913802595996!3d25.44458312076059!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x86880d60393303c9%3A0x33b5413345239534!2sTrefa%20Saltillo!5e0!3m2!1ses-419!2smx!4v1709660339301!5m2!1ses-419!2smx',
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Trefa+Saltillo'
    },
};

interface LocationSectionProps {
    vehicle?: WordPressVehicle | null;
}

const LocationSection: React.FC<LocationSectionProps> = ({ vehicle }) => {
    const vehicleSucursales = useMemo(() => vehicle?.sucursal?.map(s => s.toLowerCase().trim()) || [], [vehicle]);

    const finalBranches = useMemo(() => {
        if (vehicleSucursales.length === 0) {
            return Object.values(branchData);
        }
        const branchesToShow = Object.values(branchData).filter(branch => 
            vehicleSucursales.some(vs => branch.name.toLowerCase().includes(vs))
        );
        return branchesToShow.length > 0 ? branchesToShow : Object.values(branchData);
    }, [vehicleSucursales]);
    
    const mainBranchForMap = useMemo(() => finalBranches[0] || branchData['Monterrey'], [finalBranches]);

    const [selectedBranch, setSelectedBranch] = useState(mainBranchForMap);

    useEffect(() => {
        setSelectedBranch(mainBranchForMap);
    }, [mainBranchForMap]);

    return (
    <section className="backdrop-blur-md py-20 sm:py-24 lg:py-32 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 flex flex-col mb-4">
                <div className="order-1 max-w-7xl mx-auto">
                     <AnimatedHeader 
                        title={<>
                            <ShimmerSpan className="from-gray-600 via-gray-700 to-gray-900"> Contamos con  </ShimmerSpan>
                            {' '}
                            <ShimmerSpan className="from-red-500 via-amber-600 to-primary-600">v4 sucursales</ShimmerSpan>
                        </>} 
                        subtitle="Con presencia en 3 estados, nuestras sucursales ofrecen todos los servicios de compra, venta y mantenimientos."
                    />
                </div>
             </div>
        <div className="text-center items-center py-10 px-4 sm:px-0 sm:p-4 lg:p-8">
            <div className="p-2 rounded-3xl bg-gradient-to-br from-primary-500 to-orange-400 mb-6">
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg border-2 border-white relative group">
                    <iframe 
                        key={selectedBranch.name}
                        src={selectedBranch.mapUrl} 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen={false} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`Ubicación de ${selectedBranch.name}`}
                        className="grayscale group-hover:grayscale-0 transition-all duration-500"
                    ></iframe>
                </div>
            </div>

            <div className="space-y-3">
                {finalBranches.map(branch => (
                    <button 
                        key={branch.name} 
                        onClick={() => setSelectedBranch(branch)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-300 transform hover:-translate-y-0.5 ${selectedBranch.name === branch.name ? 'bg-primary-50 border-primary-500 shadow-md' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-gray-800">{branch.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{branch.address}</p>
                            </div>
                            <a 
                                href={branch.directionsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 ml-4 p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 hover:text-primary-600 border border-gray-300 shadow-sm"
                                aria-label={`Get directions to ${branch.name}`}
                            >
                                <Navigation className="w-5 h-5" />
                            </a>
                        </div>
                    </button>
                ))}
            </div>
             <p className="text-center text-sm text-gray-600 mt-6 bg-gray-100 p-3 rounded-lg">
                <strong></strong> Ofrecemos reubicación sin costo entre sucursales el mismo
            </p>
        </div>
    </section>
    );
};

export default LocationSection;