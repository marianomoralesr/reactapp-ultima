import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Plus,
  Building2,
  AlertTriangle,
  Loader2,
  History,
  User,
  ArrowRight,
  X,
  Trash2,
  FileEdit
} from 'lucide-react';
// FIX: Changed single quotes to double quotes to address potential module resolution issues.
import { Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { ApplicationService } from '../services/ApplicationService';
import FinancialProjection from '../components/FinancialProjection';
import VehicleCarousel from '../components/VehicleCarousel';
import ApplicationCard from '../components/ApplicationCard';
import DocumentUploadSection from '../components/DocumentUploadSection';
import { BankProfilingService } from '../services/BankProfilingService';
import type { Profile } from '../types/types';
import { FileTextIcon, DownloadIcon } from '../components/icons';
import OnboardingModal from '../components/OnboardingModal';
import { proxyImage } from '../utils/proxyImage';


// New Survey Component
const SurveyInvitation: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="relative bg-gradient-to-r from-trefa-blue to-indigo-600 text-white rounded-xl p-6 overflow-hidden shadow-lg">
        <div className="relative z-10">
            <h3 className="font-bold text-lg">Ayúdanos a mejorar y obtén beneficios</h3>
            <p className="text-sm mt-1 text-white/80 max-w-2xl">
                Responde una breve encuesta sobre tu experiencia y recibe un bono especial para tu próxima compra o financiamiento. ¡Solo te tomará 3 minutos!
            </p>
            <div className="mt-4">
                <a 
                    href="https://trefa-buyer-persona-survey-analytics-898935312460.us-west1.run.app/#/survey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2 bg-white text-trefa-blue font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors shadow-md"
                >
                    Realizar Encuesta <ArrowRight className="w-4 h-4 ml-2" />
                </a>
            </div>
        </div>
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/60 hover:text-white/90 rounded-full hover:bg-white/20 transition-colors z-20"
            aria-label="Cerrar invitación"
        >
            <X className="w-5 h-5" />
        </button>
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full opacity-50 z-0"></div>
        <div className="absolute top-0 right-10 w-24 h-24 bg-white/5 rounded-full opacity-30 z-0"></div>
    </div>
);

const BetaSurveyInvitation: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-6 overflow-hidden shadow-lg">
        <div className="relative z-10">
            <h3 className="font-bold text-lg">¿Probando el nuevo sitio? Danos tu feedback</h3>
            <p className="text-sm mt-1 text-white/80 max-w-2xl">
                Tu opinión es clave para mejorar. Responde esta encuesta sobre tu experiencia con la nueva versión de la plataforma.
            </p>
            <div className="mt-4">
                <Link 
                    to="/beta-v.0.1"
                    className="inline-flex items-center px-5 py-2 bg-white text-indigo-700 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors shadow-md"
                >
                    Dar mi opinión <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
        </div>
        <button 
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/60 hover:text-white/90 rounded-full hover:bg-white/20 transition-colors z-20"
            aria-label="Cerrar invitación de encuesta beta"
        >
            <X className="w-5 h-5" />
        </button>
        {/* Decorative elements */}
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full opacity-50 z-0"></div>
        <div className="absolute top-0 right-10 w-20 h-20 bg-white/5 rounded-full opacity-30 z-0"></div>
    </div>
);

