import React, { useState, useEffect, useMemo } from 'react';
import VehicleService from '../services/VehicleService';
import type { Vehicle } from '../types/types';
import VehicleGridCard from '../components/VehicleGridCard';
import { Search, Database } from 'lucide-react';
import useSEO from '../hooks/useSEO';

const RapidInventoryPage: React.FC = () => {
    useSEO({
        title: 'Inventario Rápido | TREFA',
        description: 'Explora nuestro inventario de autos seminuevos cargado directamente desde nuestro procesador rápido.',
        keywords: 'autos seminuevos, venta de autos, inventario rápido, trefa'
    });

    const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({ search: '', make: '' });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const { vehicles: vehiclesData } = await VehicleService.getAllVehicles();
                setAllVehicles(vehiclesData);
            } catch (err) {
                setError('Error al cargar los autos. Por favor, inténtelo de nuevo más tarde.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filterOptions = useMemo(() => {
        const makes = [...new Set(allVehicles.map(v => v.marca))].sort();
        return { makes };
    }, [allVehicles]);

    const filteredVehicles = useMemo(() => {
        return allVehicles.filter(v => {
            const searchLower = filters.search.toLowerCase();
            const titleMatch = v.titulo.toLowerCase().includes(searchLower);
            const makeMatch = filters.make ? v.marca === filters.make : true;
            return titleMatch && makeMatch;
        });
    }, [allVehicles, filters]);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const renderSkeletons = () => (
        [...Array(12)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm animate-pulse overflow-hidden">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
            </div>
        ))
    );

    return (
        <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                    <Database className="w-8 h-8 mr-3 text-primary-600" />
                    Inventario Rápido (Edge)
                </h1>
                <p className="mt-2 text-gray-600">
                    Esta es una vista previa de nuestro inventario cargada desde el nuevo endpoint de caché de Supabase.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm border sticky top-28 z-20">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Buscar por título..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                </div>
                <select 
                    value={filters.make}
                    onChange={(e) => handleFilterChange('make', e.target.value)}
                    className="w-full md:w-64 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                >
                    <option value="">Todas las Marcas</option>
                    {filterOptions.makes.map(make => <option key={make} value={make}>{make}</option>)}
                </select>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {renderSkeletons()}
                </div>
            ) : error ? (
                <p className="text-red-500 text-center py-10">{error}</p>
            ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white rounded-2xl">
                    <h3 className="text-xl font-semibold text-gray-800">No se encontraron autos</h3>
                    <p className="text-gray-500 mt-2">Intenta ajustar los filtros o ampliar tu búsqueda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredVehicles.map(vehicle => (
                        <VehicleGridCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </div>
            )}
        </main>
    );
};

export default RapidInventoryPage;