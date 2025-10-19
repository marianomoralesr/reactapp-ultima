

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types/types';
import { HeartIcon, TagIcon, ShieldCheckIcon, FuelIcon, GaugeIcon, CogIcon } from './icons';
import ImageCarousel from './ImageCarousel'; // Import the new ImageCarousel
import { useFavorites } from '../hooks/useFavorites';
import { useQueryClient } from '@tanstack/react-query';
import VehicleService from '../services/VehicleService';
import { formatPrice, formatPromotion, getPromotionStyles, formatMileage, getPlaceholderImage } from '../utils/formatters';

interface VehicleGridCardProps {
  vehicle: Vehicle;
}

const SpecTag: React.FC<{ children: React.ReactNode, icon?: React.ElementType }> = ({ children, icon: Icon }) => (
    <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {children}
    </span>
);

const VehicleGridCard: React.FC<VehicleGridCardProps> = ({ vehicle }) => {
  const queryClient = useQueryClient();
  const hasSlug = vehicle.slug && vehicle.slug.trim() !== '';
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(vehicle.id);
  const isSeparado = vehicle.separado === true;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(vehicle.id);
  };

  const prefetchVehicle = () => {
    if (hasSlug) {
      queryClient.prefetchQuery({
        queryKey: ['vehicle', vehicle.slug],
        queryFn: () => VehicleService.getVehicleBySlug(vehicle.slug),
      });
    }
  };

  const imagesForCarousel = useMemo(() => {
    const mainImage = vehicle.feature_image?.[0] || getPlaceholderImage(vehicle);
    const imageUrls = [
      mainImage,
      ...(vehicle.fotos_exterior_url || []),
      ...(vehicle.galeria_exterior || []),
    ];
    // Deduplicate and filter out any falsy values
    return [...new Set(imageUrls.filter(Boolean))];
  }, [vehicle]);

  const CardContent = (
    <div 
      onMouseEnter={prefetchVehicle}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col relative ${isSeparado ? 'opacity-70' : ''}`}
    >
        <div className="block relative">
            <ImageCarousel
              images={imagesForCarousel}
              alt={vehicle.titulo}
              isSeparado={isSeparado}
              garantia={vehicle.garantia}
              className="aspect-[4/3]"
            />
            {isSeparado && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none">
                    <span className="bg-gray-900 text-white text-sm font-bold py-1.5 px-4 rounded-md shadow-lg tracking-wider">SEPARADO</span>
                </div>
            )}
            <div className="absolute top-3 right-3 z-20">
                 <button
                    onClick={handleToggleFavorite}
                    data-gtm-id="card-grid-favorite"
                    className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:text-red-400 transition-colors"
                    aria-label={favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                 >
                     <HeartIcon className={`w-6 h-6 ${favorite ? 'text-red-500 fill-current' : ''}`} />
                 </button>
            </div>
            <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                {vehicle.kilometraje > 0 && <SpecTag icon={GaugeIcon}>{formatMileage(vehicle.kilometraje)}</SpecTag>}
                {vehicle.combustible && <SpecTag icon={FuelIcon}>{vehicle.combustible}</SpecTag>}
                {vehicle.transmision && <SpecTag icon={CogIcon}>{vehicle.transmision}</SpecTag>}
            </div>
        </div>

        <div className="p-4 flex flex-col flex-grow">
            <div>
                {vehicle.ubicacion?.length > 0 && (
                    <p className="text-xs font-light text-gray-500 mb-1 tracking-wider">{vehicle.ubicacion.join(', ')}</p>
                )}
                <h3 className="font-bold text-gray-800 group-hover:text-primary-600 transition-colors truncate" title={vehicle.titulo}>
                    {vehicle.titulo}
                </h3>
            </div>
            
            {vehicle.promociones && vehicle.promociones.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {vehicle.promociones.slice(0, 2).map((promo, index) => {
                       const styleClasses = getPromotionStyles(promo);
                       const formattedPromo = formatPromotion(promo);
                       if (!formattedPromo) return null;

                       return (
                           <span key={index} className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${styleClasses}`}>
                               <TagIcon className="w-3 h-3" />
                               {formattedPromo}
                           </span>
                       );
                    })}
                </div>
            )}

            <div className="mt-auto pt-3">
                <p className="text-lg font-bold text-gray-900">
                    {formatPrice(vehicle.precio)}
                </p>
                {vehicle.enganchemin > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">
                        Enganche desde {formatPrice(vehicle.enganchemin)}
                    </p>
                )}
            </div>
        </div>

        {hasSlug && (
          <Link to={`/autos/${vehicle.slug}`} data-gtm-id="card-grid-view-details" className="absolute inset-0 z-10">
            <span className="sr-only">Ver detalles de {vehicle.title}</span>
          </Link>
        )}
    </div>
  );

  return <div className="h-full">{CardContent}</div>
};

export default React.memo(VehicleGridCard);