import React, { useState, useEffect } from 'react';
import type { WordPressVehicle } from '../types/types';
import { Link } from 'react-router-dom';
import { formatPrice, getPlaceholderImage } from '../utils/formatters';
import { useVehicles } from '../context/VehicleContext';

const HeroVehicleCard: React.FC<{ vehicle: WordPressVehicle }> = ({ vehicle }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const imageSrc = vehicle.feature_image || vehicle.thumbnail_webp || vehicle.thumbnail || vehicle.feature_image_webp || getPlaceholderImage(vehicle);

    return (
        <div className="relative h-full">
            <div className="h-full bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
                <div className="relative aspect-[4/3] bg-gray-200">
                    <img 
                        src={imageSrc} 
                        alt={vehicle.titulo} 
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                    />
                </div>
                <div className="p-3">
                    {vehicle.ordencompra && (
                        <p className="text-xs font-light text-gray-500 mb-1 tracking-wider">{vehicle.ordencompra}</p>
                    )}
                    <h3 className="text-gray-800 font-bold text-sm truncate transition-colors group-hover:text-primary-600" title={vehicle.titulo}>
                        {vehicle.titulo}
                    </h3>
                    <p className="text-gray-900 font-semibold text-base mt-1">{formatPrice(vehicle.precio)}</p>
                </div>
            </div>
            <Link to={`/autos/${vehicle.slug}`} className="absolute inset-0 z-10">
                <span className="sr-only">Ver detalles de {vehicle.titulo}</span>
            </Link>
        </div>
    );
};

const HeroVehicleSlider: React.FC = () => {
    const { vehicles, isLoading } = useVehicles();
    const [displayVehicles, setDisplayVehicles] = useState<WordPressVehicle[]>([]);

    useEffect(() => {
        if (vehicles.length > 0) {
            const available = vehicles.filter(v =>
                !v.separado &&
                !v.vendido &&
                (v.feature_image || v.thumbnail || v.feature_image_webp || v.thumbnail_webp)
            );
            setDisplayVehicles(available.sort(() => 0.5 - Math.random()).slice(0, 8)); // Fetch 8 cars
        }
    }, [vehicles]);
    
    if (isLoading) {
        return <div className="mt-12 h-64 w-full bg-gray-200/50 rounded-xl animate-pulse"></div>;
    }
    
    if (displayVehicles.length === 0) return null;

    return (
        <div className="relative w-full max-w-screen-xl mx-auto mt-16 animate-fade-in-up animation-delay-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6">
                {displayVehicles.map(vehicle => (
                    <HeroVehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
            </div>
        </div>
    );
};

export default HeroVehicleSlider;
