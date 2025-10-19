

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { InspectionService } from '../services/InspectionService';
import VehicleService from '../services/VehicleService';
import type { Vehicle } from '../types/types';
import type { InspectionReportData } from '../types/types';
import { ArrowLeft, Save, Plus, Trash2, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const inspectionPointSchema = z.object({
  motor: z.array(z.string().min(1, 'El punto no puede estar vacío.')),
  transmision: z.array(z.string().min(1, 'El punto no puede estar vacío.')),
  carroceria: z.array(z.string().min(1, 'El punto no puede estar vacío.')),
  interior: z.array(z.string().min(1, 'El punto no puede estar vacío.')),
});

const inspectionSchema = z.object({
  status: z.enum(['approved', 'pending', 'rejected']),
  past_owners: z.number().min(0, 'Debe ser un número positivo.'),
  sinisters: z.number().min(0, 'Debe ser un número positivo.'),
  police_report: z.string().min(1, 'El estatus legal es requerido.'),
  inspection_points: inspectionPointSchema,
});

type InspectionFormData = z.infer<typeof inspectionSchema>;

const inspectionCategories: { key: Extract<keyof z.infer<typeof inspectionPointSchema>, string>; label: string }[] = [
    { key: 'motor', label: 'Motor' },
    { key: 'transmision', label: 'Transmisión' },
    { key: 'carroceria', label: 'Carrocería' },
    { key: 'interior', label: 'Interior' },
];

interface CategoryEditorProps {
    categoryKey: Extract<keyof z.infer<typeof inspectionPointSchema>, string>;
    categoryLabel: string;
    control: any;
    register: any;
    errors: any;
}

const InspectionCategoryEditor: React.FC<CategoryEditorProps> = ({ categoryKey, categoryLabel, control, register, errors }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `inspection_points.${categoryKey}`
    });

    return (
        <div className="space-y-3">
            <h3 className="font-medium text-gray-800">{categoryLabel}</h3>
            {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                    <input
                        {...register(`inspection_points.${categoryKey}.${index}` as const)}
                        className="flex-grow px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder={`Punto de inspección ${index + 1}`}
                    />
                    <button type="button" onClick={() => remove(index)} className="p-2 text-gray-500 hover:text-red-600">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            ))}
            {errors?.inspection_points?.[categoryKey] && (
                 <p className="text-sm text-red-600 mt-1">{(errors.inspection_points[categoryKey] as any).message as React.ReactNode}</p>
            )}
            <button
                type="button"
                onClick={() => append('')}
                className="flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-800 mt-2"
            >
                <Plus className="w-4 h-4" />
                Añadir Punto
            </button>
        </div>
    );
};

