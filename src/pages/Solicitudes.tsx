import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Clock, 
  Loader2, 
  AlertTriangle, 
  FileText, 
  Download, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  ArrowLeft,
  Plus
} from 'lucide-react';
import { ApplicationService } from '../services/ApplicationService';
import { useAuth } from '../context/AuthContext';
import PrintableApplication from '../components/PrintableApplication';
import { UserDataService } from '../services/UserDataService';
import { PrintIcon, WhatsAppIcon } from '../components/icons';
import { BankProfilingService } from '../services/BankProfilingService';
import { checkApplicationProfileCompleteness } from '../components/AuthHandler';

import VehicleCarousel from '../components/VehicleCarousel';
import ValuationWidget from '../components/ValuationWidget';
import CircularProgress from '../components/CircularProgress';
import VerticalStepper from '../components/VerticalStepper';
import ApplicationCard from '../components/ApplicationCard';
import OnboardingModal from '../components/OnboardingModal';
import { supabase } from '../../supabaseClient';

interface ApplicationData {
  id: string;
  status: 'draft' | 'submitted' | 'reviewing' | 'pending_docs' | 'approved' | 'rejected';
  created_at: string;
  car_info: any;
  personal_info_snapshot: any;
  selected_banks: string[];
  application_data: any;
}

