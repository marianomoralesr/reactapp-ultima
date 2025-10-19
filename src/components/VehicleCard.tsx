
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Vehicle } from '../types/types';
import { useFavorites } from '../hooks/useFavorites';
import { useQueryClient } from '@tanstack/react-query';
import VehicleService from '../services/VehicleService';
import { getPlaceholderImage } from '../utils/formatters';

import ImageCarousel from './ImageCarousel'; // Import the new ImageCarousel
import VehicleCardHeader from './VehicleCard/VehicleCardHeader';
import VehicleCardSpecs from './VehicleCard/VehicleCardSpecs';
import VehicleCardPromotions from './VehicleCard/VehicleCardPromotions';
import VehicleCardPrice from './VehicleCard/VehicleCardPrice';
import VehicleCardActions from './VehicleCard/VehicleCardActions';
import PriceDropNotificationToggle from './PriceDropNotificationToggle';

interface VehicleCardProps {
  vehicle: Vehicle;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle }) => {
  const queryClient = useQueryClient();
  const [showFavoriteToast, setShowFavoriteToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const hasSlug = vehicle.slug && vehicle.slug.trim() !== '';
  const isSeparado = vehicle.separado === true;
  const favoriteStatus = isFavorite(vehicle.id);
  const whatsappUrl = vehicle.liga_boton_whatsapp || `https://wa.me/5218187049079?text=Hola,%20me%20interesa%20el%20${encodeURIComponent(vehicle.title)}`;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasFavorite = isFavorite(vehicle.id);
    await toggleFavorite(vehicle.id);
    setToastMessage(!wasFavorite ? 'Añadido a favoritos' : 'Eliminado de favoritos');
    setShowFavoriteToast(true);
    setTimeout(() => setShowFavoriteToast(false), 2000);
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

  return (
    <div 
      onMouseEnter={prefetchVehicle}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden group relative ${isSeparado ? 'opacity-70' : ''}`}
    >
      {showFavoriteToast && (
        <div className="absolute top-4 right-4 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full z-30 transition-all duration-300 animate-fade-in-out">
          {toastMessage}
        </div>
      )}
      <div className="flex flex-col md:flex-row bg-white">
        <div className="md:w-1/3 md:flex-shrink-0 relative">
          <ImageCarousel
            images={imagesForCarousel}
            alt={vehicle.title}
            isSeparado={isSeparado}
            garantia={vehicle.garantia}
            className="w-full h-60 md:h-full"
          />
        </div>

        <div className="flex-grow p-5 flex flex-col justify-between min-w-0">
          <div>
            <VehicleCardHeader title={vehicle.titulo} viewCount={vehicle.viewcount || 0} ordencompra={vehicle.ordencompra} />
            <VehicleCardSpecs
              sucursal={vehicle.ubicacion}
              kilometraje={vehicle.kilometraje}
              transmision={vehicle.transmision}
              combustible={vehicle.combustible}
            />
            <VehicleCardPromotions promociones={vehicle.promociones} />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-grow">
              <VehicleCardPrice
                precio={vehicle.precio}
                engancheMinimo={vehicle.enganchemin}
              />
              <PriceDropNotificationToggle vehicleId={vehicle.id} />
            </div>
            <VehicleCardActions
              isSeparado={isSeparado}
              ordencompra={vehicle.ordencompra}
              whatsappUrl={whatsappUrl}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favoriteStatus}
            />
          </div>
        </div>
      </div>
      
      {hasSlug && (
        <Link to={`/autos/${vehicle.slug}`} data-gtm-id="card-list-view-details" className="absolute inset-0 z-10">
          <span className="sr-only">Ver detalles de {vehicle.title}</span>
        </Link>
      )}
    </div>
  );
};

export default React.memo(VehicleCard);