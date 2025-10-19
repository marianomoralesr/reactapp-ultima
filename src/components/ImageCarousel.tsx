import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import LazyImage from './LazyImage';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  isSeparado?: boolean;
  garantia?: string;
  // Add any other props needed for the overlay/badges
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, alt, className, isSeparado, garantia }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const x = useMotionValue(0);
  const constraintsRef = useRef(null);

  const allImages = useMemo(() => {
    // Ensure feature_image is always first if available, then exterior gallery
    const filteredImages = images.filter(Boolean);
    return filteredImages.length > 0 ? filteredImages : [DEFAULT_PLACEHOLDER_IMAGE];
  }, [images]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const threshold = 50; // pixels to drag to trigger a slide
    const swipePower = 10000; // velocity needed to trigger a slide

    if (offset < -threshold || velocity < -swipePower) {
      // Swiped left
      setCurrentIndex((prev) => Math.min(prev + 1, allImages.length - 1));
    } else if (offset > threshold || velocity > swipePower) {
      // Swiped right
      setCurrentIndex((prev) => Math.max(prev - 1, 0));
    }
    x.set(0); // Snap back to center
  }, [allImages.length, x]);

  const currentImage = allImages[currentIndex];

  return (
    <div ref={constraintsRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      <motion.div
        className="flex h-full"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        animate={{ translateX: `-${currentIndex * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {allImages.map((imgSrc, index) => (
          <div key={index} className="flex-shrink-0 w-full h-full relative">
            <LazyImage
              src={imgSrc}
              alt={`${alt} - ${index + 1}`}
              className={`w-full h-full object-cover ${isSeparado ? 'filter grayscale' : ''}`}
            />
            {garantia && garantia !== 'N/A' && (
              <div className="absolute top-3 left-3 z-20">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-br from-slate-100 via-gray-100 to-zinc-200 text-gray-800 shadow-lg">
                  {/* Assuming ShieldCheckIcon is available globally or imported */}
                  {/* <ShieldCheckIcon className="w-4 h-4" /> */}
                  {garantia}
                </span>
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {allImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 z-10">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1 w-6 rounded-full transition-colors duration-200 ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;