import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AdminService } from '../services/AdminService';
import { Loader2, AlertTriangle, User, Users, FileText, Clock, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '../components/StatsCard';

const AdminLeadsDashboardPage: React.FC = () => {
    const { user, isSales } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: leads = [], isLoading: isLoadingLeads, isError: isErrorLeads, error: errorLeads } = useQuery<any[], Error>({
        queryKey: ['leads'],
        queryFn: AdminService.getAllLeads
    });

    const { data: stats = {}, isLoading: isLoadingStats, isError: isErrorStats, error: errorStats } = useQuery<any, Error>({
        queryKey: ['dashboardStats'],
        queryFn: AdminService.getDashboardStats
    });

    const filteredLeads = useMemo(() => {
        let filtered = leads;

        if (isSales && user) {
            filtered = leads.filter(lead => lead.asesor_asignado_id === user.id);
        }

        if (!searchTerm) return filtered;
        
        const lowercasedQuery = searchTerm.toLowerCase();
        return filtered.filter(lead =>
            `${lead.first_name || ''} ${lead.last_name || ''}`.toLowerCase().includes(lowercasedQuery) ||
            lead.email?.toLowerCase().includes(lowercasedQuery)
        );
    }, [leads, searchTerm, isSales, user]);

    const isLoading = isLoadingLeads || isLoadingStats;
    const isError = isErrorLeads || isErrorStats;
    const error = errorLeads || errorStats;

    if (isLoading) return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
    if (isError) return <div className="p-4 bg-red-100 text-red-800 rounded-md"><AlertTriangle className="inline w-5 h-5 mr-2"/>{error?.message}</div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard title="Total de Leads" value={stats.total_leads || 0} change="" changeType="neutral" icon={Users} color="blue" />
                <StatsCard title="Con Solicitud Activa" value={stats.leads_with_active_app || 0} change="" changeType="neutral" icon={FileText} color="purple" />
                <StatsCard title="Solicitud Incompleta" value={stats.leads_with_unfinished_app || 0} change="" changeType="neutral" icon={User} color="yellow" />
                <StatsCard title="Necesitan Seguimiento" value={stats.leads_needing_follow_up || 0} change="" changeType="neutral" icon={Clock} color="red" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Directorio de Clientes</h2>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nombre</th>
                                <th scope="col" className="px-6 py-3">Email / Teléfono</th>
                                <th scope="col" className="px-6 py-3">Último Auto de Interés</th>
                                <th scope="col" className="px-6 py-3">Estado Solicitud</th>
                                <th scope="col" className="px-6 py-3">Contactado</th>
                                <th scope="col" className="px-6 py-3">Asesor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeads.map(lead => (
                                <tr key={lead.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                        <Link to={`/escritorio/admin/cliente/${lead.id}`} className="hover:underline text-primary-600">
                                            {`${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'Sin Nombre'}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="truncate w-48" title={lead.email}>{lead.email}</div>
                                        <div className="text-xs text-gray-400">{lead.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">{lead.latest_app_car_info?._vehicleTitle || '-'}</td>
                                    <td className="px-6 py-4">{lead.latest_app_status || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${lead.contactado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {lead.contactado ? 'Sí' : 'No'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{lead.asesor_asignado || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLeadsDashboardPage;