import React from 'react';
import { Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

type ApplicationStatus = 'draft' | 'submitted' | 'reviewing' | 'pending_docs' | 'approved' | 'rejected' | 'pending' | 'in_progress';

interface Application {
  id: string;
  bank: string;
  type: string;
  status: ApplicationStatus;
  date: string;
  vehicle: string;
}

interface ApplicationCardProps {
  application: Application;
}

const statusInfo = {
  pending: { text: 'Pendiente', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  in_progress: { text: 'En Progreso', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  approved: { text: 'Aprobado', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
  rejected: { text: 'Rechazado', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  draft: { text: 'Borrador', icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100' },
  submitted: { text: 'Enviada', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  reviewing: { text: 'En Revisión', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
  pending_docs: { text: 'Documentos Pendientes', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
};


const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const { text, icon: Icon, color, bg } = statusInfo[application.status] || statusInfo.pending;

  return (
    <Link
      to={`/escritorio/seguimiento/${application.id}`}
      className="block bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-300 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-grow">
          <p className="font-semibold text-gray-800">{application.vehicle}</p>
          <p className="text-sm text-gray-500">{application.type} con {application.bank}</p>
          <p className="text-xs text-gray-400 mt-1">{new Date(application.date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${color} flex-shrink-0`}>
          <Icon className="w-4 h-4 mr-1.5" />
          {text}
        </div>
      </div>
    </Link>
  );
};
export default ApplicationCard;