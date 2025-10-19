import { useState, useCallback } from 'react';
import type { VehicleFilters } from '../types/types';

const initialFilterState: VehicleFilters = {};

export const useVehicleFilters = (initialFilters: VehicleFilters = {}) => {
    const [filters, setFilters] = useState<VehicleFilters>({
        ...initialFilterState,
        ...initialFilters
    });

    const handleFiltersChange = useCallback((newFilters: Partial<VehicleFilters>) => {
        setFilters(prev => {
            const updatedFilters = { ...prev, ...newFilters };
            return updatedFilters;
        });
    }, []);

    const onRemoveFilter = useCallback((key: keyof VehicleFilters, value?: string | number | boolean) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            const currentValue = newFilters[key];

            if (Array.isArray(currentValue)) {
                const updatedArray = currentValue.filter(v => v !== value);
                if (updatedArray.length > 0) {
                    (newFilters[key] as any) = updatedArray;
                } else {
                    // If the array is empty, remove the key entirely
                    delete newFilters[key];
                }
            } else {
                // For non-array filters, just remove the key
                delete newFilters[key];
            }
            
            return newFilters;
        });
    }, []);

    const handleClearFilters = useCallback(() => {
        setFilters(initialFilterState);
    }, []);

    return {
        filters,
        setFilters,
        handleFiltersChange,
        onRemoveFilter,
        handleClearFilters,
    };
};
