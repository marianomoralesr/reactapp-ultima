import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SeparacionModuleProps {
  applicationStatus: string | null;
  vehicleTitle: string | null;
  vehicleImage: string | null;
}

const SeparacionModule: React.FC<SeparacionModuleProps> = ({ applicationStatus, vehicleTitle, vehicleImage }) => {
  const isApproved = applicationStatus === 'approved';

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Separación de Vehículo</h2>
      
      {vehicleTitle && (
        <div className="flex items-center gap-4 mb-6">
          <img src={vehicleImage || ''} alt={vehicleTitle} className="w-24 h-20 object-cover rounded-md flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Vehículo en tu solicitud:</p>
            <h3 className="font-bold text-gray-900">{vehicleTitle}</h3>
          </div>
        </div>
      )}

      <button
        disabled={!isApproved}
        className="w-full font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700"
      >
        Separar Vehículo
      </button>

      {!isApproved && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800">
            La separación en línea se habilitará automáticamente una vez que tu solicitud de crédito sea aprobada.
          </p>
        </div>
      )}
    </div>
  );
};

export default SeparacionModule;
