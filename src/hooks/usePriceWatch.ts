import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PriceWatchService } from '../services/PriceWatchService';

export const usePriceWatch = () => {
    const [watchedVehicles, setWatchedVehicles] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchWatches = async () => {
            if (user) {
                setIsLoading(true);
                const watches = await PriceWatchService.getWatchesForUser(user.id);
                setWatchedVehicles(watches);
                setIsLoading(false);
            } else {
                setWatchedVehicles([]);
                setIsLoading(false);
            }
        };
        fetchWatches();
    }, [user?.id]);

    const isWatched = useCallback((vehicleId: number): boolean => {
        return watchedVehicles.includes(vehicleId);
    }, [watchedVehicles]);

    const toggleWatch = useCallback(async (vehicleId: number) => {
        if (!user) {
            localStorage.setItem('loginRedirect', location.pathname + location.search);
            navigate('/acceder');
            return;
        }

        const isCurrentlyWatched = watchedVehicles.includes(vehicleId);

        if (isCurrentlyWatched) {
            setWatchedVehicles(prev => prev.filter(id => id !== vehicleId));
            await PriceWatchService.removeWatch(user.id, vehicleId).catch(() => {
                // Revert on error
                setWatchedVehicles(prev => [...prev, vehicleId]);
            });
        } else {
            setWatchedVehicles(prev => [...prev, vehicleId]);
            await PriceWatchService.addWatch(user.id, vehicleId).catch(() => {
                // Revert on error
                setWatchedVehicles(prev => prev.filter(id => id !== vehicleId));
            });
        }
    }, [watchedVehicles, user, navigate, location]);

    return { isWatched, toggleWatch, isLoading };
};