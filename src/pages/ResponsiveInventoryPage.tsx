import React, { useState, useMemo, useRef } from 'react';
import { useVehicles } from '../context/VehicleContext';
import type { WordPressVehicle } from '../types/types';
import { Loader2 as Loader2Icon, ChevronUp } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { formatPrice, formatMileage } from '../utils/formatters';
import CarSwiper from '../components/CarSwiper';
import { Car as CarIcon, Heart, X } from 'lucide-react';
import { motion } from 'framer-motion';

type Direction = "left" | "right" | "up" | "down";

interface SwiperControls {
    triggerSwipe: (dir: Direction) => void;
    undo: () => void;
}

const ResponsiveInventoryPage: React.FC = () => {
    const { vehicles: allVehicles, isLoading } = useVehicles();
    const { isFavorite, toggleFavorite } = useFavorites();
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [currentCar, setCurrentCar] = useState<WordPressVehicle | null>(null);
    const carSwiperRef = useRef<SwiperControls>(null);

    const categories = useMemo(() => {
        if (!allVehicles || allVehicles.length === 0) return ['All'];
        const extractedCategories = [...new Set(allVehicles.flatMap(v => v.clasificacionid || []).filter(Boolean))];
        const priority = ['SUV', 'Sedán', 'Pick Up', 'Hatchback'];
        extractedCategories.sort((a, b) => {
            const aPrio = priority.indexOf(a);
            const bPrio = priority.indexOf(b);
            if (aPrio > -1 && bPrio > -1) return aPrio - bPrio;
            if (aPrio > -1) return -1;
            if (bPrio > -1) return 1;
            return a.localeCompare(b);
        });
        return ['All', ...extractedCategories];
    }, [allVehicles]);

    const sortedAndFilteredVehicles = useMemo(() => {
        const currentCategory = categories[currentCategoryIndex];
        // Show all vehicles since they're already filtered by ordenstatus='Comprado' in the backend
        const available = allVehicles;

        const filtered = currentCategory === 'All'
            ? available
            : available.filter(v => v.clasificacionid?.includes(currentCategory));

        return filtered.sort((a, b) => (isFavorite(b.id) ? 1 : 0) - (isFavorite(a.id) ? 1 : 0) || Math.random() - 0.5);
    }, [allVehicles, isFavorite, currentCategoryIndex, categories]);

    const handleSwipe = (car: WordPressVehicle, direction: Direction) => {
        if (direction === 'down') {
            toggleFavorite(car.id);
        } else if (direction === 'up') {
            setCurrentCategoryIndex(prev => (prev + 1) % categories.length);
        }
    };
    
    if (isLoading) return <div className="h-full w-full flex items-center justify-center"><Loader2Icon className="w-12 h-12 animate-spin text-primary-500" /></div>;

    if (sortedAndFilteredVehicles.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-center p-4">
                <CarIcon className="w-12 h-12 text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-700">No se encontraron vehículos</h2>
                <p className="text-gray-500 mt-2">Intenta ajustar los filtros o revisa más tarde.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <div className="w-full px-4 pt-4 text-center">
                <CarIcon className="w-8 h-8 mx-auto text-primary-500" />
                <h1 className="text-2xl font-bold text-gray-800">Explorar Inventario</h1>
                <p className="text-sm text-gray-500">Desliza para descubrir tu próximo auto.</p>
            </div>
            
            <div className="flex-grow min-h-0 flex flex-col">
                <CarSwiper ref={carSwiperRef} cars={sortedAndFilteredVehicles} onSwipe={handleSwipe} onTopCardChange={setCurrentCar}>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold">No hay más autos en esta categoría</h3>
                        <button onClick={() => setCurrentCategoryIndex(0)} className="mt-2 text-sm text-primary-600 font-semibold">Ver todas las categorías</button>
                    </div>
                </CarSwiper>

                {currentCar && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 text-center">
                        <h2 className="text-xl font-bold truncate">{currentCar.titulo}</h2>
                        <p className="text-lg font-semibold text-primary-600">{formatPrice(currentCar.autoprecio)}</p>
                        <p className="text-sm text-gray-500">{formatMileage(currentCar.autokilometraje)} &bull; {currentCar.autotransmision}</p>
                    </motion.div>
                )}

                <div className="flex items-center justify-center gap-4 p-4">
                    <button onClick={() => carSwiperRef.current?.triggerSwipe('left')} className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 border"><X className="w-8 h-8" /></button>
                    <button onClick={() => carSwiperRef.current?.triggerSwipe('up')} className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-blue-500 border"><ChevronUp className="w-10 h-10" /></button>
                    <button onClick={() => carSwiperRef.current?.triggerSwipe('down')} className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-red-500 border"><Heart className="w-8 h-8" /></button>
                </div>
            </div>
        </div>
    );
};

export default ResponsiveInventoryPage;
