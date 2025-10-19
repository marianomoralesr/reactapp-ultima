
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import VehicleService from '../services/VehicleService';
import type { WordPressVehicle } from '../types/types';
import { Loader2, Search, FileText, Edit } from 'lucide-react';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

const AdminInspectionsListPage: React.FC = () => {
    const [allVehicles, setAllVehicles] = useState<WordPressVehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchVehicles = async () => {
            setIsLoading(true);
            try {
                const { vehicles } = await VehicleService.getAllVehicles();
                setAllVehicles(vehicles);
            } catch (error) {
                console.error("Failed to load vehicles for inspection list:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const filteredVehicles = useMemo(() => {
        if (!searchQuery) return allVehicles;
        const lowercasedQuery = searchQuery.toLowerCase();
        return allVehicles.filter(v =>
            v.titulo.toLowerCase().includes(lowercasedQuery) ||
            String(v.id).includes(lowercasedQuery) ||
            v.ordencompra?.toLowerCase().includes(lowercasedQuery)
        );
    }, [allVehicles, searchQuery]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-primary-600"/>
                Administrar Reportes de Inspección
            </h1>
            <p className="text-gray-600 mb-6">Selecciona un vehículo para ver o editar su reporte de inspección.</p>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre, ID u orden de compra..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border">
                <ul className="divide-y divide-gray-200">
                    {filteredVehicles.map(vehicle => {
                        const imageSrc = vehicle.thumbnail_webp || vehicle.thumbnail || vehicle.feature_image_webp || vehicle.feature_image || DEFAULT_PLACEHOLDER_IMAGE;
                        return (
                            <li key={vehicle.id}>
                                <Link to={`/escritorio/admin/inspection/${vehicle.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <img src={imageSrc} alt={vehicle.titulo} className="w-20 h-16 object-cover rounded-md flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{vehicle.titulo}</p>
                                            <p className="text-sm text-gray-500">ID: {vehicle.id} | OC: {vehicle.ordencompra || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-600 font-semibold text-sm">
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default AdminInspectionsListPage;