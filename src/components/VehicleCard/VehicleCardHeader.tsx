import React from 'react';
import { EyeIcon } from '../icons';

interface VehicleCardHeaderProps {
  title: string;
  viewCount?: number;
  ordencompra?: string;
}

const VehicleCardHeader: React.FC<VehicleCardHeaderProps> = ({ title, viewCount = 0, ordencompra }) => (
  <div>
    {ordencompra && (
      <p className="text-xs font-light text-gray-500 mb-1 tracking-wider">{ordencompra}</p>
    )}
    <h2 className="text-xl font-semibold text-gray-800 group-hover:text-primary-600 transition-colors leading-tight">
      {title}
    </h2>
    {viewCount > 100 && (
      <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0 pt-1" title={`${viewCount.toLocaleString('es-MX')} vistas`}>
        <EyeIcon className="w-4 h-4" />
        <span>{viewCount.toLocaleString('es-MX')}</span>
      </div>
    )}
  </div>
);

export default VehicleCardHeader;
