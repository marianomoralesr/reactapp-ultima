import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { WordPressVehicle } from '../types/types';
import { Search, X, Loader2 } from 'lucide-react';
import LazyImage from './LazyImage';
import { formatPrice } from '../utils/formatters';
import { EyeIcon } from './icons';
import { useVehicles } from '../context/VehicleContext';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

interface VehicleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (vehicle: WordPressVehicle) => void;
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { vehicles: allVehicles, isLoading } = useVehicles();

  const availableVehicles = useMemo(() => {
    return allVehicles.filter(v => !v.separado && !v.vendido);
  }, [allVehicles]);

  const filteredVehicles = useMemo(() => {
    if (!searchQuery) return availableVehicles;
    const lowercasedQuery = searchQuery.toLowerCase();
    return availableVehicles.filter(vehicle =>
      vehicle.titulo.toLowerCase().includes(lowercasedQuery) ||
      vehicle.marca.toLowerCase().includes(lowercasedQuery) ||
      String(vehicle.autoano).includes(lowercasedQuery)
    );
  }, [availableVehicles, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Selecciona un Vehículo</h2>
              <p className="text-sm text-gray-500 mt-1">Busca en nuestro inventario para iniciar tu solicitud.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
          <div className="relative mt-4">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Buscar por marca, modelo o año..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="block w-full rounded-lg border-gray-300 bg-gray-50 py-2.5 pl-10 pr-4 text-gray-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <p className="mt-2">Cargando inventario...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <p>No se encontraron vehículos.</p>
            </div>
          ) : (
            <div className="space-y-3">
            {filteredVehicles.map(vehicle => {
              const imageSrc = vehicle.thumbnail_webp || vehicle.thumbnail || vehicle.feature_image_webp || vehicle.feature_image || DEFAULT_PLACEHOLDER_IMAGE;
              return (
                // FIX: Corrected property access from `ligawp` to `slug`
                <div
                  key={vehicle.slug}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                >
                  <button onClick={() => onSelect(vehicle)} className="flex-grow flex items-center gap-4 text-left">
                    <LazyImage src={imageSrc} alt={vehicle.titulo} className="w-24 h-20 rounded-md flex-shrink-0 border border-gray-200" />
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-800 truncate" title={vehicle.titulo}>{vehicle.titulo}</p>
                      {/* FIX: Corrected property name from 'autoprecio' to 'precio' */}
                      <p className="text-sm text-gray-600">{formatPrice(vehicle.precio)}</p>
                    </div>
                  </button>
                  <Link
                    // FIX: Corrected property access from `ligawp` to `slug`
                    to={`/autos/${vehicle.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0 p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                    aria-label={`Ver detalles de ${vehicle.titulo} en una nueva pestaña`}
                  >
                    <EyeIcon className="w-5 h-5" />
                  </Link>
                </div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleSelector;