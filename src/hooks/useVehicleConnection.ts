import { useState, useEffect } from 'react';
import type { Vehicle } from '../types/types';
import VehicleService from '../services/VehicleService';

export const useVehicleConnection = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [metrics, setMetrics] = useState({ totalVehicles: 0, uniqueMakes: 0 });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const { vehicles, totalCount } = await VehicleService.getAllVehicles();
                if (vehicles && vehicles.length > 0) {
                    setIsConnected(true);
                    setMetrics({
                        totalVehicles: totalCount,
                        uniqueMakes: new Set(vehicles.map((v: Vehicle) => v.marca)).size
                    });
                    setError(null);
                } else {
                    throw new Error("No vehicles found.");
                }
            } catch (err) {
                setIsConnected(false);
                setError("Failed to fetch from Vehicle Service.");
                console.error(err);
            }
        };
        checkConnection();
    }, []);

    return { isConnected, metrics, error };
};