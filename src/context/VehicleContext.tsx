import React, { createContext, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import VehicleService from '../services/VehicleService';
import type { Vehicle } from '../types/types';
import { useFilters } from './FilterContext';

interface VehicleContextType {
  vehicles: Vehicle[];
  totalCount: number;
  isLoading: boolean;
  error: Error | null;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const VehicleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { filters } = useFilters();
  const {
    data,
    isLoading,
    error,
  } = useQuery<{ vehicles: Vehicle[], totalCount: number }, Error>({
    queryKey: ['vehicles', filters],
    queryFn: () => VehicleService.getAllVehicles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });

  const contextValue = useMemo(() => ({
    vehicles: data?.vehicles || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error: error || null,
  }), [data, isLoading, error]);

  return (
    <VehicleContext.Provider value={contextValue}>
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};
