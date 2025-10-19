


import React, { useState, useEffect, useMemo } from 'react';
import { useVehicles } from '../context/VehicleContext';
import VehicleGridCard from '../components/VehicleGridCard';
import { Tag, AlertTriangle } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { formatPromotion, getPromotionStyles } from '../utils/formatters';

const PromotionsPage: React.FC = () => {
    useSEO({
        title: 'Promociones y Ofertas en Autos Seminuevos | TREFA',
        description: 'Descubre las mejores promociones en autos seminuevos. Encuentra autos con bonos de descuento, tanque de gasolina lleno y más beneficios exclusivos.',
        keywords: 'promociones autos, ofertas seminuevos, bonos de descuento, trefa, autos en oferta'
    });

    const { vehicles: allVehicles, isLoading } = useVehicles();
    const [error] = useState<string | null>(null);

    const allPromotions = useMemo(() => {
        const promoMap = new Map<string, string>(); // formatted -> raw
        allVehicles.forEach(v => {
            v.promociones?.forEach(p => {
                const formatted = formatPromotion(p);
                if (!promoMap.has(formatted)) {
                    promoMap.set(formatted, p);
                }
            });
        });

        const promos = Array.from(promoMap.entries()).map(([formatted, raw]) => ({ formatted, raw }));

        promos.sort((a, b) => {
            const aIsBonus = a.formatted.toLowerCase().includes('bono');
            const bIsBonus = b.formatted.toLowerCase().includes('bono');
            if (aIsBonus && !bIsBonus) return -1;
            if (!aIsBonus && bIsBonus) return 1;
            return a.formatted.localeCompare(b.formatted);
        });
        
        return promos;
    }, [allVehicles]);

    const [activePromotion, setActivePromotion] = useState<string | null>(null);
    const [showSeparados, setShowSeparados] = useState(false);

    useEffect(() => {
        if (allPromotions.length > 0 && !activePromotion) {
            setActivePromotion(allPromotions[0].formatted);
        }
    }, [allPromotions, activePromotion]);

    const filteredVehicles = useMemo(() => {
        if (!activePromotion) return [];
        return allVehicles.filter(vehicle => {
            const hasPromo = vehicle.promociones.some(p => formatPromotion(p) === activePromotion);
            const isVisible = !vehicle.separado || showSeparados;
            return hasPromo && isVisible;
        });
    }, [allVehicles, activePromotion, showSeparados]);

    const bannerImage = useMemo(() => {
        if (filteredVehicles.length === 0) {
            return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop'; // Default banner
        }

        const categoryCounts: { [key: string]: number } = {
            'SUV': 0,
            'Sedán': 0,
            'Pick Up': 0,
            'Hatchback': 0,
        };

        filteredVehicles.forEach(vehicle => {
            vehicle.clasificacionid?.forEach(cat => {
                const cleanCat = cat.replace('sedan', 'Sedán'); // Normalize
                if (cleanCat in categoryCounts) {
                    categoryCounts[cleanCat]++;
                }
            });
        });

        const dominantCategory = Object.entries(categoryCounts)
            .filter(([, count]) => count > 0)
            .sort((a, b) => b[1] - a[1])[0]?.[0];

        switch (dominantCategory) {
            case 'SUV':
                return 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=1964&auto=format&fit=crop';
            case 'Sedán':
                return 'https://images.unsplash.com/photo-1617469767050-14e3b1fa1e16?q=80&w=1932&auto=format&fit=crop';
            case 'Pick Up':
                return 'https://images.unsplash.com/photo-1619409898659-1f53aad5e347?q=80&w=2070&auto=format&fit=crop';
            case 'Hatchback':
                return 'https://images.unsplash.com/photo-1589134254205-758652035317?q=80&w=2070&auto=format&fit=crop';
            default:
                return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=2070&auto=format&fit=crop';
        }
    }, [filteredVehicles]);
    
    const renderSkeletons = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    </div>
                </div>
            ))}
        </div>
    );
    
    if (isLoading) {
        return (
            <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                 <div className="h-80 bg-gray-200 rounded-2xl animate-pulse mb-8"></div>
                 <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-8"></div>
                 {renderSkeletons()}
            </main>
        )
    }

    if (error) {
        return (
            <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center py-16 px-6 bg-white rounded-2xl border border-red-200">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">Ocurrió un error</h3>
                    <p className="text-gray-500 mt-2">{error}</p>
                </div>
            </main>
        )
    }
    
    if (allPromotions.length === 0) {
        return (
             <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="text-center py-16 px-6 bg-white rounded-2xl">
                    <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800">No hay promociones activas</h3>
                    <p className="text-gray-500 mt-2">Vuelve pronto para descubrir nuevas ofertas en nuestro inventario.</p>
                </div>
             </main>
        )
    }

    return (
        <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header Banner */}
            <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-12 group">
                <img src={bannerImage} alt={activePromotion || 'Promoción'} className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 text-white">
                    <Tag className="w-12 h-12 text-primary-400 mb-4 drop-shadow-lg" />
                    <h1 className="text-3xl sm:text-5xl font-extrabold drop-shadow-lg">{activePromotion || 'Promociones'}</h1>
                </div>
            </div>
            
            {/* Filter Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Elige una Promoción</h2>
                <div className="flex flex-wrap gap-3">
                    {allPromotions.map((promoInfo) => (
                        <button
                            key={promoInfo.raw}
                            onClick={() => setActivePromotion(promoInfo.formatted)}
                            className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 transform hover:scale-105 focus:outline-none shadow-md hover:shadow-lg ${getPromotionStyles(promoInfo.raw)}
                                ${activePromotion === promoInfo.formatted 
                                    ? 'ring-4 ring-offset-2 ring-primary-500 ring-offset-gray-50' 
                                    : ''
                                }`}
                        >
                            {promoInfo.formatted}
                        </button>
                    ))}
                </div>
                 <div className="mt-6 flex justify-end items-center gap-3">
                    <label htmlFor="show-separados" className="text-sm font-medium text-gray-700">Mostrar separados</label>
                    <button
                        id="show-separados"
                        onClick={() => setShowSeparados(s => !s)}
                        role="switch"
                        aria-checked={showSeparados}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                            showSeparados ? 'bg-primary-600' : 'bg-gray-300'
                        }`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                            showSeparados ? 'translate-x-6' : 'translate-x-1'
                        }`}/>
                    </button>
                </div>
            </div>

            {/* Vehicle Grid */}
            {filteredVehicles.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVehicles.map(vehicle => (
                        <VehicleGridCard key={`${vehicle.id}-${activePromotion}`} vehicle={vehicle} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-2xl">
                    <h3 className="text-xl font-semibold text-gray-800">No se encontraron autos para esta promoción</h3>
                    <p className="text-gray-500 mt-2">Intenta activar "Mostrar separados" o selecciona otra promoción.</p>
                </div>
            )}
        </main>
    );
};

export default PromotionsPage;