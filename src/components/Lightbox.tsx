import React, { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from './icons';
import { getVideoEmbedUrl } from '../utils/formatters';

type MediaItem = {
    type: 'image' | 'video';
    url: string;
};

interface LightboxProps {
    media: MediaItem[];
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ media, currentIndex, onClose, onPrev, onNext }) => {
    const [showZoom, setShowZoom] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const ZOOM_LEVEL = 4;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onPrev();
            if (e.key === 'ArrowRight') onNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        document.body.classList.add('lightbox-active');

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
            document.body.classList.remove('lightbox-active');
        };
    }, [onClose, onPrev, onNext]);

    const handleMouseEnter = () => setShowZoom(true);
    const handleMouseLeave = () => setShowZoom(false);
    const handleMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.pageX - left) / width) * 100;
        const y = ((e.pageY - top) / height) * 100;
        setMousePosition({ x, y });
    };

    const currentItem = media[currentIndex];
    if (!currentItem) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="lightbox-title">
            <div className="absolute inset-0" onClick={onClose}></div>
            
            <h2 id="lightbox-title" className="sr-only">Visor de imágenes y videos</h2>

            <div className="relative w-full h-full flex items-center justify-center p-4">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-8 right-6 text-white/70 hover:text-white transition-colors z-[1000] p-2 bg-black/20 rounded-full"
                    aria-label="Cerrar"
                >
                    <XIcon className="w-10 h-10" />
                </button>

                {/* Prev button */}
                {media.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/20 rounded-full"
                        aria-label="Anterior"
                    >
                        <ChevronLeftIcon className="w-12 h-12" />
                    </button>
                )}
                
                {/* Content */}
                <div className="max-w-screen-lg max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    {currentItem.type === 'image' ? (
                         <div className="relative cursor-zoom-in" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseMove={handleMouseMove}>
                            <img
                                src={currentItem.url}
                                alt={`Imagen ${currentIndex + 1} de ${media.length}`}
                                className="object-contain w-auto h-auto max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                            />
                            {showZoom && (
                                <div
                                    className="absolute pointer-events-none w-72 h-72 rounded-full border-4 border-white bg-no-repeat bg-center shadow-lg"
                                    style={{
                                        left: `${mousePosition.x}%`,
                                        top: `${mousePosition.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                        backgroundImage: `url(${currentItem.url})`,
                                        backgroundSize: `${100 * ZOOM_LEVEL}%`,
                                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                                    }}
                                />
                            )}
                        </div>
                    ) : (
                        <div className="aspect-video w-full max-w-screen-lg">
                           <iframe
                                src={getVideoEmbedUrl(currentItem.url) || ''}
                                title="Video del auto"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full rounded-lg"
                           ></iframe>
                        </div>
                    )}
                </div>

                {/* Next button */}
                {media.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-10 p-2 bg-black/20 rounded-full"
                        aria-label="Siguiente"
                    >
                        <ChevronRightIcon className="w-12 h-12" />
                    </button>
                )}
                 {/* Counter */}
                {media.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full z-10">
                        {currentIndex + 1} / {media.length}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lightbox;