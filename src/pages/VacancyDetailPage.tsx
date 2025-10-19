import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { VacancyService } from '../services/VacancyService';
import type { Vacancy } from '../types/types';
import useSEO from '../hooks/useSEO';
import { MapPin, Clock, DollarSign, Loader2, AlertTriangle, ArrowLeft, X, FileText, CheckCircle, Calendar as CalendarIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const applicationSchema = z.object({
  candidate_name: z.string().min(2, "El nombre es requerido"),
  candidate_email: z.string().email("Email inválido"),
  candidate_phone: z.string().min(10, "El teléfono debe tener 10 dígitos"),
  cvFile: z.instanceof(FileList).refine(files => files.length > 0, "El CV es requerido."),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const ApplicationModal: React.FC<{ vacancy: Vacancy; onClose: () => void }> = ({ vacancy, onClose }) => {
    const { user } = useAuth();
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            candidate_name: user?.user_metadata.full_name || '',
            candidate_email: user?.email || '',
            candidate_phone: user?.phone || '',
        }
    });

    const onSubmit = async (data: ApplicationFormData) => {
        setStatus('submitting');
        setError(null);
        try {
            await VacancyService.submitApplication({
                ...data,
                vacancy_id: vacancy.id,
                cvFile: data.cvFile[0],
                user_id: user?.id,
            });
            setStatus('success');
        } catch (e: any) {
            setStatus('error');
            setError(e.message || "No se pudo enviar la solicitud.");
        }
    };
    
    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Aplicar a: {vacancy.title}</h2>
                        <p className="text-sm text-gray-500">{vacancy.location}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="overflow-y-auto p-6">
                    {status === 'success' ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                            <h3 className="text-2xl font-bold">¡Aplicación Enviada!</h3>
                            <p className="text-gray-600 mt-2">Hemos recibido tu información. El equipo de Recursos Humanos se pondrá en contacto contigo si tu perfil es compatible.</p>
                            <button onClick={onClose} className="mt-6 bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg">Cerrar</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <InputField name="candidate_name" label="Nombre Completo" register={register} error={errors.candidate_name?.message} />
                            <InputField name="candidate_email" label="Email" type="email" register={register} error={errors.candidate_email?.message} />
                            <InputField name="candidate_phone" label="Teléfono" type="tel" register={register} error={errors.candidate_phone?.message} />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tu CV (PDF, DOCX)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                    <div className="space-y-1 text-center">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                <span>Sube un archivo</span>
                                                <input id="file-upload" {...register('cvFile')} type="file" className="sr-only" accept=".pdf,.doc,.docx" />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                {errors.cvFile && <p className="text-red-600 text-sm mt-1">{errors.cvFile.message as string}</p>}
                            </div>

                            {status === 'error' && <p className="text-red-600 text-sm p-3 rounded-md bg-red-50">{error}</p>}
                            
                            <div className="pt-4">
                                <button type="submit" disabled={status === 'submitting'} className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50">
                                    {status === 'submitting' ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Enviar Aplicación'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
const InputField: React.FC<{name: any, label: string, type?: string, register: any, error?: string}> = ({name, label, type="text", register, error}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} type={type} {...register(name)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
);

const VacancyDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useSEO({
        title: vacancy ? `${vacancy.title} | Vacantes en TREFA` : 'Vacante en TREFA',
        description: vacancy ? vacancy.description.substring(0, 160) : 'Oportunidad de carrera en TREFA.',
        keywords: vacancy ? `${vacancy.title}, vacante, empleo, trefa, ${vacancy.location}` : 'vacantes, trefa, empleo',
    });

    useEffect(() => {
        if (!id) {
            setError("No se especificó la vacante.");
            setLoading(false);
            return;
        }
        VacancyService.getVacancyById(id)
            .then(setVacancy)
            .catch(() => setError("No se pudo encontrar la vacante."))
            .finally(() => setLoading(false));
    }, [id]);

    const renderDetail = (Icon: React.ElementType, label: string) => (
        <div className="flex items-center gap-3 text-gray-600">
            <Icon className="w-5 h-5 text-primary-600" />
            <span className="font-medium">{label}</span>
        </div>
    );
    
    return (
        <div className="bg-gray-50 min-h-screen">
            {isModalOpen && vacancy && <ApplicationModal vacancy={vacancy} onClose={() => setIsModalOpen(false)} />}
            <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link to="/vacantes" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4"/> Volver a todas las vacantes
                    </Link>
                </div>
                {loading ? (
                     <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-primary-600" /></div>
                ) : error || !vacancy ? (
                    <div className="text-center py-10 px-6 bg-white rounded-xl border">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800">{error || 'Vacante no encontrada'}</h3>
                    </div>
                ) : (
                    <article className="bg-white p-8 rounded-xl shadow-lg border">
                         {vacancy.image_url && (
                            <img src={vacancy.image_url} alt={vacancy.title} className="w-full h-64 object-cover rounded-lg mb-8" />
                        )}
                        <header className="pb-6 border-b">
                            <h1 className="text-3xl font-extrabold text-gray-900">{vacancy.title}</h1>
                            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                                {renderDetail(MapPin, vacancy.location)}
                                {renderDetail(Clock, vacancy.job_type)}
                                {vacancy.schedule && renderDetail(CalendarIcon, vacancy.schedule)}
                                {vacancy.salary_range && renderDetail(DollarSign, vacancy.salary_range)}
                            </div>
                        </header>
                        <div className="mt-8 prose prose-lg max-w-none">
                            <h2>Descripción del Puesto</h2>
                            <p>{vacancy.description}</p>
                            {vacancy.requirements && <>
                                <h2>Requisitos</h2>
                                <div dangerouslySetInnerHTML={{ __html: vacancy.requirements.replace(/\n/g, '<br/>') }} />
                            </>}
                             {vacancy.benefits && <>
                                <h2>Beneficios</h2>
                                <div dangerouslySetInnerHTML={{ __html: vacancy.benefits.replace(/\n/g, '<br/>') }} />
                            </>}
                        </div>
                        <footer className="mt-10 pt-8 border-t">
                            <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors text-lg">
                                Aplicar Ahora
                            </button>
                        </footer>
                    </article>
                )}
            </main>
        </div>
    );
};

export default VacancyDetailPage;