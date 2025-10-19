import React, { useState, useEffect, useMemo } from 'react';
import type { WordPressVehicle } from '../types/types';
import VehicleGridCard from './VehicleGridCard';
import { EyeIcon } from './icons';
import { useVehicles } from '../context/VehicleContext';

interface RecentlyViewedProps {
  currentVehicleId?: number;
  layout?: 'grid' | 'carousel';
}

const RECENTLY_VIEWED_KEY = 'trefa_recently_viewed';

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ currentVehicleId, layout = 'carousel' }) => {
  const { vehicles: allVehicles } = useVehicles();
  const [viewedVehicles, setViewedVehicles] = useState<WordPressVehicle[]>([]);

  const vehiclesMap = useMemo(() =>
    new Map(allVehicles.map(v => [v.id, v])),
  [allVehicles]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
        try {
            const rawData = localStorage.getItem(RECENTLY_VIEWED_KEY);
            if (!rawData) return;

            const viewedIds: number[] = JSON.parse(rawData);
            if (viewedIds.length === 0) return;

            const recentVehicles = viewedIds
              .map(id => vehiclesMap.get(id))
              .filter((v): v is WordPressVehicle => Boolean(v))
              .filter(v => v.id !== currentVehicleId);

            setViewedVehicles(recentVehicles.slice(0, 10)); // show up to 10
        } catch (error) {
          console.error("Failed to load recently viewed vehicles:", error);
        }
    };
    loadRecentlyViewed();
  }, [currentVehicleId, vehiclesMap]);

  if (viewedVehicles.length === 0) {
    return null;
  }
  
  const CarouselLayout = () => (
      <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory">
              {viewedVehicles.map(vehicle => (
                  <div key={vehicle.id} className="snap-start flex-shrink-0 w-11/12 sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
                      <VehicleGridCard vehicle={vehicle} />
                  </div>
              ))}
          </div>
          <style>{`
            .overflow-x-auto::-webkit-scrollbar { height: 8px; }
            .overflow-x-auto::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
            .overflow-x-auto::-webkit-scrollbar-thumb { background: #ccc; border-radius: 10px; }
            .overflow-x-auto::-webkit-scrollbar-thumb:hover { background: #b3b3b3; }
            /* For Firefox */
            .overflow-x-auto { scrollbar-width: thin; scrollbar-color: #ccc #f1f1f1; }
          `}</style>
      </div>
  );
  
  const GridLayout = () => (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {viewedVehicles.map(vehicle => (
                <VehicleGridCard key={vehicle.id} vehicle={vehicle} />
            ))}
        </div>
  );

  return (
    <div className="mt-16">
      <div className="flex items-center mb-6">
        <EyeIcon className="w-7 h-7 text-gray-500 mr-3" />
        <h2 className="text-2xl font-bold text-gray-800">Vistos Recientemente</h2>
      </div>
      {layout === 'carousel' ? <CarouselLayout /> : <GridLayout />}
    </div>
  );
};

export default React.memo(RecentlyViewed);