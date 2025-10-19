import React from 'react';
import { Link } from 'react-router-dom';
import type { WordPressVehicle } from '../types/types';
import { formatPrice } from '../utils/formatters';
import { UsersIcon, CheckCircleIcon, StarIcon } from './icons';
import LazyImage from './LazyImage';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';
import { Cog } from 'lucide-react';

interface VehicleListCardBProps {
  vehicle: WordPressVehicle;
}

const VehicleListCardB: React.FC<VehicleListCardBProps> = ({ vehicle }) => {
  const imageSrc = vehicle.thumbnail || vehicle.feature_image || DEFAULT_PLACEHOLDER_IMAGE;

  const Feature: React.FC<{ icon: React.ElementType, text: string }> = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 text-gray-600">
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{text}</span>
    </div>
  );

  return (
    <Link to={`/autos-b/${vehicle.slug}`} className="block bg-white p-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200/80 group">
      <div className="flex flex-col sm:flex-row gap-5">
        <div className="flex-shrink-0 w-full sm:w-48">
          <LazyImage src={imageSrc} alt={vehicle.titulo} className="w-full h-40 sm:h-full rounded-lg" />
        </div>

        <div className="flex-grow flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 group-hover:text-primary-600 transition-colors">{vehicle.titulo}</h2>
            <p className="text-sm text-gray-500 mt-1">Garasi Cak Su • 3.1 km from centre</p>

            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              <Feature icon={UsersIcon} text="7 seats" />
              <Feature icon={Cog} text={vehicle.transmision} />
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-200">
             <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold">
                <CheckCircleIcon className="w-5 h-5" />
                <span>Free cancellation</span>
            </div>
            <div className="text-gray-400">•</div>
            <div className="flex items-center gap-1 text-sm">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-gray-800">4.0</span>
                <span className="text-gray-500">(180 reviews)</span>
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 text-right flex flex-col justify-between items-end sm:border-l sm:pl-5 border-gray-200">
           <div>
             <p className="text-sm text-gray-500">Basic price from</p>
             <p className="text-2xl font-extrabold text-gray-900">{formatPrice(vehicle.precio)}</p>
             <p className="text-sm text-gray-500">/ total</p>
           </div>
           <div className="mt-4 sm:mt-0 w-full sm:w-auto">
             <span className="block w-full text-center bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg group-hover:bg-primary-700 transition-colors">
                View Details
             </span>
           </div>
        </div>
      </div>
    </Link>
  );
};

export default VehicleListCardB;