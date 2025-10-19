import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { CheckCircle, Edit3, ListChecks, ArrowLeft, ArrowRight, Info } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../context/AuthContext';


interface RadioGroupProps {
    question: string;
    name: string;
    options: { value: string; label: string }[];
    register: any;
    required?: boolean;
    selectedOption: string | null;
    onChange: (value: string) => void;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ question, name, options, register, required, selectedOption, onChange }) => {
    const isRatingScale = options.length >= 5 && options.every(o => !isNaN(parseInt(o.value, 10)));

    return (
        <div>
            <label className="block text-md font-semibold text-gray-800 mb-3">{question}{required && <span className="text-red-500">*</span>}</label>
            <div className={isRatingScale ? "grid grid-cols-5 sm:grid-cols-10 gap-2" : "flex flex-wrap gap-3"}>
                {options.map((option) => (
                    <label key={option.value} className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-0.5
                        ${isRatingScale ? 'justify-center aspect-square flex-col-reverse text-center text-sm sm:text-base' : ''}
                        ${selectedOption === option.value 
                            ? 'bg-primary-600 border-primary-700 text-white font-semibold shadow-lg ring-2 ring-offset-2 ring-primary-500 scale-105' 
                            : 'bg-white border-gray-300 text-gray-700 hover:border-primary-400 hover:bg-primary-50'}`
                    }>
                        <input 
                          type="radio" 
                          {...register(name, { required })} 
                          value={option.value}
                          checked={selectedOption === option.value}
                          onChange={(e) => onChange(e.target.value)}
                          className="sr-only" 
                        />
                        <span>{option.label}</span>
                         {selectedOption === option.value && !isRatingScale && <CheckCircle className="w-5 h-5 ml-auto text-white/80"/>}
                    </label>
                ))}
            </div>
        </div>
    );
};

const TextArea: React.FC<{
    question: string;
    name: string;
    placeholder?: string;
    register: any;
}> = ({ question, name, placeholder, register }) => (
    <div>
        <label className="block text-md font-semibold text-gray-800 mb-2">{question}</label>
        <textarea {...register(name)} rows={3} placeholder={placeholder} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"></textarea>
    </div>
);

const PrePollGuidance: React.FC = () => (
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto mb-8 text-left">
        <h2 className="text-xl font-bold text-neutral-800 mb-3 flex items-center"><ListChecks className="w-6 h-6 mr-2 text-blue-600"/>Antes de empezar, por favor intenta hacer lo siguiente:</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 pl-2">
            <li>Navega por el <strong>inventario</strong> y prueba los <strong>filtros</strong>.</li>
            <li>Cambia entre la <strong>vista de cuadrícula y la vista de lista</strong>.</li>
            <li>Entra a la <strong>página de detalles</strong> de un auto que te interese.</li>
            <li>Localiza y abre la <strong>calculadora de financiamiento</strong>.</li>
            <li>Prueba los botones de <strong>WhatsApp, Favoritos y Financiar</strong>.</li>
        </ul>
        <p className="mt-4 text-sm text-blue-800">Esto nos ayudará a obtener un feedback más completo sobre las funciones clave.</p>
    </div>
);

const ApplicationPrompt: React.FC = () => (
    <div className="mt-8 bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800 p-4 rounded-r-lg" role="alert">
        <div className="flex">
            <div className="py-1">
                <Info className="h-6 w-6 text-indigo-500 mr-4 flex-shrink-0" />
            </div>
            <div>
                <p className="font-bold">¡Un último favor! (Opcional)</p>
                <p className="text-sm">Para una evaluación completa, te invitamos a simular una solicitud de financiamiento. Esto nos dará información valiosa sobre el flujo de la aplicación.</p>
                <Link to="/escritorio/aplicacion" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-800 underline">
                    Ir a la Solicitud de Financiamiento &rarr;
                </Link>
            </div>
        </div>
    </div>
);


const BetaPollPage: React.FC = () => {
    const [pollState, setPollState] = useState<'idle' | 'polling' | 'submitting' | 'submitted'>('idle');
    const { register, handleSubmit, watch, setValue, trigger } = useForm({ mode: 'onChange' });
    const { user } = useAuth();
    const [participants, setParticipants] = useState(0);
    const participantGoal = 50;
    const progressPercentage = (participants / participantGoal) * 100;
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (pollState === 'idle') {
            const fetchCount = async () => {
                const { count, error } = await supabase.from('beta_poll_responses').select('*', { count: 'exact', head: true });
                if (!error && count !== null) {
                    setParticipants(count);
                } else {
                    console.error("Failed to fetch poll participant count:", error);
                    setParticipants(23); // Fallback if fetch fails
                }
            };
            fetchCount();
        }
    }, [pollState]);

    const watchedValues = watch();

    const onSubmit = async (data: any) => {
        setPollState('submitting');
        
        const keyTranslations: { [key: string]: string } = {
            dispositivo: "Dispositivo",
            facilidad_inventario: "Facilidad Inventario (1-10)",
            punto_fuerte: "Punto Fuerte",
            punto_debil: "Punto Débil",
            info_autos: "Claridad Info Autos",
            info_extra: "Info Extra Sugerida",
            facilidad_login: "Facilidad Login (1-10)",
            problemas_financiamiento: "Problemas Financiamiento",
            claridad_dashboard: "Claridad Dashboard",
            confianza: "Nivel de Confianza",
            mejora_confianza: "Sugerencia Confianza",
            probabilidad_uso: "Probabilidad de Reuso (1-10)",
            momentos_frustracion: "Momentos de Frustración",
            sorpresas_positivas: "Sorpresas Positivas",
            mejora_prioritaria: "Mejora Prioritaria",
            funciones_no_usadas: "Funciones no Usadas",
            abandono: "Motivo de Abandono",
            comentario_final: "Comentario Final",
            funcionalidad_futura: "Funcionalidad Futura",
            mejor_experiencia: "Mejor Experiencia App",
        };

        const translatedPayload: { [key: string]: any } = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                const translatedKey = keyTranslations[key] || key;
                const value = data[key];
                const numericFields = ['facilidad_inventario', 'facilidad_login', 'probabilidad_uso'];

                if (numericFields.includes(key) && typeof value === 'string') {
                    const num = parseInt(value, 10);
                    translatedPayload[translatedKey] = isNaN(num) ? null : num;
                } else {
                    translatedPayload[translatedKey] = value;
                }
            }
        }
        if (user?.id) {
            translatedPayload['User ID'] = user.id;
        }
        
        const supabasePayload = {
            user_id: user?.id || null,
            dispositivo: data.dispositivo,
            facilidad_inventario: parseInt(data.facilidad_inventario, 10),
            punto_fuerte: data.punto_fuerte,
            punto_debil: data.punto_debil,
            info_autos: data.info_autos,
            info_extra: data.info_extra,
            facilidad_login: parseInt(data.facilidad_login, 10),
            problemas_financiamiento: data.problemas_financiamiento,
            claridad_dashboard: data.claridad_dashboard,
            confianza: data.confianza,
            mejora_confianza: data.mejora_confianza,
            probabilidad_uso: parseInt(data.probabilidad_uso, 10),
            momentos_frustracion: data.momentos_frustracion,
            sorpresas_positivas: data.sorpresas_positivas,
            mejora_prioritaria: data.mejora_prioritaria,
            funciones_no_usadas: data.funciones_no_usadas,
            abandono: data.abandono,
            comentario_final: data.comentario_final,
            funcionalidad_futura: data.funcionalidad_futura,
            mejor_experiencia: data.mejor_experiencia
        };
        
        const webhookUrl = 'https://hooks.airtable.com/workflows/v1/genericWebhook/appbOPKYqQRW2HgyB/wflC65KRgujdPCz9D/wtr6aRHlG3wFvMo6H';
        
        try {
            const airtablePromise = fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(translatedPayload),
            });

            const supabasePromise = supabase.from('beta_poll_responses').insert([supabasePayload]);

            const [airtableResult, supabaseResult] = await Promise.allSettled([airtablePromise, supabasePromise]);

            let hasError = false;
            if (airtableResult.status === 'rejected' || (airtableResult.status === 'fulfilled' && !airtableResult.value.ok)) {
                console.error("Airtable submission failed:", airtableResult.status === 'rejected' ? airtableResult.reason : await airtableResult.value.text());
                hasError = true;
            }
            if (supabaseResult.status === 'rejected') {
                console.error("Supabase submission failed:", supabaseResult.reason);
                // Supabase error is less critical for the user flow
            }
            
            if (hasError) {
                 alert('Hubo un error al enviar tus respuestas. Por favor, inténtalo de nuevo.');
                 setPollState('polling');
            } else {
                setPollState('submitted');
                setParticipants(prev => prev + 1);
            }

        } catch (error) {
            console.error("Failed to send poll data:", error);
            alert('Hubo un error al enviar tus respuestas. Por favor, inténtalo de nuevo.');
            setPollState('polling');
        } finally {
             window.scrollTo(0, 0);
        }
    };
    
    const pollSections = [
        { title: 'Perfil del Usuario', fields: ['dispositivo'], textFields: [] },
        { title: 'Experiencia General', fields: ['facilidad_inventario'], textFields: ['punto_fuerte', 'punto_debil'] },
        { title: 'Inventario de Autos', fields: ['info_autos'], textFields: ['info_extra'] },
        { title: 'Portal de Financiamiento', fields: ['facilidad_login', 'claridad_dashboard'], textFields: ['problemas_financiamiento'] },
        { title: 'Confianza y Satisfacción', fields: ['confianza', 'probabilidad_uso'], textFields: ['mejora_confianza'] },
        { title: 'Puntos Ciegos', fields: [], textFields: ['momentos_frustracion', 'sorpresas_positivas', 'mejora_prioritaria', 'funciones_no_usadas'] },
        { title: 'Cierre', fields: [], textFields: ['funcionalidad_futura', 'mejor_experiencia', 'abandono', 'comentario_final'] }
    ];

    const handleNext = async () => {
        const currentFields = pollSections[currentStep].fields;
        const output = await trigger(currentFields as any, { shouldFocus: true });
        if (!output) return;

        if (currentStep < pollSections.length - 1) {
            // Clear text fields from the current step before moving to the next
            const textFieldsToClear = pollSections[currentStep].textFields;
            textFieldsToClear.forEach(field => {
                setValue(field, '');
            });
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const ParticipantCounter = () => (
        <div className="max-w-xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-2 text-sm font-semibold">
                <span className="text-gray-600">Participantes</span>
                <span className="text-neutral-800">{participants} / {participantGoal}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
             <p className="text-center text-xs text-gray-500 mt-2">
                Tu participación nos acerca a la siguiente fase de desarrollo. ¡Gracias por tu apoyo!
            </p>
        </div>
    );
    
    const renderIdleState = () => (
        <div className="text-center">
            <Edit3 className="w-16 h-16 text-primary-500 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-800 mb-4">Encuesta de Prueba Beta v.0.1</h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 mb-4">
                ¡Gracias por tu colaboración! Tu feedback es fundamental para pulir la experiencia antes del lanzamiento.
            </p>
            <PrePollGuidance />
            <ParticipantCounter />
            <button
                onClick={() => setPollState('polling')}
                className="bg-primary-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-primary-700 transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
                Empezar Encuesta
            </button>
        </div>
    );
    
    const renderRadioGroup = (props: Omit<RadioGroupProps, 'selectedOption' | 'onChange'>) => (
        <RadioGroup
            {...props}
            selectedOption={watchedValues[props.name] || null}
            onChange={(value) => setValue(props.name, value, { shouldValidate: true, shouldDirty: true })}
        />
    );

    const renderCurrentStep = () => {
        switch(currentStep) {
            case 0: // Perfil del Usuario
                return <>
                    {renderRadioGroup({ question: "¿Qué dispositivo usaste para probar la app?", name: "dispositivo", register, required: true, options: [{ value: 'Computadora', label: 'Computadora' }, { value: 'Tablet', label: 'Tablet' }, { value: 'Smartphone', label: 'Smartphone' }] })}
                </>;
            case 1: // Experiencia General
                return <>
                    {renderRadioGroup({ question: "En una escala del 1 al 10, ¿qué tan fácil fue navegar en el inventario?", name: "facilidad_inventario", register, required: true, options: Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` })) })}
                    <TextArea question="¿Qué fue lo más claro y útil en la app?" name="punto_fuerte" register={register} />
                    <TextArea question="¿Qué fue lo más confuso o complicado en tu experiencia?" name="punto_debil" register={register} />
                </>;
            case 2: // Inventario de Autos
                return <>
                    {renderRadioGroup({ question: "¿La información de los autos (fotos, descripción, precio, condiciones) fue suficiente y clara?", name: "info_autos", register, required: true, options: [{ value: 'Sí, completamente', label: 'Sí, completamente' }, { value: 'Sí, pero falta detalle', label: 'Sí, pero falta detalle' }, { value: 'No, fue insuficiente', label: 'No, fue insuficiente' }] })}
                    <TextArea question="¿Qué información extra te hubiera ayudado a decidir mejor?" name="info_extra" register={register} />
                </>;
            case 3: // Portal de Financiamiento
                return <>
                    {renderRadioGroup({ question: "En una escala del 1 al 10, ¿qué tan fácil fue iniciar sesión y registrarte?", name: "facilidad_login", register, required: true, options: Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` })) })}
                    <TextArea question="¿Tuviste algún problema al crear o enviar tu aplicación de financiamiento?" name="problemas_financiamiento" register={register} />
                    {renderRadioGroup({ question: "¿Qué tan claro fue el proceso de seguimiento en el dashboard?", name: "claridad_dashboard", register, required: true, options: [{ value: 'Muy claro', label: 'Muy claro' }, { value: 'Algo confuso', label: 'Algo confuso' }, { value: 'Muy confuso', label: 'Muy confuso' }] })}
                    <ApplicationPrompt />
                </>;
            case 4: // Confianza y Satisfacción
                return <>
                    {renderRadioGroup({ question: "¿Qué tan confiable te pareció el sistema al ingresar tus datos?", name: "confianza", register, required: true, options: [{ value: 'Muy confiable', label: 'Muy confiable' }, { value: 'Neutral', label: 'Neutral' }, { value: 'Poco confiable', label: 'Poco confiable' }] })}
                    <TextArea question="¿Qué podría aumentar tu confianza en la plataforma?" name="mejora_confianza" register={register} />
                    {renderRadioGroup({ question: "En una escala del 1 al 10, ¿qué tan probable es que vuelvas a usarla en producción?", name: "probabilidad_uso", register, required: true, options: Array.from({ length: 10 }, (_, i) => ({ value: `${i + 1}`, label: `${i + 1}` })) })}
                </>;
            case 5: // Puntos Ciegos
                return <>
                    <TextArea question="¿Hubo algún momento en que sentiste frustración, aunque resolviste el problema después?" name="momentos_frustracion" register={register} />
                    <TextArea question="¿Notaste algo que funcionó mejor de lo que esperabas?" name="sorpresas_positivas" register={register} />
                    <TextArea question="Si pudieras mejorar una sola cosa de la app, ¿cuál sería?" name="mejora_prioritaria" register={register} />
                    <TextArea question="¿Hay algo que no usaste porque no entendiste para qué servía?" name="funciones_no_usadas" register={register} />
                </>;
            case 6: // Cierre
                return <>
                    <TextArea question="¿Qué funcionalidad te gustaría ver en futuras versiones?" name="funcionalidad_futura" register={register} />
                    <TextArea question="¿Qué funcionalidad te haría tener una mejor experiencia en la app?" name="mejor_experiencia" register={register} />
                    <TextArea question="¿Qué te haría abandonar el proceso o dejar de usar la app?" name="abandono" register={register} />
                    <TextArea question="¿Hay algo más que quieras compartir sobre tu experiencia?" name="comentario_final" register={register} />
                </>;
            default: return null;
        }
    };

    const renderPollingState = () => (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            <div className="text-center">
                <h1 className="text-3xl font-extrabold text-neutral-800">Tus Respuestas nos Ayudan a Mejorar</h1>
                <p className="text-gray-600 mt-2">Estás en la sección {currentStep + 1} de {pollSections.length}: <strong>{pollSections[currentStep].title}</strong></p>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${((currentStep + 1) / pollSections.length) * 100}%` }}></div>
            </div>

            <fieldset className="bg-white p-6 rounded-xl shadow-sm border space-y-8 min-h-[300px]">
                {renderCurrentStep()}
            </fieldset>

            <div className="flex justify-between items-center pt-4">
                <button type="button" onClick={handlePrev} disabled={currentStep === 0} className="flex items-center gap-2 px-6 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    Anterior
                </button>
                {currentStep < pollSections.length - 1 ? (
                    <button type="button" onClick={handleNext} className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-md">
                        Siguiente
                        <ArrowRight className="w-5 h-5"/>
                    </button>
                ) : (
                    <button type="submit" disabled={pollState === 'submitting'} className="flex items-center gap-2 px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400">
                        {pollState === 'submitting' ? 'Enviando...' : 'Enviar Encuesta'}
                        <CheckCircle className="w-5 h-5"/>
                    </button>
                )}
            </div>
        </form>
    );

    const renderSubmittedState = () => (
        <div className="text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-800 mb-4">¡Encuesta Enviada!</h1>
            <p className="max-w-2xl mx-auto text-lg text-gray-600 mb-8">
                Muchas gracias por tu tiempo y tus valiosos comentarios. Tu feedback nos ayudará a construir una mejor experiencia para todos.
            </p>
            <Link
                to="/"
                className="bg-primary-600 text-white font-bold py-4 px-10 rounded-lg hover:bg-primary-700 transition-colors text-lg shadow-lg"
            >
                Volver al Inicio
            </Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            {pollState === 'idle' && renderIdleState()}
            {(pollState === 'polling' || pollState === 'submitting') && renderPollingState()}
            {pollState === 'submitted' && renderSubmittedState()}
        </div>
    );
};

export default BetaPollPage;