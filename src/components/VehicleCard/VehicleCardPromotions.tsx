
import React from 'react';
import { formatPromotion, getPromotionStyles } from '../../utils/formatters';
import { TagIcon } from '../icons';

interface VehicleCardPromotionsProps {
  promociones?: string[];
}

const VehicleCardPromotions: React.FC<VehicleCardPromotionsProps> = ({ promociones }) => {
  if (!promociones || promociones.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {promociones.map((promo, index) => {
        const styleClasses = getPromotionStyles(promo);
        const formattedPromo = formatPromotion(promo);
        if (!formattedPromo) return null;
        
        return (
          <span key={index} className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${styleClasses}`}>
            <TagIcon className="w-3.5 h-3.5" />
            {formattedPromo}
          </span>
        );
      })}
    </div>
  );
};

export default VehicleCardPromotions;