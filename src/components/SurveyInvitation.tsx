import React from 'react';
import { ArrowRight, X } from 'lucide-react';

const SurveyInvitation: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="relative bg-gradient-to-r from-trefa-blue to-indigo-600 text-white rounded-xl p-6 overflow-hidden shadow-lg">
        <div className="relative z-10">
            <h3 className="font-bold text-lg">Ayúdanos a mejorar y obtén beneficios</h3>
            <p className="text-sm mt-1 text-white/80 max-w-2xl">
                Responde una breve encuesta sobre tu experiencia y recibe un bono especial para tu próxima compra o financiamiento. ¡Solo te tomará 3 minutos!
            </p>
            <div className="mt-4">
                <a
                    href="https://trefa-buyer-persona-survey-analytics-898935312460.us-west1.run.app/#/survey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-5 py-2 bg-white text-trefa-blue font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors shadow-md"
                >
                    Realizar Encuesta <ArrowRight className="w-4 h-4 ml-2" />
                </a>
            </div>
        </div>
        <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/60 hover:text-white/90 rounded-full hover:bg-white/20 transition-colors z-20"
            aria-label="Cerrar invitación"
        >
            <X className="w-5 h-5" />
        </button>
        {/* Decorative elements */}
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full opacity-50 z-0"></div>
        <div className="absolute top-0 right-10 w-24 h-24 bg-white/5 rounded-full opacity-30 z-0"></div>
    </div>
);

export default SurveyInvitation;