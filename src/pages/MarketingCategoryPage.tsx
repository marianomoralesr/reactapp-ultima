import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useVehicles } from '../context/VehicleContext';
import { useFilters } from '../context/FilterContext';
import VehicleGridCard from '../components/VehicleGridCard';
import useSEO from '../hooks/useSEO';
import { Loader2, AlertTriangle, Car } from 'lucide-react';

import { getCategoryImage } from '../utils/categoryImages';

const MarketingCategoryPage: React.FC = () => {
    const { marca, carroceria } = useParams<{ marca?: string; carroceria?: string }>();
    const { vehicles: allVehicles, isLoading } = useVehicles();
    const [error] = useState<string | null>(null);

    const filteredVehicles = useMemo(() => {
        if (!marca && !carroceria) {
            return allVehicles;
        }
        return allVehicles.filter(vehicle => {
            if (marca) {
                return vehicle.marca?.toLowerCase() === marca.toLowerCase();
            }
            if (carroceria) {
                return vehicle.clasificacionid?.some(c => c.toLowerCase() === carroceria.toLowerCase());
            }
            return false;
        });
    }, [allVehicles, marca, carroceria]);
    
    // Determine filter type and value from URL params
    const filterType = marca ? 'marca' : carroceria ? 'clasificacion' : '';
    const filterValue = marca || carroceria || '';

    // Use a state initializer to select a random title ONLY on component mount
    const [seoContent] = useState(() => {
        const type = filterType?.toLowerCase();
        const value = filterValue?.toLowerCase();
        const banner = getCategoryImage(type, value);

        if (type === 'marca' && value) {
            const capitalizedBrand = value.charAt(0).toUpperCase() + value.slice(1);
            const titles = [
                `Tu ${capitalizedBrand} Ideal está Aquí en Venta`,
                `Los Mejores Seminuevos ${capitalizedBrand} en Monterrey`,
                `Compra tu ${capitalizedBrand} Usado al Mejor Precio`,
                `Venta de Autos ${capitalizedBrand} Usados y Seminuevos`,
                `${capitalizedBrand} en Monterrey: Encuentra Precios y Ofertas`
            ];
            const title = titles[Math.floor(Math.random() * titles.length)];
            const description = `Explora nuestro inventario de autos ${capitalizedBrand} seminuevos en venta en Monterrey. Encuentra el mejor precio para tu próximo ${capitalizedBrand} usado. ¡Financiamiento disponible!`;
            const keywords = `${capitalizedBrand} seminuevo, ${capitalizedBrand} usado, ${capitalizedBrand} monterrey, venta de ${capitalizedBrand}, precio ${capitalizedBrand}, comprar ${capitalizedBrand}`;
            
            return { title, description, keywords, banner };
        }
        
        // Fallback logic for non-brand pages or if params are missing
        const staticTitles: { [key: string]: { [key: string]: string } } = {
            clasificacion: {
                suv: 'SUVs Seminuevas en Venta',
                sedan: 'Sedanes Seminuevos en Venta',
                'pick-up': 'Pickups Seminuevas en Venta',
                hatchback: 'Hatchbacks Seminuevos en Venta',
            }
        };

        const title = (type && value && staticTitles[type]?.[value]) || 'Nuestras Mejores Ofertas';
        const description = `Encuentra los mejores ${title.toLowerCase()} en TREFA. Inventario certificado, financiamiento a tu medida y compra 100% digital.`;
        const keywords = `${title.toLowerCase()}, seminuevos, venta de autos, trefa, ${filterValue || ''}`;
        
        return { title, banner, description, keywords };
    });

    useSEO({
        title: `${seoContent.title} | TREFA`,
        description: seoContent.description,
        keywords: seoContent.keywords,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
                <p className="mt-4 text-gray-600">Cargando ofertas...</p>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <h2 className="mt-4 text-xl font-semibold text-gray-800">Ocurrió un error</h2>
                <p className="mt-2 text-gray-600">{error}</p>
            </div>
        );
    }

    return (
        <main className="bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-80 sm:h-96 rounded-b-3xl overflow-hidden group">
                <img src={seoContent.banner} alt={seoContent.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent"></div>
                <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 text-white">
                    <h1 className="text-4xl sm:text-6xl font-extrabold drop-shadow-lg leading-tight">{seoContent.title}</h1>
                    <p className="mt-2 text-lg sm:text-xl drop-shadow-md max-w-2xl">{seoContent.description}</p>
                </div>
            </div>
            
            {/* Vehicle Grid Section */}
            <div className="max-w-screen-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {filteredVehicles.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredVehicles.map(vehicle => (
                                <VehicleGridCard key={vehicle.id} vehicle={vehicle} />
                            ))}
                        </div>
                        <div className="mt-12 text-center">
                            <Link 
                                to={`/autos?${filterType}=${filterValue}`}
                                className="inline-block bg-primary-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg shadow-md"
                            >
                                Ver todos los ({filteredVehicles.length}) resultados
                            </Link>
                        </div>
                    </>
                ) : (
                     <div className="text-center py-16 px-6 bg-white rounded-2xl">
                        <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">No se encontraron autos</h3>
                        <p className="text-gray-500 mt-2 mb-6">Actualmente no tenemos autos que coincidan con esta categoría. ¡Vuelve pronto!</p>
                        <Link
                            to="/autos"
                            className="inline-block bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            Explorar todo el inventario
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
};

export default MarketingCategoryPage;