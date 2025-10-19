import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { VacancyService } from '../services/VacancyService';
import type { JobApplication, Vacancy } from '../types/types';
import { Loader2, AlertTriangle, Users, ArrowLeft, Download } from 'lucide-react';

const AdminCandidatesPage: React.FC = () => {
    const { vacancyId } = useParams<{ vacancyId: string }>();
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        if (!vacancyId) {
            setError("ID de vacante no especificado.");
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const [vacancyData, applicationsData] = await Promise.all([
                VacancyService.getVacancyById(vacancyId),
                VacancyService.getApplicationsForVacancy(vacancyId)
            ]);
            setVacancy(vacancyData);
            setApplications(applicationsData);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [vacancyId]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    return (
        <div className="space-y-8">
            <div>
                <Link to="/escritorio/admin/vacantes" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4"/> Volver a Vacantes
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-primary-600"/>
                  Candidatos para: {loading ? '...' : vacancy?.title || 'Vacante no encontrada'}
                </h1>
            </div>

             {loading ? <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div> :
            error ? <div className="p-4 bg-red-100 text-red-800 rounded-md"><AlertTriangle className="inline w-5 h-5 mr-2"/>{error}</div> :
            (
                <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
                    {applications.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="text-left text-gray-500">
                                <tr>
                                    <th className="p-3">Nombre</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Teléfono</th>
                                    <th className="p-3">Fecha de Aplicación</th>
                                    <th className="p-3">CV</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {applications.map(app => (
                                    <tr key={app.id} className="hover:bg-gray-50">
                                        <td className="p-3 font-semibold text-gray-800">{app.candidate_name}</td>
                                        <td className="p-3">{app.candidate_email}</td>
                                        <td className="p-3">{app.candidate_phone}</td>
                                        <td className="p-3">{new Date(app.submitted_at).toLocaleString('es-MX')}</td>
                                        <td className="p-3">
                                            <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:underline">
                                                <Download className="w-4 h-4" /> Ver CV
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center text-gray-500 py-10">No hay candidatos para esta vacante todavía.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminCandidatesPage;