import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
// FIX: Corrected casing for 'ApplicationService' import to match filename and resolve module resolution conflicts.
import { ApplicationService } from '../services/ApplicationService';
import { UserDataService } from '../services/UserDataService';
// FIX: Import the X icon from lucide-react.
import { Loader2, AlertTriangle, FileText, Download, Trash2, Eye, ShieldAlert, CheckCircle, X, Clock } from 'lucide-react';
import PrintableApplication from '../components/PrintableApplication';

const statusMap = {
    draft: { text: "Borrador", icon: FileText, color: "text-gray-500", bgColor: "bg-gray-100" },
    submitted: { text: "Enviada", icon: Clock, color: "text-blue-600", bgColor: "bg-blue-100" },
    reviewing: { text: "En Revisión", icon: Clock, color: "text-indigo-600", bgColor: "bg-indigo-100" },
    pending_docs: { text: "Documentos Pendientes", icon: FileText, color: "text-yellow-600", bgColor: "bg-yellow-100" },
    approved: { text: "Aprobada", icon: CheckCircle, color: "text-green-600", bgColor: "bg-green-100" },
    rejected: { text: "Rechazada", icon: AlertTriangle, color: "text-red-600", bgColor: "bg-red-100" },
};

const UserApplicationsPage: React.FC = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewingApp, setViewingApp] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [actionStatus, setActionStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [actionError, setActionError] = useState('');

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        ApplicationService.getUserApplications(user.id)
            .then(data => setApplications(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [user]);
    
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

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-800 rounded-md"><AlertTriangle className="inline w-5 h-5 mr-2"/>{error}</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Mis Aplicaciones y Datos</h1>
                <p className="mt-1 text-gray-600">Revisa tus solicitudes pasadas y gestiona tu información personal.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Aplicaciones</h2>
                <div className="space-y-4">
                    {applications.length > 0 ? applications.map(app => {
                        const status = statusMap[app.status as keyof typeof statusMap] || statusMap.draft;
                        return (
                            <div key={app.id} className="p-4 border rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-gray-800">{app.car_info?._vehicleTitle || 'Solicitud General'}</p>
                                    <p className="text-xs text-gray-500">Enviada: {new Date(app.created_at).toLocaleDateString()}</p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-flex items-center gap-1.5 ${status.bgColor} ${status.color}`}>
                                        <status.icon className="w-3 h-3" />
                                        {status.text}
                                    </span>
                                </div>
                                <button onClick={() => setViewingApp(app)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-primary-600 text-white rounded-md hover:bg-primary-700">
                                    <Eye className="w-4 h-4"/> Ver Detalles
                                </button>
                            </div>
                        );
                    }) : <p className="text-sm text-gray-500 text-center py-8">Aún no has enviado ninguna solicitud.</p>}
                </div>
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

            {viewingApp && (
                <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setViewingApp(null)}>
                    <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b flex justify-between items-center flex-shrink-0">
                            <h3 className="text-lg font-bold">Vista Previa de la Solicitud</h3>
                            <button onClick={() => setViewingApp(null)} className="p-2 rounded-full hover:bg-gray-100"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="overflow-y-auto p-2">
                             <PrintableApplication application={viewingApp} />
                        </div>
                    </div>
                </div>
            )}
            
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
        </div>
    );
};
export default UserApplicationsPage;