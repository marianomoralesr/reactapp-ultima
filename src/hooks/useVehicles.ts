import { useQuery } from '@tanstack/react-query';
import VehicleService from '../services/VehicleService';
import type { Vehicle } from '../types/types';

export const useVehicles = () => {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<{ vehicles: Vehicle[], totalCount: number }, Error>({
    queryKey: ['autos'],
    queryFn: () => VehicleService.getAllVehicles(), // ✓ Arrow function preserves context
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  return {
    vehicles: data?.vehicles || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refetch,
  };
};
