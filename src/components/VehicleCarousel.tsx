import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useVehicles } from '../context/VehicleContext';
import InventorySliderCard from './InventorySliderCard';
import { Car } from 'lucide-react';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

interface VehicleCarouselProps {
    userBudget?: number;
    isBankProfileComplete: boolean;
}

const VehicleCarousel: React.FC<VehicleCarouselProps> = ({ userBudget, isBankProfileComplete }) => {
    const { vehicles: allVehicles, isLoading } = useVehicles();
    const sliderRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const recommendedVehicles = useMemo(() => {
        if (!allVehicles) return [];
        let filteredVehicles = allVehicles;
        if (userBudget) {
            filteredVehicles = filteredVehicles.filter(v => v.precio <= userBudget * 1.1);
        }
        return filteredVehicles.sort(() => 0.5 - Math.random()).slice(0, 10);
    }, [allVehicles, userBudget]);
    
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
    }, [recommendedVehicles, handleScroll]);

    const scroll = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = sliderRef.current.clientWidth * 0.75;
            sliderRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    if (isLoading) {
        return <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-64 flex items-center justify-center">Cargando vehículos recomendados...</div>;
    }

    if (!isBankProfileComplete) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center h-40">
                <p className="text-lg text-gray-600 text-center">Aquí aparecerán recomendaciones una vez que completes tu perfilamiento bancario.</p>
            </div>
        );
    }

    if (recommendedVehicles.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
                 <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Car className="w-5 h-5 mr-2 text-primary-600"/>
                    Vehículos recomendados para ti
                 </h3>
            </div>
            <div className="relative">
                <div 
                    ref={sliderRef}
                    className="flex gap-4 overflow-x-auto pb-4 px-6 snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {recommendedVehicles.map(vehicle => (
                         <div key={vehicle.id} className="snap-start flex-shrink-0 w-60">
                            <InventorySliderCard vehicle={vehicle} />
                         </div>
                    ))}
                </div>
                 {/* Navigation Buttons */}
                <button
                    onClick={() => scroll('left')}
                    disabled={!canScrollLeft}
                    className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 pointer-events-auto bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all disabled:opacity-0 disabled:scale-90`}
                    aria-label="Anterior"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <button
                    onClick={() => scroll('right')}
                    disabled={!canScrollRight}
                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 pointer-events-auto bg-white/80 backdrop-blur-sm text-gray-800 p-2 rounded-full shadow-lg hover:bg-white transition-all disabled:opacity-0 disabled:scale-90`}
                    aria-label="Siguiente"
                >
                    <ChevronRightIcon className="w-6 h-6" />
                </button>
                 <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>
            </div>
        </div>
    );
};

export default VehicleCarousel;