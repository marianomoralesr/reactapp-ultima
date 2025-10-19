import React from 'react';
import { Clock } from 'lucide-react';

const RecentActivity: React.FC = () => {
    // Dummy data
    const activities = [
        { text: 'Solicitud enviada a BBVA.', time: 'hace 2 horas' },
        { text: 'Perfil bancario actualizado.', time: 'hace 1 día' },
        { text: 'Documento INE subido.', time: 'hace 1 día' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <ul className="space-y-4">
                {activities.map((activity, index) => (
                    <li key={index} className="flex items-start">
                        <Clock className="w-4 h-4 text-gray-400 mt-1 mr-3" />
                        <div>
                            <p className="text-sm text-gray-800">{activity.text}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecentActivity;