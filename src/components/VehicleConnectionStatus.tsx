import React from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useVehicleConnection } from '../hooks/useVehicleConnection';

interface VehicleConnectionStatusProps {
    showDetails: boolean;
}

const VehicleConnectionStatus: React.FC<VehicleConnectionStatusProps> = ({ showDetails }) => {
    const { isConnected, metrics, error } = useVehicleConnection();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de la Conexión</h3>
            <div className={`flex items-center p-3 rounded-lg ${isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                {isConnected ? <CheckCircle className="w-5 h-5 text-green-600 mr-3" /> : <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />}
                <div>
                    <p className={`font-semibold ${isConnected ? 'text-green-800' : 'text-red-800'}`}>
                        {isConnected ? 'Conectado a Trefa' : 'Error de Conexión'}
                    </p>
                    <p className={`text-xs ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                        {isConnected ? 'Sincronización activa' : (error || 'No se pudo conectar')}
                    </p>
                </div>
            </div>
            {isConnected && showDetails && (
                <div className="mt-4 text-sm space-y-2 text-gray-600">
                    <p><strong>Vehículos en BD:</strong> {metrics.totalVehicles}</p>
                    <p><strong>Marcas Únicas:</strong> {metrics.uniqueMakes}</p>
                    <p><strong>Última Sincronización:</strong> {new Date().toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

export default VehicleConnectionStatus;