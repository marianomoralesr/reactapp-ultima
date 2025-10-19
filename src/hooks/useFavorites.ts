import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../context/AuthContext';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchFavorites = async () => {
            setIsLoading(true);
            if (user) {
                const { data, error } = await supabase
                    .from('user_favorites')
                    .select('vehicle_id')
                    .eq('user_id', user.id);
                
                if (error) {
                    console.error('Error fetching favorites:', error);
                    setFavorites([]);
                } else {
                    setFavorites(data.map(fav => fav.vehicle_id));
                }
            } else {
                // User is logged out, clear local favorites
                setFavorites([]);
            }
            setIsLoading(false);
        };

        fetchFavorites();
    }, [user?.id]);

    const isFavorite = useCallback((vehicleId: number): boolean => {
        return favorites.includes(vehicleId);
    }, [favorites]);

    const toggleFavorite = useCallback(async (vehicleId: number) => {
        if (!user) {
            // If the user is not logged in, prompt them to log in.
            // Save the current page to redirect back after login.
            localStorage.setItem('loginRedirect', location.pathname + location.search);
            navigate('/acceder');
            return;
        }

        const isCurrentlyFavorite = favorites.includes(vehicleId);

        if (isCurrentlyFavorite) {
            // Optimistically update UI
            setFavorites(prev => prev.filter(id => id !== vehicleId));
            
            const { error } = await supabase
                .from('user_favorites')
                .delete()
                .match({ user_id: user.id, vehicle_id: vehicleId });

            if (error) {
                console.error('Error removing favorite:', error);
                // Revert UI change on error
                setFavorites(prev => [...prev, vehicleId]);
            }
        } else {
            // Optimistically update UI
            setFavorites(prev => [...prev, vehicleId]);

            const { error } = await supabase
                .from('user_favorites')
                .insert({ user_id: user.id, vehicle_id: vehicleId });

            if (error) {
                console.error('Error adding favorite:', error);
                // Revert UI change on error
                setFavorites(prev => prev.filter(id => id !== vehicleId));
            }
        }
    }, [favorites, user, navigate, location]);

    return { favorites, isFavorite, toggleFavorite, isLoading };
};