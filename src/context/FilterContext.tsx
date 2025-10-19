import React, { createContext, useContext } from 'react';
import { useVehicleFilters } from '../hooks/useVehicleFilters';
import type { VehicleFilters } from '../types/types';

interface FilterContextType {
  filters: VehicleFilters;
  handleFiltersChange: (newFilters: Partial<VehicleFilters>) => void;
  onRemoveFilter: (key: keyof VehicleFilters, value?: string | number | boolean) => void;
  handleClearFilters: () => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    filters,
    handleFiltersChange,
    onRemoveFilter,
    handleClearFilters,
  } = useVehicleFilters();

  return (
    <FilterContext.Provider
      value={{
        filters,
        handleFiltersChange,
        onRemoveFilter,
        handleClearFilters,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};