const statusMap = {
    draft: { text: "Borrador", icon: FileText, color: "text-gray-500", bgColor: "bg-gray-100" },
    submitted: { text: "Enviada", icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100" },
    reviewing: { text: "En Revisión", icon: Clock, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    pending_docs: { text: "Documentos Pendientes", icon: FileText, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    approved: { text: "Aprobada", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
    rejected: { text: "Rechazada", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100" },
};

const ApplicationDetailView: React.FC<{ application: ApplicationData }> = ({ application }) => {
    const { text, icon: Icon, color, bgColor } = statusMap[application.status] || statusMap.draft;
    const profile = application.personal_info_snapshot || {};
    const carInfo = application.car_info || {};

    const getStatusDescription = () => {
        switch(application.status) {
            case 'submitted':
            case 'reviewing':
                return `¡Felicidades, ${profile.first_name}! Hemos recibido tu solicitud y nuestro equipo ya la está revisando. Normalmente, recibirás una respuesta en las próximas 24 horas hábiles.`;
            case 'pending_docs':
                return 'Hemos revisado tu solicitud, pero necesitamos que subas algunos documentos para continuar. Por favor, ve a tu dashboard para completar este paso.';
            case 'approved':
                return '¡Excelentes noticias! Tu solicitud de financiamiento ha sido aprobada. Un asesor se pondrá en contacto contigo para coordinar los siguientes pasos.';
            case 'rejected':
                return 'Después de una revisión cuidadosa, no pudimos aprobar tu solicitud en este momento. Te invitamos a contactar a un asesor para explorar otras opciones.';
            default:
                return 'Este es un borrador de tu solicitud. Puedes continuar editándola cuando quieras.';
        }
    };

    return (
        <>
            <div className="space-y-8 no-print">
                <div className={`p-6 rounded-xl text-center ${bgColor}`}>
                    <Icon className={`w-16 h-16 ${color} mx-auto mb-4`} />
                    <h2 className={`text-2xl font-bold ${color}`}>{text}</h2>
                    <p className="text-gray-500 mt-1">Solicitud #{application.id.substring(0, 8)}...</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="p-6 bg-white rounded-xl shadow-sm border">
                            <h3 className="font-bold text-gray-800">Resumen y Próximos Pasos</h3>
                            <p className="text-sm text-gray-600 mt-2">{getStatusDescription()}</p>
                        </div>

                        {carInfo._vehicleTitle && (
                            <div className="p-6 bg-white rounded-xl shadow-sm border">
                                <h3 className="font-bold text-gray-800 mb-4">Vehículo en tu Solicitud</h3>
                                <div className="flex items-center gap-4">
                                    <img src={carInfo._featureImage} alt={carInfo._vehicleTitle} className="w-24 h-20 object-cover rounded-md flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{carInfo._vehicleTitle}</h4>
                                        <p className="text-sm text-gray-500">Orden de Compra: {carInfo._ordenCompra}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6 lg:sticky lg:top-24">
                        <div className="p-6 bg-white rounded-xl shadow-sm border">
                            <h3 className="font-bold text-gray-800 mb-4">Acciones</h3>
                            <div className="space-y-3">
                                <a href={`https://wa.me/5218187049079?text=Hola,%20quisiera%20dar%20seguimiento%20a%20mi%20solicitud%20${application.id.substring(0,8)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 text-white font-semibold text-sm rounded-lg hover:bg-green-600 transition-colors">
                                    <WhatsAppIcon className="w-5 h-5" /> Contactar Asesor
                                </a>
                                <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-600 text-white font-semibold text-sm rounded-lg hover:bg-gray-700 transition-colors">
                                    <PrintIcon className="w-5 h-5" /> Imprimir / Guardar PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="print-only">
                <PrintableApplication application={application} />
            </div>
        </>
    );
};


const SolicitudesPage: React.FC = () => {
  const { id: applicationIdFromUrl } = useParams<{ id: string }>();
  const { user, profile, loading: userLoading } = useAuth();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [actionError, setActionError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [isBankProfileComplete, setIsBankProfileComplete] = useState(false);
  const [hasActiveApplication, setHasActiveApplication] = useState(false);
  const [isDocumentSubmissionComplete, setIsDocumentSubmissionComplete] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleCompleteOnboarding = async () => {
    if (user) {
      try {
        await supabase.rpc('complete_user_onboarding', { p_user_id: user.id });
      } catch (error) {
        console.error('Error updating onboarding status:', error);
      }
    }
    setShowOnboarding(false);
  };

  const loadData = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);
    try {
        const [userApps, bankProfileStatus] = await Promise.all([
            ApplicationService.getUserApplications(user.id),
            BankProfilingService.isBankProfileComplete(user.id),
        ]);

        if (profile) {
            const [profileComplete, activeApplicationStatus] = await Promise.all([
                checkApplicationProfileCompleteness(profile),
                ApplicationService.hasActiveApplication(user.id)
            ]);
            setIsProfileComplete(profileComplete);
            setHasActiveApplication(activeApplicationStatus);

            let docsComplete = false;
            if (activeApplicationStatus) {
                const latestApplication = userApps.find(app => app.status === 'submitted' || app.status === 'pending_docs' || app.status === 'approved');
                if (latestApplication && latestApplication.status === 'submitted') {
                    docsComplete = true;
                }
            }
            setIsDocumentSubmissionComplete(docsComplete);

            if (!profile.has_completed_onboarding) {
                setShowOnboarding(true);
            }
        }
        
        setApplications(userApps as ApplicationData[]);
        setIsBankProfileComplete(bankProfileStatus);

    } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        setError('No se puede verificar el estado de las solicitudes existentes.');
    } finally {
        setLoading(false);
    }
  }, [user?.id, profile]);

  useEffect(() => {
    if (!userLoading && user) {
        loadData();
    } else if (!userLoading && !user) {
        setLoading(false);
    }
  }, [user, userLoading, loadData]);

  const handleDownloadData = async () => {
    if (!user) return;
    setActionStatus('loading');
    setActionError('');
    try {
        await UserDataService.downloadUserData(user.id);
        setActionStatus('success');
    } catch(e: any) {
        setActionStatus('idle');
        setActionError(e.message || 'Error al descargar los datos.');
    }
    setTimeout(() => setActionStatus('idle'), 3000);
  };

  const handleDeleteData = async () => {
    if (!user) return;
    setActionStatus('loading');
    setActionError('');
    try {
        await UserDataService.deleteSensitiveData(user.id);
        setActionStatus('success');
        setIsModalOpen(false);
    } catch(e: any) {
        setActionStatus('idle');
        setActionError(e.message || 'Error al eliminar los datos.');
    }
     setTimeout(() => setActionStatus('idle'), 3000);
  };

  const completionPercentage = useMemo(() => {
    const steps = [isProfileComplete, isBankProfileComplete, hasActiveApplication, isDocumentSubmissionComplete];
    const completedSteps = steps.filter(Boolean).length;
    return (completedSteps / steps.length) * 100;
  }, [isProfileComplete, isBankProfileComplete, hasActiveApplication, isDocumentSubmissionComplete]);

  if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
  if (error) return <div className="p-4 bg-red-100 text-red-800 rounded-md"><AlertTriangle className="inline w-5 h-5 mr-2"/>{error}</div>;

  const currentApplication = applicationIdFromUrl ? applications.find(a => a.id === applicationIdFromUrl) : null;

  return (
      <div className="max-w-7xl mx-auto">
          {showOnboarding && <OnboardingModal onClose={handleCompleteOnboarding} />}
          <div className="space-y-8">
          {applicationIdFromUrl ? (
              <div>
                  <Link to="/escritorio/seguimiento" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold no-print">
                      <ArrowLeft className="w-4 h-4" />
                      Volver a Mis Solicitudes
                  </Link>
                  <div className="mt-6">
                      {currentApplication ? <ApplicationDetailView application={currentApplication} /> : <p>Solicitud no encontrada.</p>}
                  </div>
              </div>
          ) : (
              <>
                  <div>
                      <h1 className="text-2xl font-bold text-gray-900">Resumen de Actividad</h1>
                      <p className="mt-1 text-gray-600">Tu progreso, solicitudes y herramientas en un solo lugar.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-center">
                      <CircularProgress progress={completionPercentage} />
                    </div>
                    <div className="md:col-span-2">
                      <VerticalStepper
                        profileComplete={isProfileComplete}
                        bankProfileComplete={isBankProfileComplete}
                        applicationComplete={hasActiveApplication}
                        documentsComplete={isDocumentSubmissionComplete}
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Aplicaciones</h2>
                      <div className="space-y-4">
                          {applications.length > 0 ? applications.map(app => (
                              <ApplicationCard
                                  key={app.id}
                                  application={{
                                      id: app.id,
                                      bank: Array.isArray(app.selected_banks) && app.selected_banks.length > 0 ? app.selected_banks.map((b: string) => b.charAt(0).toUpperCase() + b.slice(1)).join(', ') : 'Varios',
                                      type: 'Financiamiento',
                                      status: app.status,
                                      date: app.created_at,
                                      vehicle: app.car_info?._vehicleTitle || 'Auto no especificado'
                                  }}
                              />
                          )) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white rounded-xl p-8 text-center flex flex-col justify-center">
                                <h3 className="text-lg font-semibold text-gray-900">Inicia tu primera solicitud</h3>
                                <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                                  Estás a un paso de estrenar tu próximo auto.
                                </p>
                                <div className="mt-6">
                                  <Link
                                    to="/escritorio/aplicacion"
                                    className="inline-flex items-center px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Crear Nueva Solicitud
                                  </Link>
                                </div>
                              </div>
                              <ValuationWidget />
                            </div>
                          )}
                      </div>
                  </div>

                  <div className="w-full">
                    <VehicleCarousel isBankProfileComplete={isBankProfileComplete} />
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Gestión de Datos Personales</h2>
                      <p className="text-sm text-gray-600 mb-6">En cumplimiento con la Ley Federal de Protección de Datos, tienes control total sobre tu información.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-gray-50 p-4 rounded-lg border">
                              <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Download className="w-5 h-5"/>Descargar mis datos</h3>
                              <p className="text-xs text-gray-500 mt-1 mb-3">Obtén una copia de toda tu información de perfil y solicitudes en formato JSON.</p>
                              <button onClick={handleDownloadData} disabled={actionStatus==='loading'} className="w-full text-sm font-semibold py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60">
                                  {actionStatus === 'loading' ? 'Preparando...' : 'Descargar Información'}
                              </button>
                          </div>
                          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                              <h3 className="font-semibold text-red-800 flex items-center gap-2"><Trash2 className="w-5 h-5"/>Eliminar datos sensibles</h3>
                              <p className="text-xs text-red-700 mt-1 mb-3">Elimina permanentemente tus documentos e información personal identificable.</p>
                              <button onClick={() => setIsModalOpen(true)} className="w-full text-sm font-semibold py-2 px-4 rounded-md bg-red-600 text-white hover:bg-red-700">
                                  Eliminar Datos
                              </button>
                          </div>
                      </div>
                      {actionStatus === 'success' && <p className="mt-4 text-center text-sm text-green-600 flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5"/>¡Acción completada con éxito!</p>}
                      {actionError && <p className="mt-4 text-center text-sm text-red-600">{actionError}</p>}
                  </div>

                  {isModalOpen && (
                      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 text-center">
                              <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4"/>
                              <h2 className="text-xl font-bold text-gray-900">¿Estás seguro?</h2>
                              <p className="text-gray-600 mt-2 text-sm">Esta acción es irreversible. Se eliminarán todos tus documentos (INE, comprobantes) y datos personales sensibles (dirección, RFC, etc.) de nuestros registros.</p>
                              <p className="text-gray-600 mt-2 text-sm"><strong>Tu cuenta no será eliminada,</strong> pero si deseas aplicar a un financiamiento en el futuro, deberás volver a proporcionar toda tu información.</p>
                              <div className="mt-6 flex justify-center gap-4">
                                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300">Cancelar</button>
                                  <button onClick={handleDeleteData} disabled={actionStatus==='loading'} className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60">
                                      {actionStatus==='loading' ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Sí, eliminar mis datos'}
                                  </button>
                              </div>
                          </div>
                      </div>
                  )}
              </>
          )}
      </div>
    </div>
  );
};

export default SolicitudesPage;