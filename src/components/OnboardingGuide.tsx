import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight } from 'lucide-react';
import type { Profile } from '../types/types';
import { PenSquareIcon } from './icons'; // Assuming PenSquareIcon is from a separate icons file

const OnboardingGuide: React.FC<{ profile: Profile | null, isBankProfileComplete: boolean }> = ({ profile, isBankProfileComplete }) => {
    const requiredFields: (keyof Profile)[] = ['first_name', 'last_name', 'mother_last_name', 'phone', 'birth_date', 'homoclave', 'fiscal_situation', 'civil_status', 'address', 'city', 'state', 'zip_code', 'rfc'];
    const isProfileComplete = requiredFields.every(field => profile?.[field] && String(profile[field]).trim() !== '');

    if (isProfileComplete && isBankProfileComplete) {
        return null; // Don't show if everything is done.
    }

    let title, description, linkTo, linkText, Icon;

    if (!isProfileComplete) {
        title = "Paso 1: Completa tu Perfil";
        description = "Necesitamos tu información personal para poder calcular tu RFC y preparar tus solicitudes.";
        linkTo = "/escritorio/profile";
        linkText = "Ir a Mi Perfil";
        // FIX: The original code was missing an Icon for the first step, causing a potential error.
        Icon = PenSquareIcon;
    } else {
        title = "Paso 2: Perfilamiento Bancario";
        description = "¡Excelente! Ahora completa tu perfil bancario para que podamos encontrar la mejor opción de crédito para ti.";
        linkTo = "/escritorio/profile?tab=perfil-bancario";
        linkText = "Comenzar Perfilación";
        Icon = Building2;
    }

    return (
        <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl border-2 border-primary-200 p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                <Icon className="w-8 h-8" />
            </div>
            <div className="flex-grow text-center sm:text-left">
                <h3 className="text-lg font-bold text-primary-900">{title}</h3>
                <p className="text-sm text-primary-800 mt-1">{description}</p>
            </div>
            <Link
                to={linkTo}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md flex-shrink-0"
            >
                {linkText} <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
        </div>
    );
};

export default OnboardingGuide;