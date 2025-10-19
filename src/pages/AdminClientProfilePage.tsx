import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminService } from '../services/AdminService';
import { KommoService } from '../services/KommoService';
import type { Profile } from '../types/types';
import { Loader2, AlertTriangle, User, FileText, CheckCircle, Clock, Tag, Save, X, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import PrintableApplication from '../components/PrintableApplication';
import { ApplicationService } from '../services/ApplicationService';

const ProfileDataItem: React.FC<{ label: string, value: any }> = ({ label, value }) => (
    <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
);

const TagsManager: React.FC<{ leadId: string; initialTags: any[] }> = ({ leadId, initialTags }) => {
    const [assignedTags, setAssignedTags] = useState(initialTags);
    const [availableTags, setAvailableTags] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedTagIds, setSelectedTagIds] = useState<string[]>(() => initialTags.map(t => t.id));

    useEffect(() => {
        AdminService.getAvailableTags().then(setAvailableTags);
    }, []);

    const handleSave = async () => {
        await AdminService.updateLeadTags(leadId, selectedTagIds);
        const updatedAssignedTags = availableTags.filter(t => selectedTagIds.includes(t.id));
        setAssignedTags(updatedAssignedTags);
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Tag className="w-5 h-5"/>Etiquetas</h2>
                <button onClick={() => setIsEditing(!isEditing)} className="text-sm font-semibold text-primary-600 hover:text-primary-800">
                    {isEditing ? 'Cancelar' : 'Editar'}
                </button>
            </div>
            {isEditing ? (
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => {
                            const isSelected = selectedTagIds.includes(tag.id);
                            return (
                                <button key={tag.id} onClick={() => {
                                    setSelectedTagIds(prev => isSelected ? prev.filter(id => id !== tag.id) : [...prev, tag.id]);
                                }} className={`px-2 py-1 text-xs font-medium rounded-full border-2 ${isSelected ? 'border-transparent' : 'border-gray-300'}`} style={{ backgroundColor: isSelected ? tag.color : '#fff', color: isSelected ? '#fff' : '#000' }}>
                                    {tag.tag_name}
                                </button>
                            );
                        })}
                    </div>
                    <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700">
                        <Save className="w-4 h-4" /> Guardar Cambios
                    </button>
                </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {assignedTags.length > 0 ? assignedTags.map(tag => (
                        <span key={tag.id} className="px-2 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: tag.color }}>
                            {tag.tag_name}
                        </span>
                    )) : <p className="text-sm text-gray-500">Sin etiquetas.</p>}
                </div>
            )}
        </div>
    );
};

