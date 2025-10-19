import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
import { useForm, Controller, useController, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useSearchParams, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import { WordPressVehicle, Profile } from '../types/types';
import { 
  FileText, CheckCircle, Building2, User, AlertTriangle, Loader2, Users, PenSquare,
  ArrowLeft, ArrowRight, Edit
} from 'lucide-react';
import StepIndicator from '../components/StepIndicator';
import { ApplicationService } from '../services/ApplicationService';
import { BankProfilingService } from '../services/BankProfilingService';

import FileUpload from '../components/FileUpload';
import { DocumentService, UploadedDocument } from '../services/documentService';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

const VehicleSelector = lazy(() => import('../components/VehicleSelector'));

const MEXICAN_STATES = [ 'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas', ];

const baseApplicationObject = z.object({
  // Step 1: Personal Info & Address
  civil_status: z.string().optional(),
  current_address: z.string().min(5, 'La dirección es obligatorio'),
  current_colony: z.string().min(3, 'La colonia es obligatorio'),
  current_city: z.string().min(2, 'La ciudad es obligatorio'),
  current_state: z.string().min(2, 'El estado es obligatorio'),
  current_zip_code: z.string().min(5, 'El código postal debe tener 5 dígitos'),
  housing_type: z.string().min(1, 'El tipo de vivienda es obligatorio'),
  grado_de_estudios: z.string().min(1, 'El grado de estudios es obligatorio'),
  dependents: z.string().min(1, 'El número de dependientes es obligatorio'),
  spouse_full_name: z.string().optional(), // Always optional in base schema

  // Step 2: Employment Info
  fiscal_classification: z.string().min(1, "La clasificación fiscal es obligatorio"),
  company_name: z.string().min(2, "El nombre de la empresa es obligatorio"),
  company_phone: z.string().default('').transform(val => val.replace(/\D/g, '')).pipe(z.string().length(10, "El teléfono de la empresa debe tener 10 dígitos")),
  supervisor_name: z.string().min(2, "El nombre del jefe inmediato es obligatorio"),
  company_website: z.string().optional().or(z.literal('')).refine(val => {
    if (!val) return true; // Optional field is valid if empty
    return val.includes('.') && !val.includes(' ');
  }, { message: 'Formato de URL inválido. Debe incluir un punto y no tener espacios.' }),
  company_address: z.string().min(5, "La dirección de la empresa es obligatorio"),
  company_industry: z.string().min(2, "La industria es obligatorio"),
  job_title: z.string().min(2, "El puesto es obligatorio"),
  job_seniority: z.string().min(1, "La antigüedad es obligatorio"),
  net_monthly_income: z.string().min(1, "El salario neto es obligatorio"),
  
  // Step 3: References
  parentesco: z.string().min(3, "El parentesco es obligatorio"),
  friend_reference_name: z.string().min(2, "El nombre de referencia de amistad es obligatorio"),
  friend_reference_phone: z.string().default('').transform(val => val.replace(/\D/g, '')).pipe(z.string().length(10, "El teléfono de referencia de amistad debe tener 10 dígitos")),
  family_reference_name: z.string().min(2, "El nombre de referencia familiar es obligatorio"),
  family_reference_phone: z.string().default('').transform(val => val.replace(/\D/g, '')).pipe(z.string().length(10, "El teléfono de referencia familiar debe tener 10 dígitos")),
  
  // Step 5: Consent
  terms_and_conditions: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones para continuar."
  }),
  consent_survey: z.boolean().optional(),
  ordencompra: z.string().optional(),
}).refine(data => {
    if (data.civil_status?.toLowerCase() === 'casado') {
        return data.spouse_full_name && data.spouse_full_name.length >= 2;
    }
    return true;
}, {
    message: 'El nombre completo del cónyuge es obligatorio.',
    path: ['spouse_full_name'],
});

const baseApplicationSchema = baseApplicationObject;

type ApplicationFormData = z.infer<typeof baseApplicationSchema>;

const Application: React.FC = () => {
    const navigate = useNavigate();
    const { user, profile, loading: authLoading } = useAuth();
    const { vehicles } = useVehicles();
    const [searchParams] = useSearchParams();
    const { id: applicationIdFromUrl } = useParams<{ id: string }>();
    
    const [pageStatus, setPageStatus] = useState<'initializing' | 'loading' | 'checking_profile' | 'profile_incomplete' | 'bank_profile_incomplete' | 'active_application_exists' | 'ready' | 'error' | 'success'>('initializing');
    const [pageError, setPageError] = useState<string | null>(null);
    const [submissionError, setSubmissionError] = useState<string | null>(null);
    const [showVehicleSelector, setShowVehicleSelector] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(applicationIdFromUrl || null);
    const [applicationData, setApplicationData] = useState<any>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [recommendedBank, setRecommendedBank] = useState<string | null>(null);
    const [vehicleInfo, setVehicleInfo] = useState<any>(null);
    const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, UploadedDocument[]>>({});

    const applicationSchema = baseApplicationSchema;

    const form = useForm<ApplicationFormData>({ 
      resolver: zodResolver(applicationSchema),
      defaultValues: {
        terms_and_conditions: false,
        consent_survey: false,
      }
    });
    const { control, handleSubmit, formState: { errors, isValid }, reset, trigger, getValues, setValue, watch } = form;
    const civilStatus = watch('civil_status');
    const isMarried = civilStatus?.toLowerCase() === 'casado';

    useEffect(() => {
        const checkUserProfile = async () => {
            if (authLoading) {
                setPageStatus('loading');
                return;
            }
            if (!user || !profile) {
                setPageStatus('profile_incomplete');
                return;
            }

            setPageStatus('checking_profile');
            const requiredFields: (keyof Profile)[] = ['first_name', 'last_name', 'mother_last_name', 'phone', 'birth_date', 'homoclave', 'fiscal_situation', 'civil_status', 'address', 'city', 'state', 'zip_code', 'rfc'];
            const isProfileComplete = requiredFields.every(field => profile[field] && String(profile[field]).trim() !== '');
            
            if (!isProfileComplete) {
                const ordenCompraFromUrl = searchParams.get('ordencompra');
                if (ordenCompraFromUrl) {
                    sessionStorage.setItem('pendingOrdenCompra', ordenCompraFromUrl);
                }
                setPageStatus('profile_incomplete');
                return;
            }
            
            const bankProfile = await BankProfilingService.getUserBankProfile(user.id);
            if (!bankProfile?.is_complete || !bankProfile.banco_recomendado) {
                setPageStatus('bank_profile_incomplete');
                return;
            }
            setRecommendedBank(bankProfile.banco_recomendado);

            const hasActiveApp = await ApplicationService.hasActiveApplication(user.id);
            if (hasActiveApp && !applicationIdFromUrl) {
                setPageStatus('active_application_exists');
                return;
            }
            
            setPageStatus('ready');
        };

        if (pageStatus === 'initializing') {
            checkUserProfile();
        }
    }, [user, profile, authLoading, applicationIdFromUrl, searchParams, pageStatus]);

    useEffect(() => {
        const loadOrCreateDraft = async () => {
            if (pageStatus !== 'ready' || !user || applicationData) return;

            try {
                if (applicationIdFromUrl) {
                    const draft = await ApplicationService.getApplicationById(user.id, applicationIdFromUrl);
                    if (!draft) throw new Error('No se encontró el borrador de la solicitud.');
                    
                    setApplicationId(draft.id);
                    setApplicationData(draft.application_data || {});
                    const carInfo = (draft.car_info || {}) as any;
                    setVehicleInfo(carInfo);
                    if (carInfo?._ordenCompra) setValue('ordencompra', carInfo._ordenCompra);

                    const applicationData = { ...(draft.application_data || {}) };
                    reset(applicationData);
                    if (!carInfo._ordenCompra) setShowVehicleSelector(true);
                } else {
                    const pendingOrdenCompra = sessionStorage.getItem('pendingOrdenCompra');
                    const finalOrdenCompra = searchParams.get('ordencompra') || pendingOrdenCompra;

                    let initialData: Record<string, any> = {};
                    if (finalOrdenCompra) {
                        const vehicle = vehicles.find(v => v.ordencompra === finalOrdenCompra);
                        if (vehicle) {
                            const featureImage = vehicle.thumbnail_webp || vehicle.thumbnail || vehicle.feature_image_webp || vehicle.feature_image || DEFAULT_PLACEHOLDER_IMAGE;
                            const carData = { _vehicleTitle: vehicle.titulo, _ordenCompra: vehicle.ordencompra, _featureImage: featureImage };
                            initialData.car_info = carData;
                            initialData.application_data = { ordencompra: finalOrdenCompra };
                        }
                        sessionStorage.removeItem('pendingOrdenCompra');
                    } else {
                        setShowVehicleSelector(true);
                    }
                    
                    const newDraft = await ApplicationService.createDraftApplication(user.id, initialData);
                    if (newDraft && newDraft.id) {
                        navigate(`/escritorio/aplicacion/${newDraft.id}`, { replace: true });
                    } else {
                        throw new Error('No se pudo crear el borrador de la solicitud.');
                    }
                }
            } catch (error: any) {
                setPageError(error.message || 'No se pudo cargar o crear la solicitud.');
                setPageStatus('error');
            }
        };

        loadOrCreateDraft();
    }, [pageStatus, user, applicationIdFromUrl, vehicles, reset, searchParams, setValue, navigate, applicationData]);

    const handleVehicleSelect = async (vehicle: WordPressVehicle) => {
        if (!applicationId) return;
        const featureImage = vehicle.thumbnail_webp || vehicle.thumbnail || vehicle.feature_image_webp || vehicle.feature_image || DEFAULT_PLACEHOLDER_IMAGE;
        const carData = { _vehicleTitle: vehicle.titulo, _ordenCompra: vehicle.ordencompra, _featureImage: featureImage };
        setVehicleInfo(carData);
        setValue('ordencompra', vehicle.ordencompra);
        await ApplicationService.saveApplicationDraft(applicationId, { car_info: carData });
        setShowVehicleSelector(false);
    };

    const steps = [
        { title: 'Personal', icon: User, fields: ['current_address', 'current_colony', 'current_city', 'current_state', 'current_zip_code', 'housing_type', 'dependents', 'grado_de_estudios', ...(isMarried ? ['spouse_full_name'] : [])] },
        { title: 'Empleo', icon: Building2, fields: ['fiscal_classification', 'company_name', 'company_phone', 'supervisor_name', 'company_address', 'company_industry', 'job_title', 'job_seniority', 'net_monthly_income'] },
        { title: 'Referencias', icon: Users, fields: ['friend_reference_name', 'friend_reference_phone', 'family_reference_name', 'family_reference_phone', 'parentesco'] },
        { title: 'Documentos', icon: FileText, fields: [] },
        { title: 'Consentimiento', icon: PenSquare, fields: ['terms_and_conditions'] },
        { title: 'Resumen', icon: CheckCircle, fields: [] },
    ];
    
    const handleNext = async () => {
      const isValidStep = await trigger(steps[currentStep].fields as any);
      if (isValidStep && applicationId) {
        try {
            await ApplicationService.saveApplicationDraft(applicationId, { application_data: getValues() });
            if(currentStep < steps.length - 1) setCurrentStep(s => s + 1);
        } catch (e) {
            console.error("Error saving application draft:", e);
            alert("Hubo un problema al guardar tu progreso. Por favor, intenta de nuevo.");
        }
      }
    };
    
    const handlePrev = () => { if(currentStep > 0) setCurrentStep(s => s - 1); };

    const validateDocuments = useCallback(() => {
        const requiredDocs: Record<string, string> = {
            'ine_front': 'INE (Frente)',
            'ine_back': 'INE (Reverso)',
            'proof_address': 'Comprobante de Domicilio',
        };

        for (const [type, name] of Object.entries(requiredDocs)) {
            if (!uploadedDocuments[type] || uploadedDocuments[type].length === 0) {
                return `Falta el documento: ${name}. Por favor, súbelo en el paso de 'Documentos'.`;
            }
        }

        const incomeDocs = uploadedDocuments['proof_income'] || [];
        const hasZip = incomeDocs.some(doc => doc.fileName.toLowerCase().endsWith('.zip'));

        if (incomeDocs.length < 3 && !hasZip) {
            return `Debes subir al menos 3 comprobantes de ingresos, o un solo archivo .zip que los contenga. Actualmente tienes ${incomeDocs.length}.`;
        }
        return null;
    }, [uploadedDocuments]);


    const onSubmit: SubmitHandler<ApplicationFormData> = async (data) => {
        setSubmissionError(null);

        if (!applicationId || !user || !profile || !recommendedBank) {
            setSubmissionError("Faltan datos esenciales de la aplicación. Por favor, recarga la página o contacta a soporte.");
            return;
        }

        if (!vehicleInfo?._ordenCompra) {
            setSubmissionError("No has seleccionado un vehículo para tu solicitud.");
            setShowVehicleSelector(true);
            return;
        }

        const docValidationError = validateDocuments();
        if (docValidationError) {
            setSubmissionError(docValidationError);
            setCurrentStep(3); // Go back to documents step
            return;
        }

        try {
            const payload = {
                personal_info_snapshot: profile,
                car_info: vehicleInfo,
                application_data: data,
                selected_banks: [recommendedBank],
            };
            
            await ApplicationService.updateApplication(applicationId, payload);

            setPageStatus('success');

        } catch(e: any) {
            setSubmissionError(e.message || "No se pudo enviar la solicitud. Por favor, revisa que todos los campos estén completos y vuelve a intentarlo.");
        }
    };

    const StatusDisplay: React.FC<{ icon: React.ElementType, title: string, message: string, linkTo: string, linkText: string }> = ({ icon: Icon, title, message, linkTo, linkText }) => (
        <div className="max-w-xl mx-auto p-8 text-center bg-white rounded-xl shadow-sm border border-yellow-300">
            <Icon className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-2">{message}</p>
            <Link to={linkTo} className="mt-6 inline-block bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700">{linkText}</Link>
        </div>
    );
    
    const isSubmitDisabled = useMemo(() => {
        return form.formState.isSubmitting || !isValid || !!validateDocuments();
    }, [form.formState.isSubmitting, isValid, validateDocuments]);

    const renderPageContent = () => {
        switch(pageStatus) {
            case 'loading':
            case 'checking_profile':
                return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
            case 'profile_incomplete':
                return <StatusDisplay icon={User} title="¡Casi listo para empezar!" message="Por favor completa la informacion de tu perfil para comenzar una solicitud de financiamiento." linkTo="/escritorio/profile" linkText="Ir a mi perfil" />;
            case 'bank_profile_incomplete':
                return <StatusDisplay icon={Building2} title="Completa tu Perfil Bancario" message="Tu perfil personal está completo. El siguiente paso es el perfilamiento bancario para encontrar la mejor opción para ti." linkTo="/escritorio/perfilacion-bancaria" linkText="Ir a Perfilamiento Bancario" />;
            case 'active_application_exists':
                 return <StatusDisplay icon={AlertTriangle} title="Solicitud en Proceso" message="Ya tienes una solicitud activa. Solo puedes tener una a la vez. Puedes ver el estado de tu solicitud actual o contactar a tu asesor." linkTo="/escritorio/seguimiento" linkText="Ver Mis Solicitudes" />;
            case 'error':
                 return <StatusDisplay icon={Info} title="Ocurrió un Error" message={pageError || 'Error desconocido'} linkTo="/escritorio" linkText="Volver al Escritorio" />;
            case 'success':
                 const expiryDate = new Date();
                 expiryDate.setDate(expiryDate.getDate() + 2); // Hold for 48 hours
                 const formattedExpiryDate = new Intl.DateTimeFormat('es-MX', {
                     month: 'long',
                     day: 'numeric',
                     hour: 'numeric',
                     minute: 'numeric',
                     hour12: true,
                 }).format(expiryDate);
 
                 return (
                     <div className="max-w-2xl mx-auto p-4 sm:p-0 text-gray-900">
                         {/* Unified Card Container */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col gap-6">
                            {/* Vehicle Info */}
                             {vehicleInfo?._vehicleTitle && (
                                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 order-1 lg:order-2">
                                     <img src={vehicleInfo._featureImage} alt={vehicleInfo._vehicleTitle} className="w-full sm:w-32 sm:h-24 object-cover rounded-md" />
                                     <div>
                                         <p className="text-sm text-gray-500">Auto en tu solicitud:</p>
                                         <h3 className="text-lg font-bold text-gray-900">{vehicleInfo._vehicleTitle}</h3>
                                     </div>
                                 </div>
                             )}

                             {/* "On Hold" Banner */}
                             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-4 order-2 lg:order-1">
                                 <div className="bg-yellow-100 p-2 rounded-full mt-1">
                                     <AlertTriangle className="w-6 h-6 text-yellow-600" />
                                 </div>
                                 <div>
                                     <h2 className="font-bold text-yellow-900">Tu Solicitud está en Proceso</h2>
                                     <p className="text-sm text-yellow-800 mt-1">
                                         Estamos revisando tu información. <strong>{formattedExpiryDate}</strong>. Te notificaremos cualquier cambio. 
                                     </p>
                                 </div>
                             </div>
 
                             {/* Separar Button and Info */}
                             <div className="p-4 bg-gray-50 rounded-lg border order-3">
                                 <button
                                     disabled
                                     className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-6 rounded-lg cursor-not-allowed"
                                 >
                                     Separar
                                 </button>
                                 <p className="text-xs text-gray-600 text-center mt-2">
                                     La separación en línea se habilitará una vez que tu solicitud de crédito sea aprobada. 
                                 </p>
                             </div>
                             
                             {/* Disclaimer */}
                             <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm order-4">
                                 <p>
                                     <strong>Importante:</strong> La disponibilidad del vehículo no está garantizada hasta la aprobación final. Sin embargo, un crédito pre-aprobado es transferible a cualquier otro auto de nuestro inventario.
                                 </p>
                             </div>
 
                             {/* Confirmation and User Details */}
                             <div className="pt-6 border-t order-5">
                                 <h2 className="text-xl font-bold mb-4">Información de la Solicitud</h2>
                                 <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                                     <div className="bg-green-100 p-2 rounded-full">
                                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                                     </div>
                                     <p className="text-green-800 font-semibold self-center">¡Felicidades! Hemos recibido tu solicitud y se encuentra actualmente en revisión.</p>
                                 </div>
                                 <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                                     <div>
                                         <p className="text-gray-500">Nombre Completo</p>
                                         <p className="font-semibold">{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}</p>
                                     </div>
                                     <div>
                                         <p className="text-gray-500">Email</p>
                                         <p className="font-semibold truncate">{profile?.email}</p>
                                     </div>
                                     <div>
                                         <p className="text-gray-500">Teléfono</p>
                                         <p className="font-semibold">{profile?.phone}</p>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 );
            case 'ready':
                return (
                    <>
                        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
                            <VehicleSelector isOpen={showVehicleSelector} onClose={() => {if(!vehicleInfo?._ordenCompra) navigate('/escritorio')}} onSelect={handleVehicleSelect} />
                        </Suspense>
                        <div className="max-w-4xl mx-auto p-4 sm:p-0 text-gray-900">

                            {vehicleInfo?._vehicleTitle ? (
                                <div className="mb-8 bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <img src={vehicleInfo._featureImage} alt={vehicleInfo._vehicleTitle} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-500">Solicitud de financiamiento para:</p>
                                            <h1 className="text-lg font-bold text-gray-900">{vehicleInfo._vehicleTitle}</h1>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowVehicleSelector(true)} className="flex items-center gap-2 text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1.5 rounded-md hover:bg-primary-100">
                                        <Edit className="w-4 h-4" />
                                        Cambiar Vehículo
                                    </button>
                                </div>
                            ) : (
                                !showVehicleSelector && (
                                    <div className="mb-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                                        <h1 className="text-lg font-bold text-yellow-800">No has seleccionado un vehículo</h1>
                                        <p className="text-sm text-yellow-700 mt-1 mb-4">Tu solicitud se guardará como un borrador general.</p>
                                        <button onClick={() => setShowVehicleSelector(true)} className="text-sm font-semibold text-white bg-primary-600 px-4 py-2 rounded-lg hover:bg-primary-700">
                                            Seleccionar Vehículo
                                        </button>
                                    </div>
                                )
                            )}
                            
                            <div className="mb-10">
                                <StepIndicator steps={steps} currentStep={currentStep} />
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <input type="hidden" {...form.register('ordencompra')} />
                                <div className="bg-white p-8 rounded-xl shadow-sm border">
                                    {currentStep === 0 && <PersonalInfoStep control={control} errors={errors} isMarried={isMarried} profile={profile} setValue={setValue} />}
                                    {currentStep === 1 && <EmploymentStep control={control} errors={errors} setValue={setValue} />}
                                    {currentStep === 2 && <ReferencesStep control={control} errors={errors} />}
                                    {currentStep === 3 && applicationId && user && <DocumentUploadStep applicationId={applicationId} userId={user.id} onDocumentsChange={setUploadedDocuments} />}
                                    {currentStep === 4 && <ConsentStep control={control} errors={errors} setValue={setValue}/>}
                                    {currentStep === 5 && (
                                        <>
                                            <SummaryStep applicationData={getValues()} profile={profile} vehicleInfo={vehicleInfo} bank={recommendedBank} />
                                            {submissionError && (
                                                <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
                                                    <p className="font-semibold">Error al Enviar</p>
                                                    <p className="text-sm mt-1">{submissionError}</p>
                                                    {submissionError.includes("vehículo") && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowVehicleSelector(true)}
                                                            className="mt-3 inline-block bg-primary-600 text-white font-semibold px-4 py-2 rounded-lg text-sm"
                                                        >
                                                            Seleccionar Vehículo
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                
                                {isSubmitDisabled && !form.formState.isSubmitting && currentStep === 5 && (
                                    <div className="mt-4 text-center text-sm text-red-600 p-3 bg-red-50 rounded-lg">
                                        Por favor verifica las secciones anteriores para corregir campos faltantes o con información incorrecta.
                                    </div>
                                )}
                                
                                <div className="mt-8 flex justify-between">
                                    <button type="button" onClick={handlePrev} disabled={currentStep === 0} className="flex items-center gap-2 px-6 py-2.5 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"><ArrowLeft className="w-4 h-4" /> Anterior</button>
                                    {currentStep < steps.length - 1 ? (
                                        <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700">Siguiente <ArrowRight className="w-4 h-4" /></button>
                                    ) : (
                                        <button type="submit" disabled={isSubmitDisabled} className="flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
                                            {form.formState.isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                            {form.formState.isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    </>
                );
        }
    }

    return <div className="min-h-[50vh] flex items-center justify-center">{renderPageContent()}</div>;
};

// --- STEP COMPONENTS ---

const PersonalInfoStep: React.FC<{ control: any, errors: any, isMarried: boolean, profile: Profile | null, setValue: any }> = ({ control, errors, isMarried, profile, setValue }) => {
    const [useDifferentAddress, setUseDifferentAddress] = useState(() => {
        return !(profile?.address && profile.address.length >= 5);
    });

    useEffect(() => {
        const profileAddressIsValid = profile?.address && profile.address.length >= 5;
        if (profileAddressIsValid && !useDifferentAddress) {
            setValue('current_address', profile.address || '');
            setValue('current_colony', profile.colony || '');
            setValue('current_city', profile.city || '');
            setValue('current_state', profile.state || '');
            setValue('current_zip_code', profile.zip_code || '');
        }
    }, [profile, setValue, useDifferentAddress]);

    return (
    <div className="space-y-6">
        <h2 className="text-lg font-semibold">Paso 1: Confirma tus Datos y Domicilio</h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
                Hemos precargado la información de tu perfil. Por favor, revísala y actualízala si es necesario.
                Tu RFC calculado es: <strong className="font-mono">{profile?.rfc || 'N/A'}</strong>
            </p>
        </div>
        
        <div className="space-y-4 p-4 border rounded-lg">
             <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input id="use_different_address_checkbox" type="checkbox" checked={useDifferentAddress} onChange={(e) => setUseDifferentAddress(e.target.checked)} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded" />
                </div>
                <div className="ml-3 text-sm">
                    <label htmlFor="use_different_address_checkbox" className="font-medium text-gray-700">Quiero usar otra dirección para mi solicitud</label>
                    {errors.current_address && useDifferentAddress && <p className="text-red-600 text-xs mt-1">Tu dirección parece incompleta. Por favor, revisa todos los campos.</p>}
                </div>
            </div>
            <p className="text-xs text-gray-500 -mt-2 ml-8">Esta debe ser la dirección de tu domicilio actual.</p>
            
            {useDifferentAddress ? (
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                    <FormInput control={control} name="current_address" label="Calle y Número" error={errors.current_address?.message} />
                    <FormInput control={control} name="current_colony" label="Colonia o Fraccionamiento" error={errors.current_colony?.message} />
                    <FormInput control={control} name="current_city" label="Ciudad" error={errors.current_city?.message} />
                    <FormSelect control={control} name="current_state" label="Estado" options={MEXICAN_STATES} error={errors.current_state?.message} />
                    <FormInput control={control} name="current_zip_code" label="Código Postal" error={errors.current_zip_code?.message} />
                </div>
            ) : (
                <div className="pt-4 border-t text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    <p><strong>Dirección de tu perfil:</strong></p>
                    <p>{profile?.address}, {profile?.colony}, {profile?.city}, {profile?.state} C.P. {profile?.zip_code}</p>
                </div>
            )}
        </div>
        
        <hr className="my-6"/>
        <FormRadio control={control} name="housing_type" label="Tipo de Vivienda" options={['Propia', 'Rentada', 'Familiar']} error={errors.housing_type?.message} />
        <FormRadio control={control} name="grado_de_estudios" label="Grado de Estudios" options={['Primaria', 'Secundaria', 'Preparatoria', 'Licenciatura', 'Posgrado']} error={errors.grado_de_estudios?.message} />
        {isMarried && <FormInput control={control} name="spouse_full_name" label="Nombre Completo del Cónyuge" error={errors.spouse_full_name?.message} />}
        <div>
            <FormRadio control={control} name="dependents" label="Número de Dependientes" options={['0', '1', '2', '3', '4+']} error={errors.dependents?.message} />
            <p className="text-xs text-gray-500 mt-2">Un número menor de dependientes aumenta tus probabilidades de ser aprobado.</p>
        </div>
    </div>
    )
};

const EmploymentStep: React.FC<{ control: any, errors: any, setValue: any }> = ({ control, errors }) => {
    const { field: incomeField } = useController({ name: 'net_monthly_income', control });

    const predefinedIncomeOptions = useMemo(() => ['Menos de $15,000', '$15,000 - $25,000', '$25,001 - $40,000'], []);
    const OTHER_OPTION = 'Otro';
    const allIncomeOptions = useMemo(() => [...predefinedIncomeOptions, OTHER_OPTION], [predefinedIncomeOptions]);
    
    const isOtherSelected = useMemo(() => {
        return incomeField.value && !predefinedIncomeOptions.includes(incomeField.value);
    }, [incomeField.value, predefinedIncomeOptions]);

    const handleOptionClick = (option: string) => {
        if (option === OTHER_OPTION) {
            if (predefinedIncomeOptions.includes(incomeField.value) || !incomeField.value) {
                 incomeField.onChange('');
            }
        } else {
            incomeField.onChange(option);
        }
    };
    
    const formatNumberWithCommas = (value: string): string => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue === '') return '';
        const number = parseInt(numericValue, 10);
        return number.toLocaleString('es-MX');
    };

    const handleCustomIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatNumberWithCommas(e.target.value);
        incomeField.onChange(`$${formattedValue}`);
    };
    
    const customIncomeDisplayValue = isOtherSelected ? (incomeField.value || '').replace(/^\$/, '') : '';

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Información Laboral</h2>
            <FormRadio control={control} name="fiscal_classification" label="Clasificación Fiscal" options={['Empleado del sector privado', 'Física con actividad empresarial', 'Empleado del sector público', 'Pensionado']} error={errors.fiscal_classification?.message} />
            <div className="grid md:grid-cols-2 gap-6">
                <FormInput control={control} name="company_name" label="Nombre de la Empresa" error={errors.company_name?.message} />
                <FormInput control={control} name="company_phone" label="Teléfono de la Empresa" error={errors.company_phone?.message} />
                <FormInput control={control} name="supervisor_name" label="Nombre del Jefe Inmediato" error={errors.supervisor_name?.message} />
                <FormInput control={control} name="company_website" label="Sitio Web (Opcional)" error={errors.company_website?.message} />
            </div>
            <FormInput control={control} name="company_address" label="Dirección de la Empresa" error={errors.company_address?.message} />
            <div className="grid md:grid-cols-2 gap-6">
                <FormInput control={control} name="company_industry" label="Sector o Industria" error={errors.company_industry?.message} />
                <FormInput control={control} name="job_title" label="Nombre de tu Puesto" error={errors.job_title?.message} />
                <FormRadio control={control} name="job_seniority" label="Antigüedad en el Puesto" options={['Menos de 1 año', '1-3 años', '3-5 años', 'Más de 5 años']} error={errors.job_seniority?.message} />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salario Neto Mensual</label>
                    <div className="flex flex-wrap gap-3">
                        {allIncomeOptions.map(opt => {
                             const isSelected = (opt === OTHER_OPTION && isOtherSelected) || incomeField.value === opt;
                             return (
                                <button type="button" key={opt} onClick={() => handleOptionClick(opt)} className={`px-4 py-2 text-sm font-semibold rounded-full border-2 ${isSelected ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400'}`}>{opt}</button>
                            );
                        })}
                    </div>
                     {isOtherSelected && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700">Monto exacto (mayor a $40,000)</label>
                            <div className="relative mt-1">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                <input 
                                    value={customIncomeDisplayValue}
                                    onChange={handleCustomIncomeChange}
                                    placeholder="55,000"
                                    className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-7"
                                    inputMode="numeric"
                                />
                            </div>
                        </div>
                    )}
                    {errors.net_monthly_income && <p className="text-red-600 text-sm mt-1">{errors.net_monthly_income.message}</p>}
                </div>
            </div>
        </div>
    );
};

const ReferencesStep: React.FC<{ control: any, errors: any }> = ({ control, errors }) => (
    <div className="space-y-8">
        <div>
            <h2 className="text-lg font-semibold">Referencia de Amistad</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-4">
                <FormInput control={control} name="friend_reference_name" label="Nombre Completo" error={errors.friend_reference_name?.message} />
                <FormInput control={control} name="friend_reference_phone" label="Teléfono" error={errors.friend_reference_phone?.message} />
            </div>
        </div>
        <div>
            <h2 className="text-lg font-semibold">Referencia Familiar</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-4">
                <FormInput control={control} name="family_reference_name" label="Nombre Completo" error={errors.family_reference_name?.message} />
                <FormInput control={control} name="family_reference_phone" label="Teléfono" error={errors.family_reference_phone?.message} />
                <FormInput control={control} name="parentesco" label="Parentesco" error={errors.parentesco?.message} />
            </div>
        </div>
    </div>
);

const DocumentRequirements: React.FC = () => (
    <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-md font-semibold text-gray-800 mb-3">Declaraciones*</h3>
        <p className="text-xs text-gray-600 mb-4">Por favor, asegúrate de que tus documentos cumplan con los siguientes requisitos:</p>
        <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Ambos lados de mi INE son nítidas (no borrosas), legibles en su totalidad, sin reflejos de luz, con las cuatro esquinas visibles y en un fondo que contraste.</span>
            </li>
            <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>El comprobante de domicilio fue escaneado o cargado en formato PDF, con las cuatro esquinas visibles, es 100% legible y coincide con los datos de mi solicitud.</span>
            </li>
            <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span>Cargué 3 estados de cuenta o recibos de nómina, en formato PDF (o una carpeta comprimida ZIP), para cada uno de los últimos 3 meses ( 3 PDFs distintos en total, cargar solamente uno puede causar retrasos en tu solicitud).</span>
            </li>
        </ul>
    </div>
);

const DocumentUploadStep: React.FC<{ applicationId: string; userId: string; onDocumentsChange: (docs: Record<string, UploadedDocument[]>) => void; }> = ({ applicationId, userId, onDocumentsChange }) => {
    const [uploadedDocuments, setUploadedDocuments] = useState<Record<string, UploadedDocument[]>>({});
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!userId || !applicationId) return;
            setIsLoadingDocs(true);
            try {
                const docs = await DocumentService.listDocuments(userId, applicationId);
                const docsMap = docs.reduce((acc, doc) => {
                    if (doc.documentType) {
                        if (!acc[doc.documentType]) acc[doc.documentType] = [];
                        acc[doc.documentType].push(doc);
                    }
                    return acc;
                }, {} as Record<string, UploadedDocument[]>);
                setUploadedDocuments(docsMap);
                onDocumentsChange(docsMap);
            } catch (error) {
                console.error("Error fetching documents:", error);
            } finally {
                setIsLoadingDocs(false);
            }
        };
        fetchDocuments();
    }, [userId, applicationId, onDocumentsChange]);
    
        const handleFileUploaded = (doc: UploadedDocument) => {
            const newDocs = { 
                ...uploadedDocuments, 
                [doc.documentType]: [...(uploadedDocuments[doc.documentType] || []), doc] 
            };
            setUploadedDocuments(newDocs);
            onDocumentsChange(newDocs);
        };

        const handleFileDeleted = (documentId: string, documentType: string) => {
            const newDocs = {
                ...uploadedDocuments,
                [documentType]: (uploadedDocuments[documentType] || []).filter(d => d.id !== documentId)
            };
            setUploadedDocuments(newDocs);
            onDocumentsChange(newDocs);
        };

    const requiredDocuments = [
        { type: 'ine_front', label: 'INE (Frente)', allowCameraScan: true },
        { type: 'ine_back', label: 'INE (Reverso)', allowCameraScan: true },
        { type: 'proof_address', label: 'Comprobante de Domicilio', allowCameraScan: false },
        { type: 'proof_income', label: 'Comprobante de Ingresos', description: 'Sube tus 3 estados de cuenta o recibos de nómina más recientes (3 archivos PDF distintos). También puedes subir un solo archivo .ZIP con todos los documentos. Máximo 12 archivos.', allowCameraScan: false, multiple: true, maxFiles: 12, maxTotalSizeMB: 10 }
    ];

    if (isLoadingDocs) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>;
    }
    
    return (
        <div className="space-y-6">
            <h2 className="text-lg font-semibold">Carga de Documentos</h2>
            <p className="text-sm text-gray-600">Sube tus documentos para agilizar tu solicitud. Puedes tomar una foto o subir un archivo. Comprobantes de ingresos (debes cargar 3 PDFs)* No se aceptan imágenes o capturas. Por favor adjunta 3 archivos distintos en formato PDF (o un folder comprimido.zip) que descargas desde la aplicación de tu banca móvil.</p>
            <div className="grid md:grid-cols-2 gap-6">
                {requiredDocuments.map(doc => (
                    <div key={doc.type} className={doc.multiple ? "md:col-span-2" : ""}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{doc.label}</label>
                        {doc.description && <p className="text-xs text-gray-500 mb-2">{doc.description}</p>}
                        <FileUpload 
                            onFileSelect={() => {}}
                            onFileUpload={handleFileUploaded}
                            onFileDelete={handleFileDeleted}
                            accept=".pdf,.jpg,.jpeg,.png,.zip" 
                            enableWordPressUpload={true} 
                            applicationId={applicationId} 
                            documentType={doc.type} 
                            userId={userId} 
                            allowCameraScan={doc.allowCameraScan}
                            existingDocuments={uploadedDocuments[doc.type] || []}
                            multiple={doc.multiple}
                            maxFiles={doc.maxFiles}
                            maxTotalSizeMB={doc.maxTotalSizeMB}
                        />
                    </div>
                ))}
            </div>
            <DocumentRequirements />
        </div>
    );
};

