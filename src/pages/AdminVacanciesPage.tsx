


import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VacancyService } from '../services/VacancyService';
import type { Vacancy } from '../types/types';
import { Briefcase, Loader2, AlertTriangle, PlusCircle, Edit, Users } from 'lucide-react';

// ----- Zod form schema -----
const vacancyFormSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  location: z.string().min(1, 'La ubicación es requerida'),
  job_type: z.string().min(1, 'El tipo de empleo es requerido'),
  salary_range: z.string().optional(),
  schedule: z.string().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']),
  imageFile: z.instanceof(FileList).optional(),
});

type VacancyFormData = z.infer<typeof vacancyFormSchema>;

// FIX: Defined missing InputField, SelectField, and TextArea components to resolve 'Cannot find name' errors.
const InputField: React.FC<{name: string, label: string, register: any, error?: string, required?: boolean, type?: string}> = ({name, label, register, error, required, type = "text"}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <input id={name} {...register(name)} type={type} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
);

const SelectField: React.FC<{name: string, label: string, register: any, error?: string, options: string[], required?: boolean}> = ({name, label, register, error, options, required}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <select id={name} {...register(name)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500">
            <option value="">Seleccionar...</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
);

const TextArea: React.FC<{name: string, label: string, register: any, error?: string, required?: boolean}> = ({name, label, register, error, required}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && <span className="text-red-500">*</span>}</label>
        <textarea id={name} {...register(name)} rows={4} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500" />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
);


// ----- Vacancy Modal Form -----
const VacancyFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  vacancy?: Partial<Vacancy> | null;
}> = ({ isOpen, onClose, vacancy }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VacancyFormData>({
    resolver: zodResolver(vacancyFormSchema),
    defaultValues: vacancy || { status: 'draft' }
  });

  // FIX: Converted useMutation to v5 syntax with a single options object.
  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: VacancyFormData) => {
      const { imageFile, ...vacancyData } = data;
      const file = imageFile?.[0];
      let finalData: Partial<Vacancy> = { ...vacancyData };
  
      if (file) {
        const imageUrl = await VacancyService.uploadVacancyImage(file);
        finalData.image_url = imageUrl;
      }
  
      if (vacancy?.id) {
        return VacancyService.updateVacancy(vacancy.id, finalData);
      } else {
        const newId = crypto.randomUUID();
        return VacancyService.createVacancy({ ...finalData, id: newId });
      }
    },
    onSuccess: () => {
      // FIX: Used v5 syntax for invalidateQueries.
      queryClient.invalidateQueries({ queryKey: ['vacancies'] }); // refetch vacancies
      onClose();
    }
  });

  React.useEffect(() => {
    reset(vacancy || { status: 'draft' });
  }, [vacancy, reset, isOpen]);

  if (!isOpen) return null;

  // FIX: Correctly call mutate with form data. The original error was due to incorrect mutation setup.
  const onSubmit = (data: VacancyFormData) => {
    createOrUpdateMutation.mutate(data);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">{vacancy?.id ? 'Editar' : 'Crear'} Vacante</h2>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <InputField name="title" label="Título del Puesto" register={register} error={errors.title?.message} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField name="location" label="Ubicación" register={register} error={errors.location?.message} options={['Monterrey','Guadalupe','Reynosa','Saltillo']} required />
              <SelectField name="job_type" label="Tipo de Empleo" register={register} error={errors.job_type?.message} options={['Tiempo Completo','Medio Tiempo','Contrato','Otro']} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField name="salary_range" label="Rango Salarial (Opcional)" register={register} error={errors.salary_range?.message} />
              <InputField name="schedule" label="Horario (Opcional)" register={register} error={errors.schedule?.message} />
            </div>
            <TextArea name="description" label="Descripción" register={register} error={errors.description?.message} required />
            <TextArea name="requirements" label="Requisitos" register={register} error={errors.requirements?.message} />
            <TextArea name="benefits" label="Beneficios" register={register} error={errors.benefits?.message} />
            <SelectField name="status" label="Estado" register={register} error={errors.status?.message} options={['draft','published','archived']} required />
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagen de Portada (Opcional)</label>
              <input type="file" {...register('imageFile')} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
            </div>
            {createOrUpdateMutation.isError && <div className="p-3 bg-red-100 text-red-700 rounded-md">{(createOrUpdateMutation.error as Error).message}</div>}
          </div>
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-100">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Guardar Vacante'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ----- Main Page Component -----
const AdminVacanciesPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVacancy, setEditingVacancy] = useState<Partial<Vacancy> | null>(null);

    const { data: vacancies = [], isLoading, isError, error } = useQuery<Vacancy[], Error>({
        queryKey: ['vacancies'],
        queryFn: VacancyService.getAllVacanciesForAdmin
    });

    const handleOpenModal = (vacancy?: Vacancy) => {
        setEditingVacancy(vacancy || null);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <VacancyFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} vacancy={editingVacancy} />
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Briefcase className="w-6 h-6 mr-3 text-primary-600"/>
                  Administrar Vacantes
                </h1>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm hover:bg-primary-700">
                  <PlusCircle className="w-5 h-5"/> Crear Vacante
                </button>
            </div>

            {isLoading && <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>}
            {isError && <div className="p-4 bg-red-100 text-red-800 rounded-md"><AlertTriangle className="inline w-5 h-5 mr-2"/>{error.message}</div>}
            
            <div className="bg-white p-6 rounded-xl shadow-sm border overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="text-left text-gray-500">
                        <tr>
                            <th className="p-3">Título</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Candidatos</th>
                            <th className="p-3">Fecha de Creación</th>
                            <th className="p-3">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {vacancies.map(vacancy => (
                            <tr key={vacancy.id} className="hover:bg-gray-50">
                                <td className="p-3 font-semibold text-gray-800">{vacancy.title}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        vacancy.status === 'published' ? 'bg-green-100 text-green-800' :
                                        vacancy.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-gray-100 text-gray-800'
                                    }`}>{vacancy.status}</span>
                                </td>
                                <td className="p-3">{vacancy.application_count || 0}</td>
                                <td className="p-3">{new Date(vacancy.created_at).toLocaleDateString('es-MX')}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => handleOpenModal(vacancy)} className="p-2 text-gray-500 hover:text-primary-600"><Edit className="w-4 h-4"/></button>
                                    <Link to={`/escritorio/admin/vacantes/${vacancy.id}/candidatos`} className="p-2 text-gray-500 hover:text-primary-600"><Users className="w-4 h-4"/></Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// FIX: Added default export to resolve lazy loading issue in App.tsx.
export default AdminVacanciesPage;
