
import React from 'react';
import { formatPrice } from '../../utils/formatters';

interface VehicleCardPriceProps {
  precio: number;
  engancheMinimo: number;
}

const VehicleCardPrice: React.FC<VehicleCardPriceProps> = ({ precio, engancheMinimo }) => (
  <div className="mb-4 sm:mb-0">
    <p className="text-2xl font-bold text-gray-900">{formatPrice(precio)}</p>
    {engancheMinimo > 0 && (
      <p className="text-sm text-gray-500 mt-1">
        Enganche desde: <span className="font-semibold">{formatPrice(engancheMinimo)}</span>
      </p>
    )}
  </div>
);

export default VehicleCardPrice;