const declarations = [
    "Confirmo que la información que he proporcionado es correcta y completa.",
    "Autorizo a TREFA a compartir mi solicitud con las instituciones financieras necesarias para encontrar la mejor opción de crédito para mí.",
    "Entiendo que se consultará mi historial crediticio para evaluar mi solicitud.",
    "Acepto que TREFA me contacte por los medios proporcionados para dar seguimiento a mi solicitud.",
    "He leído y acepto el Aviso de Privacidad de TREFA.",
    "Comprendo que el envío de esta solicitud no garantiza la aprobación del crédito, la cual depende del análisis de la institución financiera.",
    "Confirmo que soy mayor de edad y tengo capacidad legal para realizar esta solicitud."
];

const ConsentStep: React.FC<{ control: any, errors: any, setValue: any }> = ({ control, errors}) => (
    <div className="space-y-6">
        <h2 className="text-xl font-semibold">Declaraciones Finales</h2>
        <p className="text-sm text-gray-600">Al continuar, expreso y certifico haber leído, aceptado o estar de acuerdo con cada una de las siguientes cláusulas:</p>
        <ul className="space-y-3 list-disc list-inside text-gray-700 text-sm pl-4">
            {declarations.map((declaration, index) => (
                <li key={index}>{declaration}</li>
            ))}
        </ul>
        <hr className="my-6"/>
        <FormCheckbox 
            control={control} 
            name="terms_and_conditions" 
            label="He leído y estoy de acuerdo con los términos y condiciones" 
            error={errors.terms_and_conditions?.message} 
        />
        <hr className="my-6"/>
        <FormCheckbox 
            control={control} 
            name="consent_survey" 
            label="Sí, me gustaría recibir un cupón promocional a cambio de responder una breve encuesta por correo electrónico después de enviar mi solicitud." 
        />
    </div>
);

