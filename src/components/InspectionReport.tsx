import React from 'react';
import { ShieldCheck, Users, AlertTriangle, FileCheck, Check, Wrench, Car, Sparkles, Wind } from 'lucide-react';
import type { InspectionReportData } from '../types/types';


interface InspectionReportProps {
  data: InspectionReportData;
}

const Badge: React.FC<{ icon: React.ReactNode; value: string | number; label: string; }> = ({ icon, value, label }) => (
    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-primary-100 text-primary-600">
            {icon}
        </div>
        <div>
            <p className="text-xl font-bold text-neutral-800">{value}</p>
            <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
    </div>
);

const categoryIcons: { [key: string]: React.ReactNode } = {
    motor: <Wrench className="w-6 h-6 text-white" />,
    transmision: <Car className="w-6 h-6 text-white" />,
    carroceria: <Sparkles className="w-6 h-6 text-white" />,
    interior: <Wind className="w-6 h-6 text-white" />,
};

const InspectionReport: React.FC<InspectionReportProps> = ({ data }) => {
  const categories = Object.keys(data.inspection_points);
  const statusInfo = {
    approved: { text: 'Inspección Aprobada', color: 'text-green-700 bg-green-100' },
    pending: { text: 'Inspección Pendiente', color: 'text-yellow-700 bg-yellow-100' },
    rejected: { text: 'Inspección Rechazada', color: 'text-red-700 bg-red-100' },
  };
  const currentStatus = statusInfo[data.status] || statusInfo.pending;
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 sm:p-8 rounded-2xl border border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                 <img src="/images/trefalogo.png" alt="TREFA Logo" className="h-8 w-auto" />
                 <div>
                    <h2 className="text-xl font-extrabold text-neutral-800">TREFA Certificado</h2>
                    <p className={`text-sm font-semibold px-2 py-0.5 rounded-full inline-block ${currentStatus.color}`}>{currentStatus.text}</p>
                 </div>
            </div>
            <p className="text-sm text-gray-600 text-center sm:text-right max-w-xs">
                Cada auto pasa por una rigurosa inspección mecánica y legal para tu total tranquilidad.
            </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            <Badge icon={<Users className="w-6 h-6" />} value={data.past_owners} label={data.past_owners === 1 ? 'Dueño Anterior' : 'Dueños Anteriores'} />
            <Badge icon={<AlertTriangle className="w-6 h-6" />} value={data.sinisters} label="Siniestros Reportados" />
            <Badge icon={<FileCheck className="w-6 h-6" />} value={data.police_report} label="Estatus Legal" />
        </div>

        <div>
            <h3 className="text-lg font-bold text-neutral-800 mb-6 text-center">Puntos Clave de la Inspección Mecánica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {categories.map(categoryKey => (
                <div key={categoryKey} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-trefa-blue flex items-center justify-center flex-shrink-0">
                            {categoryIcons[categoryKey] || <ShieldCheck className="w-6 h-6 text-white" />}
                        </div>
                        <h4 className="font-bold text-neutral-700 capitalize text-lg">{categoryKey.replace('_', ' ')}</h4>
                    </div>
                    <ul className="space-y-2.5">
                        {data.inspection_points[categoryKey].map((point, index) => (
                        <li key={index} className="flex items-start text-sm text-gray-700">
                            <Check className="w-4 h-4 text-green-500 mr-2.5 mt-0.5 flex-shrink-0" />
                            <span>{point}</span>
                        </li>
                        ))}
                    </ul>
                </div>
              ))}
            </div>
        </div>
    </div>
  );
};

export default InspectionReport;