const OnboardingGuide: React.FC<{ profile: Profile | null, isBankProfileComplete: boolean }> = ({ profile, isBankProfileComplete }) => {
    const requiredFields: (keyof Profile)[] = ['first_name', 'last_name', 'mother_last_name', 'phone', 'birth_date', 'homoclave', 'fiscal_situation', 'civil_status', 'address', 'city', 'state', 'zip_code', 'rfc'];
    const isProfileComplete = requiredFields.every(field => profile?.[field] && String(profile[field]).trim() !== '');

    if (isProfileComplete && isBankProfileComplete) {
        return null; // Don't show if everything is done.
    }

    let title, description, linkTo, linkText, Icon;

    if (!isProfileComplete) {
        title = "Paso 1: Completa tu Perfil";
        description = "Necesitamos tu información personal para poder calcular tu RFC y preparar tus solicitudes.";
        linkTo = "/escritorio/profile";
        linkText = "Ir a Mi Perfil";
        Icon = User;
    } else {
        title = "Paso 2: Perfilamiento Bancario";
        description = "¡Excelente! Ahora completa tu perfil bancario para que podamos encontrar la mejor opción de crédito para ti.";
        linkTo = "/escritorio/profile?tab=perfil-bancario";
        linkText = "Comenzar Perfilación";
        Icon = Building2;
    }

    return (
        <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl border-2 border-primary-200 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8" />
            </div>
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-bold text-primary-900">{title}</h3>
                <p className="text-sm text-primary-800 mt-1">{description}</p>
            </div>
            <Link
                to={linkTo}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md flex-shrink-0"
            >
                {linkText} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
        </div>
    );
};

const EbookCta: React.FC = () => (
    <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl p-6 overflow-hidden shadow-lg">
        <div className="relative z-10">
            <div className="flex-shrink-0">
                <FileTextIcon className="w-12 h-12 text-white/80" />
            </div>
            <div className="flex-grow text-center md:text-left">
                <h3 className="font-bold text-lg">¿Pensando en vender tu auto?</h3>
                <p className="text-sm mt-1 text-white/90 max-w-2xl">
                    La información de calidad puede ahorrarte muchos dolores de cabeza, y queremos que la tengas.
                </p>
            </div>
            <div className="flex-shrink-0 mt-4 md:mt-0">
                <a 
                    href="/public/manual-venta-TREFA.pdf"
                    download="Manual-Venta-TREFA-2025.pdf"
                    className="inline-flex items-center px-5 py-2.5 bg-white text-green-700 font-bold rounded-lg text-sm hover:bg-gray-100 transition-colors shadow-md"
                >
                    Descargar Manual 2025 <DownloadIcon className="w-4 h-4 ml-2" />
                </a>
            </div>
        </div>
    </div>
);