const SummaryStep: React.FC<{ applicationData: any, profile: Profile | null, vehicleInfo: any, bank: string | null }> = ({ applicationData, profile, vehicleInfo, bank }) => (
    <div className="space-y-8">
        <h2 className="text-xl font-semibold text-center">Revisa y Envía tu Solicitud</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                {vehicleInfo?._featureImage && <img src={vehicleInfo._featureImage} alt={vehicleInfo._vehicleTitle} className="rounded-lg shadow-md aspect-video object-cover" />}
                <div className="mt-4 space-y-2">
                    <ReviewItem label="Vehículo" value={vehicleInfo?._vehicleTitle} isLarge={true}/>
                    <ReviewItem label="Banco Recomendado" value={bank} isLarge={true}/>
                </div>
            </div>
            <div className="md:col-span-2 space-y-4">
                <SummarySection title="Datos Personales" icon={User}>
                    <ReviewItem label="Nombre Completo" value={`${profile?.first_name || ''} ${profile?.last_name || ''} ${profile?.mother_last_name || ''}`} />
                    <ReviewItem label="Email" value={profile?.email} />
                    <ReviewItem label="Teléfono" value={profile?.phone} />
                    <ReviewItem label="RFC" value={profile?.rfc} />
                    
                    <ReviewItem label="Dirección" value={`${applicationData.current_address}, ${applicationData.current_colony}, ${applicationData.current_city}, ${applicationData.current_state}, C.P. ${applicationData.current_zip_code}`} />
                </SummarySection>
                <SummarySection title="Datos Laborales" icon={Building2}>
                    
                    <ReviewItem label="Clasificación Fiscal" value={applicationData.fiscal_classification} />
                    
                    <ReviewItem label="Empresa" value={applicationData.company_name} />
                    
                    <ReviewItem label="Puesto" value={applicationData.job_title} />
                    
                    <ReviewItem label="Ingreso Neto" value={applicationData.net_monthly_income} />
                </SummarySection>
            </div>
        </div>
    </div>
);


