import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { getEmailRedirectUrl } from '../config';
import { HeartIcon, FileTextIcon, BellIcon, CalendarIcon } from './icons';

const benefits = [
    {
        icon: HeartIcon,
        title: "Guardar tus autos favoritos",
    },
    {
        icon: FileTextIcon,
        title: "Aplicar a financiamiento en línea",
    },
    {
        icon: BellIcon,
        title: "Recibir notificaciones de precios",
    },
    {
        icon: CalendarIcon,
        title: "Agendar visitas y pruebas de manejo",
    }
];

const RegisterBenefits: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        localStorage.setItem('loginRedirect', window.location.pathname + window.location.search);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: getEmailRedirectUrl(),
                    shouldCreateUser: true,
                },
            });

            if (error) throw error;
            setSubmitted(true);
        } catch (error: any) {
            setError('No se pudo enviar el código. Revisa el correo o inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-green-50 p-6 rounded-2xl border border-green-200/80 text-center">
                <h3 className="text-lg font-bold text-green-900">¡Revisa tu correo!</h3>
                <p className="mt-2 text-sm text-green-800">
                    Te hemos enviado un enlace de acceso a <strong>{email}</strong>. Haz clic en él para continuar.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200/80">
            <h3 className="text-lg font-bold text-gray-900">Accede o crea tu cuenta gratis</h3>
            <p className="mt-1 text-sm text-gray-600">Al registrarte podrás:</p>
            <ul className="mt-4 mb-5 space-y-3">
                {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                        <benefit.icon className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-sm text-gray-800">{benefit.title}</h4>
                        </div>
                    </li>
                ))}
            </ul>
            
            {error && <p className="text-red-600 text-xs p-2 rounded-md my-2 text-center bg-red-50 border border-red-200">{error}</p>}
            <form onSubmit={handleEmailSubmit} className="space-y-3">
                <div>
                    <label htmlFor="inline-email" className="sr-only">Correo electrónico</label>
                    <input 
                        id="inline-email" 
                        placeholder="Correo electrónico" 
                        type="email" 
                        autoComplete="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 px-4 text-gray-900 shadow-sm placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="flex w-full justify-center rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-bold text-white shadow-md hover:bg-primary-700 transition-all disabled:opacity-70"
                    >
                        {loading ? 'Enviando...' : 'Continuar con correo'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RegisterBenefits;