import React, { useState } from 'react';
import VehicleService from '../services/VehicleService';

const WebhookTestPanel: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    const handleTest = async () => {
        setStatus('testing');
        try {
            // Test by fetching all vehicles
            const { vehicles } = await VehicleService.getAllVehicles();
            if (vehicles.length > 0) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch {
            setStatus('error');
        }
        setTimeout(() => setStatus('idle'), 3000);
    };

    return (
        <div className="bg-gray-800 text-white rounded-xl p-4">
            <h4 className="font-semibold text-sm mb-2">Panel de Prueba (DEV)</h4>
            <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Webhook de Solicitud</p>
                <button
                    onClick={handleTest}
                    disabled={status !== 'idle'}
                    className="px-3 py-1 text-xs font-medium bg-indigo-500 rounded hover:bg-indigo-600 disabled:bg-gray-600"
                >
                    {status === 'testing' ? 'Probando...' : 'Probar'}
                </button>
            </div>
            {status === 'success' && <p className="text-xs text-green-400 mt-2">Éxito: Webhook enviado.</p>}
            {status === 'error' && <p className="text-xs text-red-400 mt-2">Error: Falló el envío.</p>}
        </div>
    );
};

export default WebhookTestPanel;