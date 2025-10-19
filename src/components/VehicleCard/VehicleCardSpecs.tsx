import React from 'react';
import { formatMileage } from '../../utils/formatters';
import { MapPinIcon, GaugeIcon, CogIcon, FuelIcon } from '../icons';

interface VehicleCardSpecsProps {
  sucursal?: string[];
  kilometraje: number;
  transmision: string;
  combustible: string;
}

const SpecItem: React.FC<{ icon: React.ElementType; label: string }> = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-1.5">
    <Icon className="w-4 h-4 text-gray-500" />
    <span>{label}</span>
  </div>
);

const VehicleCardSpecs: React.FC<VehicleCardSpecsProps> = ({ sucursal = [], kilometraje, transmision, combustible }) => (
  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-700 items-center">
    {sucursal.length > 0 && <SpecItem icon={MapPinIcon} label={sucursal.join(', ')} />}
    {kilometraje > 0 && <SpecItem icon={GaugeIcon} label={formatMileage(kilometraje)} />}
    {transmision && <SpecItem icon={CogIcon} label={transmision} />}
    {combustible && <SpecItem icon={FuelIcon} label={combustible} />}
  </div>
);

export default VehicleCardSpecs;