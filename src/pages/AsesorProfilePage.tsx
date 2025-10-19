import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileService } from '../services/profileService';
import type { Profile } from '../types/types';
import { Mail, Phone, MapPin } from 'lucide-react';

const AsesorProfilePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
const [asesor, setAsesor] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAsesor = async () => {
            if (!id) {
                setError("Asesor ID not provided.");
                setLoading(false);
                return;
            }
            try {
                const data = await ProfileService.getProfile(id);
                if (!data) {
                    setError("Asesor not found.");
                } else {
                    const asesorData: Profile = {
                        id: data.id,
                        role: 'sales',
                        first_name: data.first_name,
                        last_name: data.last_name,
                        email: data.email,
                        phone: data.phone,
                        sucursal: data.sucursal,
                        picture_url: data.picture_url,
                        website: data.website,
                    };
                    setAsesor(asesorData);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAsesor();
    }, [id]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    if (!asesor) {
        return <div className="flex justify-center items-center h-screen">Asesor no encontrado.</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center">
                        <img 
                            src={asesor.picture_url || '/images/default-avatar.png'} 
                            alt={`${asesor.first_name} ${asesor.last_name}`}
                            className="w-32 h-32 rounded-full object-cover border-4 border-primary-500"
                        />
                        <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                            <h1 className="text-3xl font-bold text-gray-900">{`${asesor.first_name} ${asesor.last_name}`}</h1>
                            <p className="text-lg text-gray-600">Asesor de Ventas</p>
                        </div>
                    </div>
                    <div className="mt-8 border-t pt-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de Contacto</h2>
                        <div className="space-y-4">
                            {asesor.email && (
                                <div className="flex items-center">
                                    <Mail className="w-5 h-5 text-gray-500 mr-3" />
                                    <a href={`mailto:${asesor.email}`} className="text-gray-700 hover:text-primary-600">{asesor.email}</a>
                                </div>
                            )}
                            {asesor.phone && (
                                <div className="flex items-center">
                                    <Phone className="w-5 h-5 text-gray-500 mr-3" />
                                    <a href={`tel:${asesor.phone}`} className="text-gray-700 hover:text-primary-600">{asesor.phone}</a>
                                </div>
                            )}
                            {asesor.sucursal && (
                                <div className="flex items-center">
                                    <MapPin className="w-5 h-5 text-gray-500 mr-3" />
                                    <span className="text-gray-700">{asesor.sucursal}</span>
                                </div>
                            )}
                            {asesor.website && (
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-gray-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9"></path></svg>
                                    <a href={asesor.website} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-primary-600">{asesor.website}</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AsesorProfilePage;
