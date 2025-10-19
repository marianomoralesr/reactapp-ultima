import React, { useMemo } from 'react';
import { useVehicles } from '../context/VehicleContext';
import { Phone, MapPin, Share2 } from 'lucide-react';
import useIntersectionObserver from '../hooks/useIntersectionObserver';

import { proxyImage } from '../utils/proxyImage';

const branchData = [
    {
        city: 'Monterrey',
        phone: '8187049079',
        address: 'Aaron Sáenz Garza #1902, Local 111 (Plaza Oasis), Col. Santa María | 64650 NL',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/TREFA-San-JEronimo.jpg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Autos+TREFA+Suc.+Santa+Mar%C3%ADa,+Monterrey',
    },
    {
        city: 'Reynosa',
        phone: '8994602822',
        address: 'Boulevard Beethoven #100, Col. Narciso Mendoza | 88700, TMPS ',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/Reynosa.jpg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=TREFA+Reynosa',
    },
    {
        city: 'Guadalupe',
        phone: '8187049079',
        address: 'Hidalgo #918, Col. Paraíso | 67140 Centro de Guadalupe, NL',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/2023-02-03.jpg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Autos+TREFA,+Blvd.+Miguel+de+la+Madrid+100,+Guadalupe',
    },
    {
        city: 'Saltillo',
        phone: '8442123399',
        address: 'Blvd. Nazario Ortiz #2060, Local 132, Col 16 | Saltillo, COAH 25253',
        imageUrl: proxyImage('http://5.183.8.48/wp-content/uploads/2025/02/Saltillo-Autos-TREFA.jpeg'),
        directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=Trefa+Saltillo',
    },
];

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

const LocationCard: React.FC<{ branch: typeof branchData[0] & { autosCount: number } }> = ({ branch }) => {
    return (
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <img src={branch.imageUrl} alt={`Sucursal ${branch.city}`} className="w-full h-48 object-cover" />
            <div className="p-5">
                <h3 className="text-2xl font-bold text-gray-900">{branch.city}</h3>
                <p className="text-sm text-gray-500 font-medium">{branch.autosCount} autos seminuevos</p>
                <hr className="my-4" />
                <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{branch.phone}</span>
                    </li>
                    <li className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{branch.address}</span>
                    </li>
                </ul>
                <div className="mt-5 pt-4 border-t border-gray-200/80 flex items-center justify-between gap-3 text-sm font-semibold">
                    <a href={branch.directionsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:underline">
                        <Share2 className="w-4 h-4" /> Cómo llegar
                    </a>
                    <a href={`tel:${branch.phone}`} className="flex items-center gap-2 text-primary-600 hover:underline">
                        <Phone className="w-4 h-4" /> Llamar
                    </a>
                </div>
            </div>
        </div>
    );
};

const LocationGrid: React.FC = () => {
    const { vehicles } = useVehicles();

    const branchesWithCounts = useMemo(() => {
        const counts: { [key: string]: number } = {};
        branchData.forEach(b => counts[b.city] = 0);

        vehicles.forEach(v => {
            v.sucursal?.forEach((s: string) => {
                if (counts.hasOwnProperty(s)) {
                    counts[s]++;
                }
            });
        });
        
        return branchData.map(branch => ({
            ...branch,
            autosCount: counts[branch.city] || 0,
        }));
    }, [vehicles]);

    return (
        <section className="backdrop-blur-md py-20 sm:py-24 lg:py-32 overflow-hidden">
            <div className="px-4 sm:px-6 lg:px-8 flex flex-col mb-4">
                <div className="order-1 max-w-7xl mx-auto">
                     <AnimatedHeader 
                        title={<>
                            <ShimmerSpan className="from-gray-600 via-gray-700 to-gray-900">Visita una de nuestras </ShimmerSpan>
                            {' '}
                            <ShimmerSpan className="from-red-500 via-amber-600 to-primary-600">4 sucursales</ShimmerSpan>
                        </>} 
                        subtitle="Con presencia en 3 estados, nuestras sucursales ofrecen todos los servicios de compra, venta y mantenimientos." 
                    />
                </div>
             </div>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {branchesWithCounts.map(branch => <LocationCard key={branch.city} branch={branch} />)}
            </div>
        </section>
    );
};

export default LocationGrid;
