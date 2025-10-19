import React from 'react';
import LazyImage from '../LazyImage';
import { ShieldCheckIcon } from '../icons';

interface VehicleCardImageProps {
  imageSrc: string;
  alt: string;
  isSeparado: boolean;
  garantia?: string;
}

const VehicleCardImage: React.FC<VehicleCardImageProps> = ({ imageSrc, alt, isSeparado, garantia }) => (
  <div className="md:w-1/3 md:flex-shrink-0 relative">
    <LazyImage
      src={imageSrc}
      alt={alt}
      className={`w-full h-60 md:h-full ${isSeparado ? 'filter grayscale' : ''}`}
    />
    {garantia && garantia !== 'N/A' && (
      <div className="absolute top-3 left-3 z-20">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-200 text-gray-800 shadow-lg">
          <ShieldCheckIcon className="w-4 h-4" />
          {garantia}
        </span>
      </div>
    )}
  </div>
);

export default VehicleCardImage;