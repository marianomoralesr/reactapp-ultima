import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';

const BetaSurveyInvitation: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="relative bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-xl p-6 overflow-hidden shadow-lg">
        <div className="relative z-10">
            <h3 className="font-bold text-lg">¿Probando el nuevo sitio? Danos tu feedback</h3>
            <p className="text-sm mt-1 text-white/80 max-w-2xl">
                Tu opinión es clave para mejorar. Responde esta encuesta sobre tu experiencia con la nueva versión de la plataforma.
            </p>
            <div className="mt-4">
                <Link
                    to="/beta-v.0.1"
                    className="inline-flex items-center px-5 py-2 bg-white text-indigo-700 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors shadow-md"
                >
                    Dar mi opinión <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </div>
        </div>
        <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 text-white/60 hover:text-white/90 rounded-full hover:bg-white/20 transition-colors z-20"
            aria-label="Cerrar invitación de encuesta beta"
        >
            <X className="w-5 h-5" />
        </button>
        {/* Decorative elements */}
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full opacity-50 z-0"></div>
        <div className="absolute top-0 right-10 w-20 h-20 bg-white/5 rounded-full opacity-30 z-0"></div>
    </div>
);

export default BetaSurveyInvitation;