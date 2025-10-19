

import React, { useMemo } from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { useVehicles } from '../context/VehicleContext';
import type { WordPressVehicle } from '../types/types';
import VehicleCard from '../components/VehicleCard';
import { HeartIcon } from '../components/icons';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

const FavoritesPage: React.FC = () => {
  useSEO({
    title: 'Mis Autos Favoritos | TREFA',
    description: 'Consulta los autos seminuevos que has guardado como favoritos. Compara tus opciones y da el siguiente paso para estrenar tu próximo auto.',
    keywords: 'autos favoritos, seminuevos guardados, comparar autos, trefa'
  });

  const { favorites, isLoading: favoritesLoading } = useFavorites();
  const { vehicles: allVehicles, isLoading: vehiclesLoading } = useVehicles();

  const favoriteVehicles = useMemo(() => {
    if (!favorites || favorites.length === 0 || !allVehicles || allVehicles.length === 0) {
      return [];
    }
    const vehiclesMap = new Map(allVehicles.map(v => [v.id, v]));
    return favorites
      .map(id => vehiclesMap.get(id))
      .filter((v): v is WordPressVehicle => Boolean(v));
  }, [favorites, allVehicles]);

  const isLoading = favoritesLoading || vehiclesLoading;

  const renderSkeletons = () => (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl shadow-sm animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-48 bg-gray-200 rounded-lg md:col-span-1"></div>
            <div className="md:col-span-2 space-y-4 pt-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
        <p className="text-gray-600 mt-1">
          Aquí encontrarás todos los autos que has guardado para verlos más tarde.
        </p>
      </div>
      
      {isLoading ? (
        renderSkeletons()
      ) : favoriteVehicles.length > 0 ? (
        <div className="space-y-6">
          {favoriteVehicles.map(vehicle => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-sm border">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto" />
          <h3 className="mt-4 text-xl font-semibold text-gray-800">Aún no tienes favoritos</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Explora nuestro inventario y presiona el ícono del corazón para guardar los autos que más te gusten.
          </p>
          <Link
            to="/autos"
            className="mt-6 inline-block bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors shadow-md"
          >
            Ver Inventario
          </Link>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;