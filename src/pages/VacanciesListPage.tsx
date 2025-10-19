import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { VacancyService } from '../services/VacancyService';
import type { Vacancy } from '../types/types';
import useSEO from '../hooks/useSEO';
import { Briefcase, MapPin, Clock, DollarSign, Loader2, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react';

const VacancyCard: React.FC<{ vacancy: Vacancy }> = ({ vacancy }) => (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group">
        <div className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                        <Link to={`/vacantes/${vacancy.id}`}>{vacancy.title}</Link>
                    </h2>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {vacancy.location}</div>
                        <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {vacancy.job_type}</div>
                        {vacancy.schedule && <div className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {vacancy.schedule}</div>}
                        {vacancy.salary_range && <div className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {vacancy.salary_range}</div>}
                    </div>
                </div>
                <div className="flex-shrink-0 hidden sm:block">
                     <Briefcase className="w-10 h-10 text-gray-300 group-hover:text-primary-400 transition-colors" />
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200/80">
                 <p className="text-gray-600 text-sm line-clamp-2">{vacancy.description}</p>
            </div>
        </div>
        <Link to={`/vacantes/${vacancy.id}`} className="block text-center bg-gray-50 group-hover:bg-primary-50 p-3 text-sm font-semibold text-primary-600 transition-colors">
            Ver Detalles y Aplicar
        </Link>
    </div>
);

const VacanciesListPage: React.FC = () => {
    useSEO({
        title: 'Únete a Nuestro Equipo | Vacantes en TREFA',
        description: 'Explora las oportunidades de carrera en TREFA. Buscamos talento apasionado por la industria automotriz y la tecnología. ¡Aplica hoy!',
        keywords: 'vacantes, empleos, carrera, trefa, trabajo, automotriz'
    });

    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        VacancyService.getPublicVacancies()
            .then(setVacancies)
            .catch(() => setError('No se pudieron cargar las vacantes.'))
            .finally(() => setLoading(false));
    }, []);
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-center">
                    <Briefcase className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <h1 className="text-4xl font-extrabold text-gray-900">Portal de Empleo</h1>
                    <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
                        Forma parte de un equipo que está transformando la experiencia de compra y venta de autos.
                    </p>
                </div>
            </header>
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-primary-600" /></div>
                ) : error ? (
                    <div className="text-center py-10 px-6 bg-red-50 border border-red-200 rounded-lg">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">Ocurrió un error</h3>
                        <p className="text-gray-600 mt-2">{error}</p>
                    </div>
                ) : vacancies.length > 0 ? (
                    <div className="space-y-6">
                        {vacancies.map(vacancy => <VacancyCard key={vacancy.id} vacancy={vacancy} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-white rounded-xl border">
                        <h3 className="text-xl font-semibold text-gray-800">No hay vacantes disponibles por el momento</h3>
                        <p className="text-gray-500 mt-2">Gracias por tu interés. Vuelve pronto para descubrir nuevas oportunidades.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default VacanciesListPage;