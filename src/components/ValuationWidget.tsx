import React from 'react';
import { Car } from 'lucide-react';

const ValuationWidget: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
      <Car className="w-12 h-12 text-primary-500 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-gray-900">Valúa tu Auto</h3>
      <p className="text-sm text-gray-600 mt-2">
        Obtén una estimación rápida y precisa del valor de tu vehículo.
      </p>
      <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
        Iniciar Valuación
      </button>
    </div>
  );
};

export default ValuationWidget;