const AdminInspectionPage: React.FC = () => {
    const { vehicleId } = useParams<{ vehicleId: string }>();
    const navigate = useNavigate();
    const { session, loading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [vehicleSlug, setVehicleSlug] = useState<string | null>(null);

    const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<InspectionFormData>({
        resolver: zodResolver(inspectionSchema),
        defaultValues: {
            status: 'pending',
            past_owners: 1,
            sinisters: 0,
            police_report: 'Sin reportes',
            inspection_points: {
                motor: [],
                transmision: [],
                carroceria: [],
                interior: [],
            },
        },
    });

    useEffect(() => {
        if (!authLoading && !session) {
            navigate('/login');
        }
    }, [session, authLoading, navigate]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!vehicleId) {
                setError('ID de vehículo no válido.');
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            setError(null);
            
            const numericVehicleId = parseInt(vehicleId, 10);

            try {
                const [{ vehicles: allVehicles }, inspectionData] = await Promise.all([
                    VehicleService.getAllVehicles(),
                    InspectionService.getInspectionByVehicleId(numericVehicleId)
                ]);

                const currentVehicle = allVehicles.find((v: Vehicle) => v.id === numericVehicleId);
                if (currentVehicle?.slug) {
                    setVehicleSlug(currentVehicle.slug);
                } else {
                    console.error('Vehicle not found, cannot generate back link.');
                }

                if (inspectionData) {
                    reset({
                        status: inspectionData.status || 'pending',
                        past_owners: inspectionData.past_owners,
                        sinisters: inspectionData.sinisters,
                        police_report: inspectionData.police_report,
                        inspection_points: {
                            motor: (inspectionData.inspection_points as any)?.motor || [],
                            transmision: (inspectionData.inspection_points as any)?.transmision || [],
                            carroceria: (inspectionData.inspection_points as any)?.carroceria || [],
                            interior: (inspectionData.inspection_points as any)?.interior || [],
                        }
                    });
                }
            } catch (err: any) {
                console.error("Failed to fetch page data", err);
                setError(err.message || 'No se pudo cargar la información. Puede que el reporte no exista aún.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, [vehicleId, reset]);
    
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const onSubmit = async (data: InspectionFormData) => {
        if (!vehicleId) return;
        
        const payload: Omit<InspectionReportData, 'id' | 'created_at' | 'updated_at'> = {
            vehicle_id: parseInt(vehicleId, 10),
            ...data
        };
        
        try {
            await InspectionService.upsertInspection(payload);
            showMessage('success', 'Reporte de inspección guardado exitosamente.');
        } catch (err: any) {
            showMessage('error', 'Error al guardar el reporte: ' + err.message);
        }
    };
    
    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div></div>;
    }

    const inputClassName = "mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500";

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {vehicleSlug ? (
                <Link to={`/autos/${vehicleSlug}`} className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a la página del auto
                </Link>
            ) : (
                 <span className="flex items-center text-gray-400 mb-6 cursor-not-allowed">
                     <ArrowLeft className="w-4 h-4 mr-2" />
                     Volver a la página del auto
                </span>
            )}
            
             <h1 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
                <ShieldCheck className="w-6 h-6 mr-3 text-primary-600"/>
                Editar Reporte de Inspección (ID: {vehicleId})
            </h1>
            
            {message && (
                <div className={`p-4 rounded-md flex items-center mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertTriangle className="w-5 h-5 mr-3" />}
                    {message.text}
                </div>
            )}

            {error && (
                 <div className="p-4 rounded-md flex items-center mb-6 bg-red-100 text-red-800">
                    <AlertTriangle className="w-5 h-5 mr-3" />
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-semibold mb-4">Datos Generales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Estatus del Reporte</label>
                            <select id="status" {...register('status')} className={inputClassName}>
                                <option value="pending">Pendiente</option>
                                <option value="approved">Aprobado</option>
                                <option value="rejected">Rechazado</option>
                            </select>
                            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status.message as React.ReactNode}</p>}
                        </div>
                        <div>
                            <label htmlFor="past_owners" className="block text-sm font-medium text-gray-700">Dueños Anteriores</label>
                            <input type="number" id="past_owners" {...register('past_owners', { valueAsNumber: true })} className={inputClassName} />
                            {errors.past_owners && <p className="text-sm text-red-600 mt-1">{errors.past_owners.message as React.ReactNode}</p>}
                        </div>
                        <div>
                            <label htmlFor="sinisters" className="block text-sm font-medium text-gray-700">Siniestros Reportados</label>
                            <input type="number" id="sinisters" {...register('sinisters', { valueAsNumber: true })} className={inputClassName} />
                            {errors.sinisters && <p className="text-sm text-red-600 mt-1">{errors.sinisters.message as React.ReactNode}</p>}
                        </div>
                        <div>
                            <label htmlFor="police_report" className="block text-sm font-medium text-gray-700">Estatus Legal</label>
                            <input type="text" id="police_report" {...register('police_report')} className={inputClassName} />
                            {errors.police_report && <p className="text-sm text-red-600 mt-1">{errors.police_report.message as React.ReactNode}</p>}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                     <h2 className="text-lg font-semibold mb-4">Puntos de Inspección</h2>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {inspectionCategories.map(({ key, label }) => (
                            <InspectionCategoryEditor key={key} categoryKey={key} categoryLabel={label} control={control} register={register} errors={errors} />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400">
                        <Save className="w-5 h-5 mr-2" />
                        {isSubmitting ? 'Guardando...' : 'Guardar Reporte'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminInspectionPage;