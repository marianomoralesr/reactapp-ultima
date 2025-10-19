import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './icons'; // Assuming XIcon is available

interface ExplorarTutorialOverlayProps {
  onClose: () => void;
}

const TUTORIAL_SHOWN_KEY = 'explorarTutorialShown';

const ExplorarTutorialOverlay: React.FC<ExplorarTutorialOverlayProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const tutorialShown = localStorage.getItem(TUTORIAL_SHOWN_KEY);
    if (!tutorialShown) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TUTORIAL_SHOWN_KEY, 'true');
    setIsVisible(false);
    onClose();
  };

  const tutorialSteps = [
    {
      emoji: '🔍',
      title: 'Filtra tu búsqueda',
      description: 'Usa la barra lateral para encontrar el auto perfecto por marca, año, precio y más.',
      animation: { y: [20, 0], opacity: [0, 1] },
    },
    {
      emoji: '↔️',
      title: 'Explora imágenes',
      description: 'Desliza las fotos en cada tarjeta para ver más ángulos del vehículo.',
      animation: { x: [-20, 0], opacity: [0, 1] },
    },
    {
      emoji: '❤️',
      title: 'Guarda tus favoritos',
      description: 'Toca el corazón para guardar los autos que te gusten y verlos después.',
      animation: { scale: [0.8, 1.1, 1], opacity: [0, 1, 1] },
    },
    {
      emoji: '✨',
      title: '¡Listo para explorar!',
      description: 'Disfruta de una experiencia de búsqueda fluida y encuentra tu próximo auto.',
      animation: { rotate: [0, 10, -10, 0], opacity: [0, 1] },
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative bg-white rounded-2xl shadow-xl p-6 max-w-md w-full text-center"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar tutorial"
            >
              <XIcon className="w-6 h-6" />
            </button>

            <motion.div
              key={currentStep} // Key for re-animating content on step change
              initial={{ opacity: 0, ...step.animation.initial }}
              animate={{ opacity: 1, ...step.animation.animate }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <p className="text-5xl mb-4">{step.emoji}</p>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600 mb-6">{step.description}</p>
            </motion.div>

            <div className="flex justify-center gap-2 mb-6">
              {tutorialSteps.map((_, index) => (
                <span
                  key={index}
                  className={`block w-2 h-2 rounded-full ${index === currentStep ? 'bg-primary-600' : 'bg-white/50'}`}
                ></span>
              ))}
            </div>

            <button
              onClick={handleNextStep}
              className="w-full bg-primary-600 text-white font-bold py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {currentStep < tutorialSteps.length - 1 ? 'Siguiente' : 'Entendido'}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExplorarTutorialOverlay;
