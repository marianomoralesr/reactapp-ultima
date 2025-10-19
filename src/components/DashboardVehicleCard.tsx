import React from 'react';
import { Link } from 'react-router-dom';
import type { WordPressVehicle } from '../types/types';
import LazyImage from './LazyImage';
import { formatPrice } from '../utils/formatters';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

interface DashboardVehicleCardProps {
  vehicle: WordPressVehicle;
}

const DashboardVehicleCard: React.FC<DashboardVehicleCardProps> = ({ vehicle }) => {
  // Prioritize the optimized `thumbnail_webp` field for card views.
  const imageSrc = vehicle.thumbnail_webp || vehicle.thumbnail || vehicle.feature_image_webp || vehicle.feature_image || DEFAULT_PLACEHOLDER_IMAGE;
  const hasSlug = vehicle.slug && vehicle.slug.trim() !== '';

  const CardContent = () => (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-md overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative aspect-[4/3] bg-gray-100">
        <LazyImage 
          src={imageSrc} 
          alt={vehicle.titulo} 
          className="w-full h-full"
        />
      </div>
      <div className="p-4 flex-shrink-0">
        <h3 className="text-gray-800 font-bold text-base truncate transition-colors group-hover:text-primary-600" title={vehicle.titulo}>
          {vehicle.titulo}
        </h3>
        <p className="text-gray-700 font-semibold text-lg mt-1">{formatPrice(vehicle.precio)}</p>
      </div>
    </div>
  );

  return hasSlug ? (
    <Link to={`/autos/${vehicle.slug}`} aria-label={`Ver detalles de ${vehicle.titulo}`} className="contents">
        <CardContent />
    </Link>
  ) : (
    <div className="contents">
        <CardContent />
    </div>
  );
};

export default DashboardVehicleCard;