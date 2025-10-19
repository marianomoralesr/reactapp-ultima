import React, { useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { WordPressVehicle } from '../types/types';
import { Heart, X, ChevronUp, Hand } from 'lucide-react';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../utils/constants';

// --- Type Definitions ---
type Direction = "left" | "right" | "up" | "down";

export interface SwiperControls {
    triggerSwipe: (dir: Direction) => void;
    undo: () => void;
}

interface CarSwiperProps {
  cars: WordPressVehicle[];
  onSwipe: (car: WordPressVehicle, direction: Direction) => void;
  onTopCardChange: (car: WordPressVehicle | null) => void;
  children?: React.ReactNode; // Fallback content when deck is exhausted
}

// --- Helper Components ---
type TutorialStep = 'horizontal' | 'down' | 'up' | 'done';

const OnboardingGuide: React.FC<{ step: TutorialStep; onSkip: () => void }> = ({ step, onSkip }) => {
    if (step === 'done') return null;

    const stepsContent = {
        horizontal: { text: <>Desliza para explorar</>, animation: { x: [0, 60, -60, 0], opacity: [1, 1, 1, 1] }, loop: Infinity },
        down: { text: <>Desliza abajo para guardar ❤️</>, animation: { y: [0, 60, 0], opacity: [1, 1, 1] }, loop: Infinity },
        up: { text: <>Desliza arriba para cambiar 🔼</>, animation: { y: [0, -60, 0], opacity: [1, 1, 1] }, loop: Infinity }
    };

    const currentStep = stepsContent[step];

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
                key={step}
                className="text-center text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: "easeInOut", duration: 0.4 }}
            >
                <motion.div
                    className="mb-4 inline-block"
                    animate={currentStep.animation}
                    transition={{ duration: 2, ease: "easeInOut", repeat: currentStep.loop }}
                >
                    <Hand className="w-16 h-16 text-white drop-shadow-lg" />
                </motion.div>
                <h3 className="text-2xl font-bold drop-shadow-lg">{currentStep.text}</h3>
            </motion.div>
            <button
                onClick={onSkip}
                className="absolute bottom-10 text-white/70 font-semibold py-2 px-4 rounded-full hover:text-white hover:bg-white/10 transition-colors"
            >
                Saltar Tutorial
            </button>
        </div>
    );
};