const Dashboard: React.FC = () => {
  const { user, profile, loading: userLoading } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBankProfileComplete, setIsBankProfileComplete] = useState(false);
  const [isSurveyVisible, setIsSurveyVisible] = useState(true);
  const [isBetaSurveyVisible, setIsBetaSurveyVisible] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const loadData = async () => {
    if (!user?.id) return;
    
    setAppsLoading(true);
    setError(null);
    try {
        const [userApps, bankProfileStatus] = await Promise.all([
            ApplicationService.getUserApplications(user.id),
            BankProfilingService.isBankProfileComplete(user.id)
        ]);
        setApplications(userApps);
        setIsBankProfileComplete(bankProfileStatus);
    } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        setError(error.message || 'Ocurrió un error al cargar la información.');
    } finally {
        setAppsLoading(false);
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
        loadData();

        // Check if user has completed onboarding
        if (profile && !profile.has_completed_onboarding) {
          setShowOnboarding(true);
        }
    } else if (!userLoading && !user) {
        setAppsLoading(false);
    }
  }, [user, userLoading, profile]);
  
  const drafts = useMemo(() => applications.filter(app => app.status === 'draft'), [applications]);
  const submittedApps = useMemo(() => applications.filter(app => app.status !== 'draft'), [applications]);

  const handleDeleteDraft = async (draftId: string) => {
    if (!user || !window.confirm('¿Estás seguro de que quieres eliminar este borrador? Esta acción no se puede deshacer.')) return;
    try {
        await ApplicationService.deleteApplication(draftId, user.id);
        setApplications(prev => prev.filter(app => app.id !== draftId));
    } catch (e: any) {
        setError(e.message || 'No se pudo eliminar el borrador.');
    }
  };

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false);
    if (!user?.id) return;

    try {
      const { error } = await (await import('../../supabaseClient')).supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', user.id);

      if (error) console.error('Error updating onboarding status:', error);
    } catch (e) {
      console.error('Failed to mark onboarding as complete:', e);
    }
  };


  const userName = profile?.first_name || 'Usuario';
  
  const activeApplicationForDocs = applications
    .filter(app => ['submitted', 'reviewing', 'pending_docs'].includes(app.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (appsLoading || userLoading) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-red-200 max-w-lg mx-auto mt-10">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Error al Cargar</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Intentar de Nuevo
        </button>
      </div>
    );
  }

  return (
    <>
      {showOnboarding && <OnboardingModal onClose={handleCompleteOnboarding} />}
      <div className="space-y-8 lg:ml-6 lg:pl-6 text-neutral-800 max-w-full overflow-x-hidden">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800 ">Bienvenido a tu Escritorio, {userName}</h1>
          <p className="mt-1 text-neutral-600">Administra tus solicitudes y explora opciones de financiamiento.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8 lg:pl-5">
            <OnboardingGuide profile={profile} isBankProfileComplete={isBankProfileComplete} />

             {submittedApps.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <History className="w-5 h-5 mr-3 text-primary-600" />
                            Mis Solicitudes Enviadas
                        </h3>
                         <Link
                            to="/escritorio/aplicacion"
                            className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition-colors"
                         >
                            <Plus className="w-4 h-4 mr-1" />
                            Nueva Solicitud
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {submittedApps.map(app => (
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
                        ))}
                    </div>
                </div>
            ) : (
                drafts.length === 0 && (
                    <div className="relative rounded-xl border-2 border-dashed border-orange-200 p-8 text-center overflow-hidden bg-orange-50">
                      <div 
                        className="absolute inset-0 bg-repeat opacity-10" 
                        style={{ backgroundImage: `url(${proxyImage('http://5.183.8.48/wp-content/uploads/2024/09/circulos-naranjas-trefa-fondo.png')})` }}>
                      </div>
                      <div className="relative">
                        <CreditCard className="w-10 h-12 text-primary-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-primary-900 mb-2">¡Bienvenido a TREFA!</h3>
                        <p className="text-primary-800 mb-6">
                          Comienza tu proceso de financiamiento automotriz.
                        </p>
                        <Link
                          to="/escritorio/aplicacion"
                          className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Solicitar Financiamiento
                        </Link>
                      </div>
                    </div>
                )
            )}
            
            {activeApplicationForDocs && (
                <DocumentUploadSection 
                    applicationId={activeApplicationForDocs.id}
                    applicationStatus={activeApplicationForDocs.status}
                />
            )}
            
            <FinancialProjection />
            
            {/* Surveys on Mobile */}
            <div className="lg:hidden space-y-8">
                {isSurveyVisible && <SurveyInvitation onClose={() => setIsSurveyVisible(false)} />}
                {isBetaSurveyVisible && <BetaSurveyInvitation onClose={() => setIsBetaSurveyVisible(false)} />}
                { <EbookCta /> }
            </div>

            <VehicleCarousel isBankProfileComplete={isBankProfileComplete} />
        </div>

        {/* Sidebar Column (Desktop) */}
        <aside className="hidden lg:block lg:col-span-1 space-y-8">
            {drafts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                        <FileEdit className="w-5 h-5 mr-3 text-primary-600" />
                        Borradores de Solicitud
                    </h3>
                    <div className="space-y-4">
                        {drafts.map(draft => (
                            <div key={draft.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <p className="font-semibold text-gray-800">{draft.car_info?._vehicleTitle || 'Borrador sin auto seleccionado'}</p>
                                    <p className="text-xs text-gray-500 mt-1">Última modificación: {new Date(draft.updated_at).toLocaleDateString('es-MX')}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Link to={`/escritorio/aplicacion/${draft.id}`} className="px-3 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                        Continuar
                                    </Link>
                                    <button onClick={() => handleDeleteDraft(draft.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {isSurveyVisible && <SurveyInvitation onClose={() => setIsSurveyVisible(false)} />}
            {isBetaSurveyVisible && <BetaSurveyInvitation onClose={() => setIsBetaSurveyVisible(false)} />}
            { <EbookCta /> }
        </aside>
      </div>
    </div>
    </>
  );
};

export default Dashboard;
