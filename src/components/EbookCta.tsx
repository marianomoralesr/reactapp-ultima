import React, { useState } from 'react';
import { DownloadIcon, FileTextIcon, XIcon, ChevronUpIcon } from './icons';

const EbookCta: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) {
    return null;
  }

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-1/2 translate-y-1/2 left-0 z-40 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="bg-green-600 text-white p-2 rounded-r-lg shadow-lg flex items-center gap-2 transform hover:bg-green-700 transition-colors">
          <FileTextIcon className="w-5 h-5" />
          <span className="font-semibold text-sm writing-mode-vertical-rl rotate-180">Vender tu Auto</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] sm:w-auto sm:max-w-2xl">
      <div className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-teal-600 text-white rounded-xl p-4 sm:p-6 overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="absolute top-2 right-2 flex gap-1 z-20">
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Minimizar"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsClosed(true)}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Cerrar"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <FileTextIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-extrabold text-base sm:text-lg mb-1">¿Pensando en vender tu auto?</h3>
              <p className="text-xs sm:text-sm text-white/95 leading-relaxed">
                Descarga nuestro manual gratuito con los mejores consejos para vender tu auto al mejor precio.
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto">
            <a
              href="/manual-para-vender-trefa.pdf"
              download="Manual-Para-Vender-TREFA.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 bg-white text-green-700 font-bold rounded-lg text-sm hover:bg-gray-100 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Descargar Gratis
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EbookCta;