const RemindersManager: React.FC<{ leadId: string; initialReminders: any[]; agentId: string }> = ({ leadId, initialReminders, agentId }) => {
    const [reminders, setReminders] = useState(initialReminders);
    const [isAdding, setIsAdding] = useState(false);
    const [newReminderText, setNewReminderText] = useState('');
    const [newReminderDate, setNewReminderDate] = useState('');

    const handleAdd = async () => {
        if (!newReminderText || !newReminderDate) return;
        await AdminService.createReminder({
            lead_id: leadId,
            agent_id: agentId,
            reminder_text: newReminderText,
            reminder_date: newReminderDate
        });
        const updatedReminders = await AdminService.getClientProfile(leadId).then(data => data?.reminders || []);
        setReminders(updatedReminders);
        setIsAdding(false);
        setNewReminderText('');
        setNewReminderDate('');
    };
    
    const handleToggleComplete = async (reminder: any) => {
        await AdminService.updateReminder(reminder.id, { is_completed: !reminder.is_completed });
        setReminders(reminders.map(r => r.id === reminder.id ? { ...r, is_completed: !r.is_completed } : r));
    };

    const handleDelete = async (reminderId: string) => {
        if (window.confirm('¿Seguro que quieres eliminar este recordatorio?')) {
            await AdminService.deleteReminder(reminderId);
            setReminders(reminders.filter(r => r.id !== reminderId));
        }
    };

    return (
         <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Clock className="w-5 h-5"/>Recordatorios</h2>
                <button onClick={() => setIsAdding(!isAdding)} className="text-sm font-semibold text-primary-600 hover:text-primary-800">
                    {isAdding ? <X className="w-5 h-5"/> : <Plus className="w-5 h-5"/>}
                </button>
            </div>
            {isAdding && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg border mb-4">
                    <input type="text" value={newReminderText} onChange={e => setNewReminderText(e.target.value)} placeholder="Texto del recordatorio..." className="w-full text-sm p-2 border rounded"/>
                    <input type="datetime-local" value={newReminderDate} onChange={e => setNewReminderDate(e.target.value)} className="w-full text-sm p-2 border rounded"/>
                    <button onClick={handleAdd} className="w-full text-sm p-2 bg-primary-600 text-white rounded">Guardar</button>
                </div>
            )}
            <div className="space-y-3 max-h-60 overflow-y-auto">
                {reminders.length > 0 ? reminders.map(r => (
                     <div key={r.id} className={`p-3 rounded-lg flex items-center gap-3 ${r.is_completed ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <button onClick={() => handleToggleComplete(r)}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${r.is_completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}>
                                {r.is_completed && <CheckCircle className="w-4 h-4 text-white"/>}
                            </div>
                        </button>
                        <div className="flex-grow">
                            <p className={`text-sm ${r.is_completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>{r.reminder_text}</p>
                            <p className="text-xs text-gray-500">{new Date(r.reminder_date).toLocaleString()}</p>
                        </div>
                        <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                )) : <p className="text-sm text-gray-500 text-center py-4">No hay recordatorios.</p>}
            </div>
        </div>
    )
};

const ApplicationManager: React.FC<{ applications: any[], onStatusChange: (appId: string, status: string) => void }> = ({ applications, onStatusChange }) => {
    const [viewingApp, setViewingApp] = useState<any | null>(null);

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Historial de Aplicaciones ({applications.length})</h2>
            <div className="space-y-4">
                {applications.length > 0 ? applications.map(app => (
                    <div key={app.id} className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                            <p className="font-semibold text-gray-800">{app.car_info?._vehicleTitle || 'Solicitud General'}</p>
                            <p className="text-xs text-gray-500">Enviada: {new Date(app.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <select 
                                value={app.status} 
                                onChange={(e) => onStatusChange(app.id, e.target.value)}
                                className="text-xs font-semibold bg-gray-100 text-gray-700 px-2 py-1 rounded-full border-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="draft">Borrador</option>
                                <option value="submitted">Enviada</option>
                                <option value="reviewing">En Revisión</option>
                                <option value="pending_docs">Docs Pendientes</option>
                                <option value="approved">Aprobada</option>
                                <option value="rejected">Rechazada</option>
                            </select>
                            <button onClick={() => setViewingApp(app)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
                                <FileText className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                )) : <p className="text-sm text-gray-500 text-center py-8">Este usuario aún no ha enviado ninguna solicitud.</p>}
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
        </div>
    );
};


const DocumentViewer: React.FC<{ documents: any[] }> = ({ documents }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Documentos Cargados ({documents.length})</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {documents.length > 0 ? documents.map(doc => (
                <a href={doc.url} target="_blank" rel="noopener noreferrer" key={doc.id} className="p-3 border rounded-lg flex items-center gap-3 hover:bg-gray-50">
                    <FileText className="w-5 h-5 text-primary-600"/>
                    <div>
                        <p className="text-sm font-semibold text-gray-800">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">{doc.document_type} - {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                </a>
            )) : <p className="text-sm text-gray-500 text-center py-8">No hay documentos cargados.</p>}
        </div>
    </div>
);

const LeadSourceInfo: React.FC<{ metadata: any }> = ({ metadata }) => {
    if (!metadata || Object.keys(metadata).length === 0) {
        return null;
    }

    const utmParams = Object.entries(metadata).filter(([key]) => key.startsWith('utm_'));

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Fuente del Lead</h2>
            <div className="space-y-3">
                {metadata.rfdm && <ProfileDataItem label="Referencia (rfdm)" value={metadata.rfdm} />}
                {metadata.ordencompra && <ProfileDataItem label="Vehículo de Interés (ordencompra)" value={metadata.ordencompra} />}
                {utmParams.length > 0 && (
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Parámetros UTM</p>
                        {utmParams.map(([key, value]) => (
                            <p key={key} className="text-sm font-mono text-gray-700">{`${key}: ${value}`}</p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const AdminClientProfilePage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const [clientData, setClientData] = useState<{ profile: Profile; applications: any[]; tags: any[]; reminders: any[]; documents: any[] } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    
    useEffect(() => {
        if (!userId) {
            setError("User ID is missing.");
            setLoading(false);
            return;
        }
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await AdminService.getClientProfile(userId);
                if (!data) throw new Error("Client not found.");
                setClientData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userId]);

    const handleSyncToKommo = async () => {
        if (!clientData) return;
        setIsSyncing(true);
        setSyncMessage('');
        const result = await KommoService.syncLead(clientData.profile);
        if (result.success) {
            setSyncMessage('¡Sincronizado con Kommo!');
        } else {
            setSyncMessage(`Error: ${result.message}`);
        }
        setIsSyncing(false);
        setTimeout(() => setSyncMessage(''), 3000);
    };

    const handleStatusChange = async (appId: string, status: string) => {
        if (!clientData) return;
        try {
            await ApplicationService.updateApplicationStatus(appId, status);
            setClientData(prev => prev ? ({
                ...prev,
                applications: prev.applications.map(app => app.id === appId ? { ...app, status } : app),
            }) : null);
        } catch(e: any) {
            alert(`Error updating status: ${e.message}`);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-800 rounded-md"><AlertTriangle className="inline w-5 h-5 mr-2"/>{error}</div>;
    if (!clientData || !user) return <p>No client data available.</p>;

    const { profile, applications, tags, reminders, documents } = clientData;

    return (
        <div className="space-y-8">
            <Link to="/escritorio/admin/leads" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-semibold">
                <ArrowLeft className="w-4 h-4" />
                Volver al Dashboard de Leads
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left Column: Profile & Actions */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <User className="w-8 h-8" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{`${profile.first_name || ''} ${profile.last_name || ''}`}</h1>
                                <p className="text-sm text-gray-500">{profile.email}</p>
                                <p className="text-sm text-gray-500">{profile.phone}</p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                            <ProfileDataItem label="Fuente" value={profile.source} />
                            <ProfileDataItem label="RFC" value={profile.rfc} />
                  <p className="text-sm text-gray-500">Asesor Asignado: {profile.asesor_asignado_id || 'N/A'}</p>
                            <ProfileDataItem label="Contactado" value={profile.contactado ? 'Sí' : 'No'} />
                        </div>
                        <div className="mt-6 border-t pt-4">
                            <button onClick={handleSyncToKommo} disabled={isSyncing} className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60">
                                {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sincronizar a Kommo'}
                            </button>
                            {syncMessage && <p className="text-xs text-center mt-2">{syncMessage}</p>}
                        </div>
                    </div>

                    <LeadSourceInfo metadata={profile.metadata} />
                    <TagsManager leadId={profile.id} initialTags={tags} />
                    <RemindersManager leadId={profile.id} initialReminders={reminders} agentId={user.id} />
                </div>

                {/* Right Column: Applications & History */}
                <div className="lg:col-span-2 space-y-6">
                    <ApplicationManager applications={applications} onStatusChange={handleStatusChange} />
                    <DocumentViewer documents={documents} />
                </div>
            </div>
        </div>
    );
};
export default AdminClientProfilePage;