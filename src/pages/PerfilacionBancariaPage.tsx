import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, useController } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BankProfilingService, getBankColor, getBankLogo } from '../services/BankProfilingService';
import { Profile } from '../types/types';
import { Building2, User, Loader2, CheckCircle, Info } from 'lucide-react';
import Confetti from '../components/Confetti';

const bankProfileSchema = z.object({
  trabajo_tiempo: z.string().min(1, 'La antigüedad es requerida'),
  banco_nomina: z.string().min(1, 'El banco de nómina es requerido'),
  historial_crediticio: z.string().min(1, 'El historial es requerido'),
  creditos_vigentes: z.string().min(1, 'Este campo es requerido'),
  atrasos_12_meses: z.string().min(1, 'Este campo es requerido'),
  enganche: z.string().min(1, 'El enganche es requerido'),
  prioridad_financiamiento: z.string().min(1, 'La prioridad es requerida'),
  ingreso_mensual: z.string().min(1, 'Los ingresos son requeridos'),
});

type BankProfileFormData = z.infer<typeof bankProfileSchema>;

const calculateBankScores = (data: BankProfileFormData): { recommendedBank: string; secondOption: string | null; lowScore: boolean; } => {
    const bancos = ["Scotiabank", "BBVA", "Banorte", "Banregio", "Afirme", "Hey Banco"];
    const puntajes: { [key: string]: { total: number; rechazo: boolean; motivos: string[] } } = {};

    for (const banco of bancos) {
        puntajes[banco] = { total: 0, rechazo: false, motivos: [] };
    }

    const scoringMatrix: { [key: string]: { [key: string]: (string | number)[] } } = {
        trabajo_tiempo: {
            "Menos de 6 meses": ["Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
            "De 6 meses a 1 año": [2, 2, 2, 2, 2, 2],
            "de 1 a 2 años": [3, 3, 3, 3, 3, 3],
            "Más de 2 años": [4, 4, 4, 4, 4, 4],
        },
        banco_nomina: {
            "Scotiabank": [4, 1, 1, 1, 1, 1],
            "BBVA": [1, 4, 1, 1, 1, 1],
            "Banorte": [1, 1, 4, 1, 1, 1],
            "Banregio": [1, 1, 1, 4, 1, 1],
            "Afirme": [1, 1, 1, 1, 4, 1],
            "Hey Banco": [1, 1, 1, 1, 1, 4],
            "Otro banco": [1, 1, 1, 1, 1, 1],
        },
        historial_crediticio: {
            "Excelente": [5, 5, 5, 5, 5, 5],
            "Bueno": [3, 4, 5, 3, 3, 3],
            "Regular": ["Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
            "Malo": ["Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
            "Sin historial crediticio": ["Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
        },
        creditos_vigentes: {
            "Ninguno": [3, 3, 3, 3, 3, 3],
            "1 o 2": [5, 5, 5, 5, 5, 5],
            "3 o más (regularizados)": [2, 2, 2, 2, 2, 2],
            "Varios pagos pendientes": ["Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
        },
        atrasos_12_meses: {
            "Ninguno": [5, 5, 5, 5, 5, 5],
            "Sí, pero lo regularicé": [2, 2, 2, 2, 2, 2],
            "Más de 1 mes": ["Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
            "Varios pagos sin regularizar": ["Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
        },
        enganche: {
            "Menos del 15%": [1, 1, 1, 1, 1, 1],
            "Enganche mínimo (15%)": [1, 1, 1, 1, 1, 1],
            "Más del mínimo (20% a 30%)": [3, 3, 3, 3, 3, 3],
            "Enganche recomendado (35% o más)": [5, 5, 5, 5, 5, 5],
        },
        prioridad_financiamiento: {
            "Tasa de interés más baja": [0, 0, 0, 0, 0, 0],
            "Pagos mensuales fijos": [3, 3, 3, 3, 3, 3],
            "Rapidez en la aprobación": [3, 3, 3, 3, 3, 3],
            "Proceso digital con pocos trámites": [0, 0, 0, 0, 0, 0],
        },
        ingreso_mensual: {
            "Menos de $10,000 MXN, sin comprobación formal": ["Rechazo", 1, "Rechazo", "Rechazo", "Rechazo", "Rechazo"],
            "Menos de $15,000 MXN, con comprobación": ["Rechazo", 2, "Rechazo", 2, 2, 2],
            "Entre $15,000 y $20,000 MXN, con comprobación": [3, 3, 3, 3, 3, 3],
            "Entre $20,000 y $30,000 MXN, con comprobación": [4, 4, 4, 4, 4, 4],
            "Más de $30,000 MXN, con comprobación": [5, 5, 5, 5, 5, 5],
        }
    };
    
    function evaluar(respuesta: string, valores: { [key: string]: (string | number)[] }, etiqueta: string) {
        if (!valores.hasOwnProperty(respuesta)) return;
        bancos.forEach((banco, i) => {
            const resultado = valores[respuesta][i];
            if (resultado === "Rechazo") {
                puntajes[banco].rechazo = true;
                puntajes[banco].motivos.push(`Rechazado por ${etiqueta}`);
            } else if (typeof resultado === "number") {
                puntajes[banco].total += resultado;
            }
        });
    }

    Object.keys(data).forEach(key => {
        // For income, we need to map the custom value to a range
        if (key === 'ingreso_mensual') {
            const incomeValue = data[key];
            let incomeCategory = incomeValue; // default to the selected option
            if (incomeValue.startsWith('$')) {
                const numericIncome = parseInt(incomeValue.replace(/[^0-9]/g, ''), 10);
                if (numericIncome > 30000) incomeCategory = "Más de $30,000 MXN, con comprobación";
                else if (numericIncome >= 20000) incomeCategory = "Entre $20,000 y $30,000 MXN, con comprobación";
                else if (numericIncome >= 15000) incomeCategory = "Entre $15,000 y $20,000 MXN, con comprobación";
                else incomeCategory = "Menos de $15,000 MXN, con comprobación";
            }
            evaluar(incomeCategory, scoringMatrix[key], key);
        } else {
            evaluar(data[key as keyof BankProfileFormData], scoringMatrix[key], key);
        }
    });

    const elegibles = Object.entries(puntajes)
        .filter(([, data]) => !data.rechazo)
        .sort((a, b) => b[1].total - a[1].total);

    if (elegibles.length === 0) {
        const sortedByRejections = Object.entries(puntajes).sort((a, b) => a[1].motivos.length - b[1].motivos.length);
        const bestOfWorst = sortedByRejections[0][0];
        return { recommendedBank: bestOfWorst, secondOption: null, lowScore: true };
    }

    const recommendedBank = elegibles[0][0];
    const bestScore = elegibles[0][1].total;
    const secondOption = elegibles.length > 1 ? elegibles[1][0] : null;

    return { recommendedBank, secondOption, lowScore: bestScore < 5 };
};

const BankCard: React.FC<{ bankName: string, title: string, description: string }> = ({ bankName, title, description }) => {
    const { bgColor, textColor } = getBankColor(bankName);
    const logoContent = getBankLogo(bankName);
    const isUrl = logoContent.startsWith('http');

    return (
        <div className={`p-6 rounded-xl shadow-lg border relative overflow-hidden ${bgColor}`}>
            <div className="relative z-10">
                <h3 className={`font-semibold ${textColor}`}>{title}</h3>
                <div className="flex items-center gap-4 my-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${textColor} ${bgColor === 'bg-white' ? 'bg-gray-100' : ''}`}>
                       {isUrl ? <img src={logoContent} alt={`${bankName} Logo`} className="w-8 h-8 object-contain" /> : logoContent}
                    </div>
                    <p className={`text-4xl font-extrabold ${textColor}`}>{bankName}</p>
                </div>
                <p className={`text-sm ${textColor} opacity-90`}>{description}</p>
            </div>
        </div>
    );
};


const PerfilacionBancariaPage: React.FC = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'profile_incomplete' | 'ready' | 'error' | 'success'>('loading');
    const [showConfetti, setShowConfetti] = useState(false);
    const [recommendedBank, setRecommendedBank] = useState<string | null>(null);
    const [secondRecommendedBank, setSecondRecommendedBank] = useState<string | null>(null);
    const [isLowScore, setIsLowScore] = useState(false);

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<BankProfileFormData>({
        resolver: zodResolver(bankProfileSchema),
    });
    
    useEffect(() => {
        if (authLoading) return;
        if (!user || !profile) {
            setStatus('error');
            return;
        }

        const requiredFields: (keyof Profile)[] = ['first_name', 'last_name', 'mother_last_name', 'phone', 'birth_date', 'homoclave', 'fiscal_situation', 'civil_status', 'address', 'city', 'state', 'zip_code', 'rfc'];
        const isProfileComplete = requiredFields.every(field => profile[field] && String(profile[field]).trim() !== '');
        
        if (!isProfileComplete) {
            setStatus('profile_incomplete');
            return;
        }

        const fetchBankProfile = async () => {
            const existingProfile = await BankProfilingService.getUserBankProfile(user.id);
            if (existingProfile) {
                if (existingProfile.respuestas) reset(existingProfile.respuestas);
                setRecommendedBank(existingProfile.banco_recomendado);
                setSecondRecommendedBank(existingProfile.banco_segunda_opcion);
                if (existingProfile.is_complete) setStatus('success');
                else setStatus('ready');
            } else {
                 setStatus('ready');
            }
        };

        fetchBankProfile();
    }, [user, profile, authLoading, reset]);

    useEffect(() => {
        if (status === 'success') {
            const path = localStorage.getItem('loginRedirect') || '/escritorio/aplicacion';

            localStorage.removeItem('loginRedirect');

            const timer = setTimeout(() => {
                navigate(path);
            }, 7000); // Redirect after 7 seconds

            return () => clearTimeout(timer);
        }
    }, [status, navigate]);


    const onSubmit = async (data: BankProfileFormData) => {
        if (!user) return;
        try {
            const { recommendedBank, secondOption, lowScore } = calculateBankScores(data);
            await BankProfilingService.saveUserBankProfile(user.id, { 
                respuestas: data,
                banco_recomendado: recommendedBank,
                banco_segunda_opcion: secondOption,
            });
            setRecommendedBank(recommendedBank);
            setSecondRecommendedBank(secondOption);
            setIsLowScore(lowScore);
            if (!lowScore) {
                setShowConfetti(true);
            }
            setStatus('success');
        } catch (error) {
            console.error(error);
        }
    };
    
    if (status === 'loading') {
        return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>;
    }
    
    if (status === 'profile_incomplete') {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center bg-white rounded-xl shadow-sm border border-yellow-300">
                <User className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Primero, Completa tu Perfil Personal</h1>
                <p className="text-gray-600 mt-2 max-w-lg mx-auto">
                    Para poder crear tu perfil bancario, necesitamos que termines de llenar tu información personal.
                </p>
                <Link to="/escritorio/profile" className="mt-6 inline-block bg-primary-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-700 transition-colors">
                  Ir a Mi Perfil
                </Link>
            </div>
        );
    }
    
    if (status === 'success') {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center relative">
                {showConfetti && <Confetti />}
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900">¡Perfil Bancario Completo!</h1>
                <p className="text-gray-600 mt-2 max-w-lg mx-auto">
                   Hemos analizado tu perfil y encontrado las mejores opciones para ti.
                </p>

                <div className="mt-8 space-y-6 max-w-md mx-auto">
                    {recommendedBank && <BankCard bankName={recommendedBank} title="Mejor Opción para ti" description="Basado en tus respuestas, este banco tiene la mayor probabilidad de aprobar tu crédito con excelentes condiciones." />}
                    {secondRecommendedBank && <BankCard bankName={secondRecommendedBank} title="Segunda Opción" description="Una excelente alternativa con alta probabilidad de aprobación para tu perfil." />}
                </div>

                {isLowScore && (
                     <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm max-w-md mx-auto">
                        <p><strong>Nota:</strong> Tu perfil no coincide con los requisitos de nuestros bancos principales. Te recomendamos <strong>contactar a un asesor</strong> para explorar alternativas especializadas. Aún puedes continuar tu solicitud con el banco recomendado.</p>
                    </div>
                )}
                
                <div className="mt-10 bg-gray-50 p-8 rounded-2xl border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">¿Qué Sigue Ahora?</h2>
                    <p className="text-gray-600 text-center mb-6 max-w-xl mx-auto">
                        ¡Felicidades! Has completado el paso más importante. Ahora te llevaremos a la solicitud de financiamiento.
                        <br/><br/>
                        <strong className="text-gray-800">Recuerda:</strong> Esto no es un compromiso. Si tu crédito es aprobado, puedes usarlo para cualquier auto de nuestro inventario.
                    </p>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-700">
                            <Loader2 className="w-5 h-5 animate-spin"/>
                            <p>Serás redirigido en unos segundos...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
                <Building2 className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900">Perfilamiento Bancario</h1>
                <p className="text-gray-600 mt-1">Completa este formulario para encontrar la mejor opción de crédito para ti.</p>
            </div>
            
             <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-6 rounded-r-lg">
                <h3 className="font-bold flex items-center"><Info className="w-5 h-5 mr-2" />¿Para qué es esto?</h3>
                <p className="text-sm mt-1">Tus respuestas nos ayudan a determinar qué banco tiene la mayor probabilidad de aprobar tu crédito, ahorrándote tiempo y mejorando tus posibilidades de éxito.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                 <RadioField control={control} name="trabajo_tiempo" label="Antigüedad en tu empleo actual" options={['Menos de 6 meses', 'De 6 meses a 1 año', 'de 1 a 2 años', 'Más de 2 años']} error={errors.trabajo_tiempo?.message} />
                 <RadioField control={control} name="banco_nomina" label="¿En qué banco manejas tu nómina?" options={["Scotiabank", "BBVA", "Banorte", "Banregio", "Afirme", "Hey Banco", "Otro banco"]} error={errors.banco_nomina?.message} />
                 <RadioField control={control} name="historial_crediticio" label="¿Cómo es tu historial crediticio?" options={["Excelente", "Bueno", "Regular", "Malo", "Sin historial crediticio"]} error={errors.historial_crediticio?.message} />
                 <RadioField control={control} name="creditos_vigentes" label="¿Tienes otros créditos vigentes?" options={["Ninguno", "1 o 2", "3 o más (regularizados)", "Varios pagos pendientes"]} error={errors.creditos_vigentes?.message} />
                 <RadioField control={control} name="atrasos_12_meses" label="¿Has tenido atrasos en pagos en los últimos 12 meses?" options={["Ninguno", "Sí, pero lo regularicé", "Más de 1 mes", "Varios pagos sin regularizar"]} error={errors.atrasos_12_meses?.message} />
                 <RadioField control={control} name="enganche" label="¿Qué porcentaje de enganche planeas dar?" options={["Menos del 15%", "Enganche mínimo (15%)", "Más del mínimo (20% a 30%)", "Enganche recomendado (35% o más)"]} error={errors.enganche?.message} />
                 <RadioField control={control} name="prioridad_financiamiento" label="¿Cuál es tu prioridad en el financiamiento?" options={["Tasa de interés más baja", "Pagos mensuales fijos", "Rapidez en la aprobación", "Proceso digital con pocos trámites"]} error={errors.prioridad_financiamiento?.message} />
                 <IncomeRadioField control={control} name="ingreso_mensual" label="Ingresos mensuales comprobables" options={["Menos de $15,000", "$15,000 - $25,000", "$25,001 - $40,000"]} error={errors.ingreso_mensual?.message} />

                <div className="pt-4 flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-bold rounded-lg text-white bg-gradient-to-r from-yellow-500 to-primary-500 hover:from-yellow-600 hover:to-primary-600 disabled:opacity-50">
                        {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : 'Guardar y Analizar Perfil'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const IncomeRadioField: React.FC<{ control: any, name: any, label: string, options: string[], error?: React.ReactNode }> = ({ control, name, label, options, error }) => {
    const { field } = useController({ name, control });
    const OTHER_OPTION = 'Otro';
    const predefinedOptions = useMemo(() => options, [options]);
    const allOptions = useMemo(() => [...predefinedOptions, OTHER_OPTION], [predefinedOptions]);

    const isOtherSelected = useMemo(() => {
        return field.value && !predefinedOptions.includes(field.value);
    }, [field.value, predefinedOptions]);

    const handleOptionClick = (option: string) => {
        if (option === OTHER_OPTION) {
            // If user clicks "Otro", and a predefined option was selected, clear it to show the input field.
            if (predefinedOptions.includes(field.value) || !field.value) {
                field.onChange('');
            }
        } else {
            field.onChange(option);
        }
    };
    
    const formatNumberWithCommas = (value: string): string => {
        const numericValue = value.replace(/[^0-9]/g, '');
        if (numericValue === '') return '';
        return parseInt(numericValue, 10).toLocaleString('es-MX');
    };

    const handleCustomIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatNumberWithCommas(e.target.value);
        field.onChange(`$${formattedValue}`);
    };
    
    const customIncomeDisplayValue = isOtherSelected ? (field.value || '').replace(/^\$/, '') : '';

    return (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 transition-all focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-200/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allOptions.map(opt => {
                    const isSelected = (opt === OTHER_OPTION && isOtherSelected) || field.value === opt;
                    return (
                        <button 
                            type="button" 
                            key={opt} 
                            onClick={() => handleOptionClick(opt)} 
                            className={`w-full flex items-center justify-between text-left p-4 rounded-lg border-2 font-semibold transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400
                                ${isSelected 
                                    ? 'bg-primary-600 border-primary-600 text-white shadow-md' 
                                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                                }`}
                        >
                           <span className="flex-grow">{opt}</span>
                           {isSelected && <CheckCircle className="w-5 h-5 text-white flex-shrink-0 ml-3" />}
                        </button>
                    );
                })}
            </div>
            {isOtherSelected && (
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Monto exacto (mayor a $40,000)</label>
                    <div className="relative mt-1">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                        <input 
                            value={customIncomeDisplayValue}
                            onChange={handleCustomIncomeChange}
                            placeholder="55,000"
                            className="block w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 pl-7"
                            inputMode="numeric"
                        />
                    </div>
                </div>
            )}
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
    );
};

const RadioField: React.FC<{ control: any, name: any, label: string, options: string[], error?: React.ReactNode }> = ({ control, name, label, options, error }) => (
    <Controller name={name} control={control} render={({ field }) => (
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-200 transition-all focus-within:border-primary-300 focus-within:ring-2 focus-within:ring-primary-200/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map(opt => (
                    <button 
                        type="button" 
                        key={opt} 
                        onClick={() => field.onChange(opt)} 
                        className={`w-full flex items-center justify-between text-left p-4 rounded-lg border-2 font-semibold transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-400
                            ${field.value === opt 
                                ? 'bg-primary-600 border-primary-600 text-white shadow-md' 
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary-400 hover:bg-primary-50'
                            }`}
                    >
                       <span className="flex-grow">{opt}</span>
                       {field.value === opt && <CheckCircle className="w-5 h-5 text-white flex-shrink-0 ml-3" />}
                    </button>
                ))}
            </div>
            {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
    )} />
);

export default PerfilacionBancariaPage;