const CardContent: React.FC<{ car: WordPressVehicle; isTopCard: boolean }> = React.memo(({ car, isTopCard }) => {
    const [mediaIndex, setMediaIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);

    const media = useMemo(() => {
        // Only show feature image for non-top cards to improve performance
        if (!isTopCard) {
            const imageSrc = car.feature_image || car.thumbnail_webp || car.thumbnail || car.feature_image_webp;
            return imageSrc ? [imageSrc] : [];
        }
        return [
            car.feature_image,
            car.reel_id,
            ...(car.galeriaExterior?.slice(0, 3) || []), // Limit to 3 exterior images
        ].filter(Boolean) as string[];
    }, [car, isTopCard]);

    const handleNextMedia = useCallback(() => {
        if (media.length > 1 && isTopCard) {
            setMediaIndex((prev) => (prev + 1) % media.length);
        }
    }, [media.length, isTopCard]);

    const currentMedia = media[mediaIndex] || car.feature_image || DEFAULT_PLACEHOLDER_IMAGE;
    const isDirectVideo = useMemo(() => /\.(mp4|webm|mov)$/i.test(currentMedia), [currentMedia]);

    return (
        <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden group bg-gray-900" onClick={handleNextMedia}>
            {media.length > 1 && isTopCard && (
                <div className="absolute top-2 left-2 right-2 z-20 flex justify-center gap-1">
                    {media.map((_, i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i === mediaIndex ? 'bg-white' : 'bg-white/40'}`}></div>
                    ))}
                </div>
            )}

            {/* Loading skeleton */}
            {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
            )}

            {isTopCard && isDirectVideo ? (
                <video
                    key={`${car.id}-${mediaIndex}`}
                    src={currentMedia}
                    className="w-full h-full object-cover"
                    autoPlay muted loop playsInline preload="metadata"
                    poster={car.feature_image}
                    onLoadedData={() => setImageLoaded(true)}
                />
            ) : (
                <img
                    src={currentMedia}
                    alt={car.titulo}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading={isTopCard ? "eager" : "lazy"}
                    decoding="async"
                    onLoad={() => setImageLoaded(true)}
                />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <Link
                to={`/autos/${car.slug}`}
                onClick={e => e.stopPropagation()}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-black/70 transition-colors z-20"
            >
                Ver Detalles
            </Link>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return prevProps.car.id === nextProps.car.id && prevProps.isTopCard === nextProps.isTopCard;
});

const SwipeActionOverlay: React.FC<{ opacity: any, text: string, icon: React.ElementType, color: string, rotation: number }> = ({ opacity, text, icon: Icon, color, rotation }) => (
    <motion.div
        style={{ opacity }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
    >
        <div
            className="border-4 rounded-xl py-2 px-6 flex items-center gap-2"
            style={{ borderColor: color, transform: `rotate(${rotation}deg)` }}
        >
            <Icon className="w-6 h-6" style={{ color }} />
            <p className="text-2xl font-bold tracking-wider uppercase" style={{ color }}>
                {text}
            </p>
        </div>
    </motion.div>
);

const SwipeCard: React.FC<{
    car: WordPressVehicle;
    position: number;
    onSwipe: (direction: Direction) => void;
}> = React.memo(({ car, position, onSwipe }) => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotate = useTransform(x, [-350, 350], [-15, 15]);
    const scale = 1 - position * 0.05;
    const isTopCard = position === 0;

    const opacityRight = useTransform(x, [20, 100], [0, 1]);
    const opacityLeft = useTransform(x, [-20, -100], [0, 1]);
    const opacityUp = useTransform(y, [-20, -100], [0, 1]);
    const opacityDown = useTransform(y, [20, 100], [0, 1]);

    const handleDragEnd = useCallback((_: any, info: PanInfo) => {
        const threshold = 80; // Reduced threshold for faster swipes
        const velocityThreshold = 400;
        let direction: Direction | null = null;

        if (info.offset.x > threshold || info.velocity.x > velocityThreshold) direction = "right";
        else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) direction = "left";
        else if (info.offset.y > threshold || info.velocity.y > velocityThreshold) direction = "down";
        else if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) direction = "up";

        if (direction) {
            const exitX = direction === 'left' ? -500 : direction === 'right' ? 500 : 0;
            const exitY = direction === 'up' ? -500 : direction === 'down' ? 500 : 0;
            animate(x, exitX, { duration: 0.2, ease: 'easeOut' }); // Faster exit
            animate(y, exitY, { duration: 0.2, ease: 'easeOut', onComplete: () => onSwipe(direction!) });
        } else {
            animate(x, 0, { type: 'spring', stiffness: 600, damping: 35 }); // Snappier return
            animate(y, 0, { type: 'spring', stiffness: 600, damping: 35 });
        }
    }, [x, y, onSwipe]);

    return (
        <motion.div
            className="absolute w-[calc(100%-2rem)] aspect-square max-w-sm"
            style={{
                x, y, rotate, scale,
                top: position * 10,
                zIndex: 10 - position,
            }}
            drag={isTopCard}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.15} // Reduced elastic for faster response
            onDragEnd={handleDragEnd}
            initial={false} // Prevent initial animation
        >
            {isTopCard && (
                <>
                    <SwipeActionOverlay opacity={opacityRight} text="Next" icon={X} color="#EF4444" rotation={15} />
                    <SwipeActionOverlay opacity={opacityLeft} text="Next" icon={X} color="#EF4444" rotation={-15} />
                    <SwipeActionOverlay opacity={opacityUp} text="Categoría" icon={ChevronUp} color="#3B82F6" rotation={0} />
                    <SwipeActionOverlay opacity={opacityDown} text="Guardar" icon={Heart} color="#F87171" rotation={0} />
                </>
            )}
            <CardContent car={car} isTopCard={isTopCard} />
        </motion.div>
    );
}, (prevProps, nextProps) => {
    return prevProps.car.id === nextProps.car.id && prevProps.position === nextProps.position;
});

const CarSwiper = forwardRef<SwiperControls, CarSwiperProps>(({
    cars, onSwipe, onTopCardChange, children
}, ref) => {
    const [deck, setDeck] = useState(() => cars);
    const [history, setHistory] = useState<WordPressVehicle[]>([]);
    const [tutorialStep, setTutorialStep] = useState<TutorialStep>('done');

    useEffect(() => {
      const onboardingShown = localStorage.getItem('carSwiperOnboardingShown_v2');
      if (!onboardingShown) {
        setTutorialStep('horizontal');
      }
    }, []);

    const handleSkipTutorial = useCallback(() => {
        setTutorialStep('done');
        localStorage.setItem('carSwiperOnboardingShown_v2', 'true');
    }, []);

    useEffect(() => {
        setDeck(cars);
        onTopCardChange(cars[0] || null);
    }, [cars, onTopCardChange]);

    const handleSwipe = useCallback((car: WordPressVehicle, direction: Direction) => {
        onSwipe(car, direction);
        setHistory(prev => [car, ...prev.slice(0, 4)]); // Keep only last 5 in history
        setDeck(prev => {
            const newDeck = prev.slice(1);
            onTopCardChange(newDeck[0] || null);
            return newDeck;
        });

        if (tutorialStep === 'horizontal' && (direction === 'left' || direction === 'right')) {
            setTutorialStep('down');
        } else if (tutorialStep === 'down' && direction === 'down') {
            setTutorialStep('up');
        } else if (tutorialStep === 'up' && direction === 'up') {
            handleSkipTutorial();
        }

    }, [onSwipe, onTopCardChange, tutorialStep, handleSkipTutorial]);

    useImperativeHandle(ref, () => ({
        undo: () => {
            if (history.length > 0) {
                const lastCar = history[0];
                setDeck(prev => [lastCar, ...prev]);
                setHistory(prev => prev.slice(1));
                onTopCardChange(lastCar);
            }
        },
        triggerSwipe: (direction: Direction) => {
            if (deck.length > 0) {
                handleSwipe(deck[0], direction);
            }
        }
    }), [history, deck, handleSwipe, onTopCardChange]);

    // Only render 2 cards for better performance
    const visibleCards = useMemo(() => deck.slice(0, 2), [deck]);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {tutorialStep !== 'done' && <OnboardingGuide step={tutorialStep} onSkip={handleSkipTutorial} />}
            <div className="relative w-full flex-grow flex items-center justify-center">
                <AnimatePresence mode="popLayout">
                    {visibleCards.length > 0 ? (
                        visibleCards.map((car, i) => (
                            <SwipeCard
                                key={car.id}
                                car={car}
                                position={i}
                                onSwipe={(direction) => handleSwipe(car, direction)}
                            />
                        )).reverse()
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4"
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
});

export default CarSwiper;