// --- FORM HELPER COMPONENTS ---

const FormInput: React.FC<{control: any, name: any, label: string, error?: string}> = ({ control, name, label, error }) => (
    <Controller name={name} control={control} render={({ field }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input {...field} className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500" />
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    )} />
);
const FormSelect: React.FC<{ control: any, name: any, label: string, options: string[], error?: string }> = ({ control, name, label, options, error }) => (
    <Controller name={name} control={control} render={({ field }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select {...field} className="mt-1 block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500">
                <option value="">Seleccionar...</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    )} />
);
const FormRadio: React.FC<{control: any, name: any, label: string, options: string[], error?: string}> = ({ control, name, label, options, error }) => (
    <Controller name={name} control={control} render={({ field }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
            <div className="flex flex-wrap gap-3">
                {options.map(opt => (
                    <button type="button" key={opt} onClick={() => field.onChange(opt)} className={`px-4 py-2 text-sm font-semibold rounded-full border-2 ${field.value === opt ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400'}`}>{opt}</button>
                ))}
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
        </div>
    )} />
);
const FormCheckbox: React.FC<{ control: any, name: any, label: string, error?: string, onChange?: (e: any) => void, checked?: boolean, disabled?: boolean }> = ({ control, name, label, error, onChange, checked, disabled }) => (
    <Controller name={name} control={control} render={({ field }) => (
        <div className="flex items-start">
            <div className="flex items-center h-5">
                
                <input id={name} type="checkbox" checked={checked ?? (field.value || false)} onChange={onChange ?? field.onChange} disabled={disabled} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded disabled:opacity-50" />
            </div>
            <div className="ml-3 text-sm">
                <label htmlFor={name} className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}{error && <span className="text-red-500">*</span>}</label>
                {error && <p className="text-red-600 mt-1">{error}</p>}
            </div>
        </div>
    )} />
);
const ReviewItem: React.FC<{label: string, value: any, isLarge?: boolean}> = ({label, value, isLarge}) => (
    <div className="py-2 border-b border-gray-100 last:border-b-0">
        <p className={` ${isLarge ? 'text-sm' : 'text-xs'} text-gray-500`}>{label}</p>
        <p className={`font-semibold ${isLarge ? 'text-lg text-primary-600' : 'text-base text-gray-800'}`}>{value || 'N/A'}</p>
    </div>
);
const SummarySection: React.FC<{title: string, icon: React.ElementType, children: React.ReactNode}> = ({title, icon: Icon, children}) => (
    <div className="bg-gray-50 p-4 rounded-lg border">
        <h3 className="font-semibold text-gray-700 mb-2 flex items-center"><Icon className="w-4 h-4 mr-2 text-primary-600" />{title}</h3>
        <div className="space-y-1">{children}</div>
    </div>
);

export default Application;