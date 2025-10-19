import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { ProfileService } from '../services/profileService';
import { User, ArrowLeft, CheckCircle, Loader2, Info, ArrowRight } from 'lucide-react';
import type { Profile } from '../types/types';
import { calculateRFC } from '../utils/rfcCalculator';
import { toast } from 'sonner';


const MEXICAN_STATES = [ 'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', ];

// Schemas
const profileSchema = z.object({
  first_name: z.string().min(2, 'Nombre es requerido'),
  last_name: z.string().min(2, 'Apellido paterno es requerido'),
  mother_last_name: z.string().min(2, 'Apellido materno es requerido'),
  phone: z.string().min(10, 'Teléfono debe tener 10 dígitos'),
  birth_date: z.string().min(1, 'Fecha de nacimiento es requerida'),
  homoclave: z.string().length(3, 'Homoclave debe tener 3 caracteres'),
  fiscal_situation: z.string().min(1, 'Situación fiscal es requerida'),
  civil_status: z.string().min(1, 'Estado civil es requerido'),
  gender: z.string().optional().or(z.literal('')),
  how_did_you_know: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'La dirección es requerida'),
  colony: z.string().min(3, 'La colonia es requerida'),
  city: z.string().min(2, 'La ciudad es requerida'),
  state: z.string().min(2, 'El estado es requerido'),
  zip_code: z.string().min(5, 'El código postal debe tener 5 dígitos'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const checkProfileCompleteness = (p: Profile | undefined): boolean => {
  if (!p) return false;
  
  const requiredFields: (keyof Profile)[] = [
    'first_name', 
    'last_name', 
    'mother_last_name', 
    'phone', 
    'birth_date', 
    'homoclave'
  ];
  
  return requiredFields.every(field => {
    const value = p[field];
    return value != null && String(value).trim() !== '';
  });
};

const ProfilePage: React.FC = () => {
  const { user, profile, loading, reloadProfile } = useAuth();
  
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [calculatedRfc, setCalculatedRfc] = useState('');
  const [asesorAutorizadoAcceso, setAsesorAutorizadoAcceso] = useState(false);
  const [assignedAgentName, setAssignedAgentName] = useState<string>();
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });
  
  const { watch: watchProfileFields, reset: resetProfileForm } = profileForm;

  useEffect(() => {
    if (profile) {
      const isComplete = checkProfileCompleteness(profile);
      setIsProfileComplete(isComplete);
      if (!isComplete) {
        setIsFirstTimeUser(true);
      }
      resetProfileForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        mother_last_name: profile.mother_last_name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        homoclave: profile.homoclave || '',
        fiscal_situation: profile.fiscal_situation || '',
        civil_status: profile.civil_status || '',
        gender: profile.gender || '',
        how_did_you_know: profile.how_did_you_know || '',
        address: profile.address || '',
        colony: profile.colony || '',
        city: profile.city || '',
        state: profile.state || '',
        zip_code: profile.zip_code || '',
      });
      setCalculatedRfc(profile.rfc || '');
      setAsesorAutorizadoAcceso(profile.asesor_autorizado_acceso || false);
      setPreviewUrl(profile.picture_url || null);

      if (profile.asesor_asignado_id) {
        ProfileService.getProfile(profile.asesor_asignado_id).then(agentProfile => {
          if (agentProfile) {
            setAssignedAgentName(`${agentProfile.first_name || ''} ${agentProfile.last_name || ''}`.trim());
          }
        });
      }
    }
  }, [profile, resetProfileForm]);

  const [firstName, lastName, motherLastName, birthDate, homoclave] = watchProfileFields(['first_name', 'last_name', 'mother_last_name', 'birth_date', 'homoclave']);

  useEffect(() => {
    if (firstName && lastName && motherLastName && birthDate && homoclave) {
      const rfc = calculateRFC({ first_name: firstName, last_name: lastName, mother_last_name: motherLastName, birth_date: birthDate, homoclave });
      setCalculatedRfc(rfc || 'Completa los campos para calcular');
    }
  }, [firstName, lastName, motherLastName, birthDate, homoclave]);

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleProfileUpdate = async (data: ProfileFormData) => {
    if (!user) return;
    setSaveState('saving');

    try {
      let pictureUrl = profile?.picture_url;
      if (profilePictureFile) {
        pictureUrl = await ProfileService.uploadProfilePicture(user.id, profilePictureFile);
      }

      const finalRfc = calculateRFC(data);
      const payload: Partial<Profile> = { 
        id: user.id,
        ...data, 
        rfc: finalRfc ?? undefined, 
        asesor_autorizado_acceso: asesorAutorizadoAcceso,
        picture_url: pictureUrl
      };

      if (asesorAutorizadoAcceso && !profile?.asesor_asignado_id) {
        const assignedAdvisorId = await ProfileService.assignAdvisorToUser(user.id);
        if (assignedAdvisorId) {
          payload.asesor_asignado_id = assignedAdvisorId;
        }
      }

      await ProfileService.updateProfile(payload);
      await reloadProfile();
      
      setSaveState('saved');
      toast.success('¡Perfil guardado!');

      setTimeout(() => {
        setSaveState('idle');
        // Navigation logic can be placed here if needed, for now, we just reset the button
      }, 2500);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error desconocido');
      setSaveState('idle');
    }
  };
  
  const inputClassName = "mt-1 block w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-500 disabled:bg-gray-100 disabled:cursor-not-allowed";
  const phoneInputClassName = "flex-1 w-full px-4 py-2.5 bg-white border border-gray-300 rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900 placeholder-gray-500";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link
        to="/escritorio"
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Volver al Dashboard
      </Link>
      
      <div className="space-y-8">

        {/* Profile Information */}
        <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="bg-white text-gray-900 rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <User className="w-5 h-5 mr-3 text-primary-600" />
              Información del Perfil
            </h2>
            <div className="text-center">
              <label htmlFor="profile-picture-upload" className="cursor-pointer group">
                <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden ring-2 ring-offset-2 ring-primary-500/50 group-hover:ring-primary-500/80 transition-all">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <span className="text-xs font-semibold text-gray-500 mt-2 group-hover:text-primary-600">Cambiar foto</span>
              </label>
              <input id="profile-picture-upload" type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
            </div>
          </div>

          {isFirstTimeUser && !isProfileComplete && (
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-6 rounded-r-lg">
                <h3 className="font-bold flex items-center"><Info className="w-5 h-5 mr-2" />¡Bienvenido!</h3>
                <p className="text-sm mt-1">El primer paso para comenzar tu solicitud de financiamiento es que completes tu perfil. Ingresa tus datos tal como aparecen en tu identificación oficial.</p>
            </div>
          )}

          {isProfileComplete ? (
            <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-900">¡Perfil Completo!</h3>
                <p className="text-gray-600 mt-2 mb-4">Has completado tu información personal. El siguiente paso es crear tu perfilamiento bancario para encontrar el banco con las mejores condiciones para tu caso específico.</p>
                <Link
                    to="/escritorio/perfilacion-bancaria"
                    className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-500"
                >
                    Crear mi perfil bancario  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
          ) : null}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <div className="flex mt-1">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">MX +52</span>
                  <input id="phone" {...profileForm.register('phone')} className={phoneInputClassName} />
                </div>
                {profileForm.formState.errors.phone && <p className="text-sm text-red-600 mt-1">{profileForm.formState.errors.phone?.message as React.ReactNode}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                <input id="email" type="email" value={user?.email || ''} readOnly disabled className={inputClassName} />
              </div>
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">Nombre(s)</label>
                <input id="first_name" {...profileForm.register('first_name')} className={inputClassName} />
                {profileForm.formState.errors.first_name && <p className="text-sm text-red-600 mt-1">{profileForm.formState.errors.first_name?.message as React.ReactNode}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
                <input id="last_name" {...profileForm.register('last_name')} className={inputClassName} />
                {profileForm.formState.errors.last_name && <p className="text-sm text-red-600 mt-1">{profileForm.formState.errors.last_name?.message as React.ReactNode}</p>}
              </div>
              <div>
                <label htmlFor="mother_last_name" className="block text-sm font-medium text-gray-700">Apellido Materno</label>
                <input id="mother_last_name" {...profileForm.register('mother_last_name')} className={inputClassName} />
                {profileForm.formState.errors.mother_last_name && <p className="text-sm text-red-600 mt-1">{profileForm.formState.errors.mother_last_name?.message as React.ReactNode}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input id="birth_date" type="date" {...profileForm.register('birth_date')} className={inputClassName} />
                {profileForm.formState.errors.birth_date && <p className="text-sm text-red-600 mt-1">{profileForm.formState.errors.birth_date.message as React.ReactNode}</p>}
              </div>
              <div>
                <label htmlFor="homoclave" className="block text-sm font-medium text-gray-700">Homoclave (RFC)</label>
                <input id="homoclave" {...profileForm.register('homoclave')} className={inputClassName} maxLength={3} placeholder="Últimos 3 dígitos del RFC" />
                {profileForm.formState.errors.homoclave && <p className="text-sm text-red-600 mt-1">{profileForm.formState.errors.homoclave.message as React.ReactNode}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="rfc" className="block text-sm font-medium text-gray-700">RFC Calculado</label>
              <input 
                id="rfc" 
                type="text" 
                value={calculatedRfc} 
                readOnly 
                disabled 
                className={inputClassName} 
              />
              <p className="text-xs text-gray-500 mt-1">Este campo se calcula automáticamente al guardar tu perfil con todos los datos requeridos.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField label="Situación Fiscal" error={profileForm.formState.errors.fiscal_situation?.message as React.ReactNode}>
                <select {...profileForm.register('fiscal_situation')} className={inputClassName}>
                  <option value="">Seleccionar...</option>
                  <option value="asalariado">Empleado con nónima</option>
                  <option value="honorarios">Honorarios</option>
                  <option value="dividendos">Dividendos o acciones</option>
                  <option value="pensionado">Pensionado</option>
                  <option value="actividad_empresarial">Persona Física con Actividad Empresarial</option>
                </select>
              </FormField>
              <FormField label="Estado Civil" error={profileForm.formState.errors.civil_status?.message as React.ReactNode}>
                <select {...profileForm.register('civil_status')} className={inputClassName}>
                  <option value="">Seleccionar...</option>
                  <option value="soltero">Soltero(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="viudo">Viudo(a)</option>
                  <option value="union">Unión Libre</option>
                </select>
              </FormField>
              <FormField label="Género" error={profileForm.formState.errors.gender?.message as React.ReactNode}>
                <select {...profileForm.register('gender')} className={inputClassName}>
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </FormField>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Calle y Número" error={profileForm.formState.errors.address?.message as React.ReactNode}>
                <input {...profileForm.register('address')} className={inputClassName} />
              </FormField>
              <FormField label="Colonia" error={profileForm.formState.errors.colony?.message as React.ReactNode}>
                <input {...profileForm.register('colony')} className={inputClassName} />
              </FormField>
              <FormField label="Ciudad" error={profileForm.formState.errors.city?.message as React.ReactNode}>
                <input {...profileForm.register('city')} className={inputClassName} />
              </FormField>
              <FormField label="Estado" error={profileForm.formState.errors.state?.message as React.ReactNode}>
                <select {...profileForm.register('state')} className={inputClassName}>
                  <option value="">Seleccionar...</option>
                  {MEXICAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </FormField>
              <FormField label="Código Postal" error={profileForm.formState.errors.zip_code?.message as React.ReactNode}>
                <input {...profileForm.register('zip_code')} className={inputClassName} />
              </FormField>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <label className="flex items-start cursor-pointer">
                <input
                  id="asesor_autorizado_acceso"
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-primary-600 rounded mt-1"
                  checked={asesorAutorizadoAcceso}
                  onChange={(e) => setAsesorAutorizadoAcceso(e.target.checked)}
                />
                <div className="ml-3">
                  <span className="font-semibold text-gray-800">Autorizar acceso a mi asesor</span>
                  <p className="text-sm text-gray-600">
                    {assignedAgentName 
                      ? `Autorizar a ${assignedAgentName} el acceso a mi cuenta para dar seguimiento a mi solicitud.`
                      : 'Autorizar el acceso a mi cuenta a mi asesor asignado para dar seguimiento a mi solicitud.'
                    }
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={saveState === 'saving'} 
                className={`inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-70
                  ${saveState === 'saved' 
                    ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' 
                    : 'bg-gradient-to-r from-yellow-500 to-primary-500 hover:from-yellow-600 hover:to-primary-600 focus:ring-primary-500'
                  }`}
              >
                {saveState === 'saving' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {saveState === 'saved' && <CheckCircle className="w-4 h-4 mr-2" />}
                {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? '¡Guardado!' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const FormField: React.FC<{ label: string; error?: React.ReactNode; children: React.ReactNode; }> = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className="mt-1">{children}</div>
    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
  </div>
);


export default ProfilePage;