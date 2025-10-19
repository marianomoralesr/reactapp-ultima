import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { WordPressVehicle } from '../types/types';
import { useVehicles } from '../context/VehicleContext';
import InventorySliderCard from './InventorySliderCard';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const InventorySlider: React.FC = () => {
    const { vehicles: allVehicles, isLoading: vehiclesLoading } = useVehicles();
    const [vehicles, setVehicles] = useState<WordPressVehicle[]>([]);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const availableVehicles = useMemo(() =>
        allVehicles.filter(v => !v.separado && !v.vendido),
    [allVehicles]);

    useEffect(() => {
        if (availableVehicles.length > 0) {
            const shuffled = [...availableVehicles].sort(() => 0.5 - Math.random());
            setVehicles(shuffled.slice(0, 12));
        }
    }, [availableVehicles]);

    const handleScroll = useCallback(() => {
        if (sliderRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    useEffect(() => {
        const slider = sliderRef.current;
        if (slider) {
            handleScroll(); // Initial check
            slider.addEventListener('scroll', handleScroll, { passive: true });
            return () => slider.removeEventListener('scroll', handleScroll);
        }
    }, [vehicles, handleScroll]);

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.clientWidth * 0.8;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (vehiclesLoading) {
        return <div className="h-96 w-full bg-gray-100 rounded-xl animate-pulse"></div>;
    }

    if (vehicles.length === 0) return null;

    return (
        <div className="relative">
            <div
                ref={sliderRef}
                className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="snap-start flex-shrink-0 w-72">
                        <InventorySliderCard vehicle={vehicle} />
                    </div>
                ))}
            </div>
            <button
                onClick={() => scroll('left')}
                disabled={!canScrollLeft}
                className="absolute left-0 lg:left-2 top-1/2 -translate-y-1/2 z-10 bg-white/50 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white/80 transition-all disabled:opacity-0 disabled:scale-90"
                aria-label="Anterior"
            >
                <ChevronLeftIcon className="w-8 h-8" />
            </button>
            <button
                onClick={() => scroll('right')}
                disabled={!canScrollRight}
                className="absolute right-0 lg:right-2 top-1/2 -translate-y-1/2 z-10 bg-white/50 backdrop-blur-sm text-gray-800 p-3 rounded-full shadow-lg hover:bg-white/80 transition-all disabled:opacity-0 disabled:scale-90"
                aria-label="Siguiente"
            >
                <ChevronRightIcon className="w-8 h-8" />
            </button>
            <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
        </div>
    );
};

export default InventorySlider;