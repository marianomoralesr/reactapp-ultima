
import React from 'react';
import { Link } from 'react-router-dom';
import type { WordPressVehicle } from '../types/types';
import { formatPrice } from '../utils/formatters';
import LazyImage from './LazyImage';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

interface HeroVehicleCardProps {
  vehicle: WordPressVehicle;
}

const HeroVehicleCard: React.FC<HeroVehicleCardProps> = ({ vehicle }) => {
    const imageSrc = vehicle.feature_image || vehicle.thumbnail || vehicle.feature_image_url || DEFAULT_PLACEHOLDER_IMAGE;

    return (
        <div className="relative h-full group">
            <div className="h-full bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
                <div className="relative aspect-video bg-white flex-grow">
                    <LazyImage 
                        src={imageSrc} 
                        alt={vehicle.titulo}
                        className="align-center h-full w-full"
                        objectFit="cover"
                    />
                     {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                        <h3 className="text-white font-bold text-sm truncate drop-shadow-md" title={vehicle.titulo}>
                            {vehicle.titulo}
                        </h3>
                        <p className="text-primary-400 font-semibold text-base drop-shadow-md">{formatPrice(vehicle.precio)}</p>
                    </div>
                </div>
            </div>
            <Link to={`/autos/${vehicle.slug}`} className="absolute inset-0 z-10" aria-label={`Ver detalles de ${vehicle.titulo}`}>
                <span className="sr-only">Ver detalles de ${vehicle.titulo}</span>
            </Link>
        </div>
    );
};

export default HeroVehicleCard;