import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import ValuationApp from '../Valuation/App';
import { 
    BuildingIcon, CarIcon, CalendarIcon, MessageSquareIcon, WrenchIcon, MicroscopeIcon, 
    DollarSignIcon, PenSquareIcon, ChevronLeftIcon, Loader2Icon, CheckCircleIcon 
} from '../components/icons';
import useSEO from '../hooks/useSEO';

// --- Configuration ---
const BRANCHES = [
    { id: 'MTY', name: 'Monterrey', calendlyUrl: config.calendly.MTY },
    { id: 'GPE', name: 'Guadalupe', calendlyUrl: config.calendly.GPE },
    { id: 'TMPS', name: 'Reynosa', calendlyUrl: config.calendly.TMPS },
    { id: 'COAH', name: 'Saltillo', calendlyUrl: config.calendly.COAH },
];

const VISIT_REASONS = [
    { id: 'Prueba de manejo', label: 'Prueba de manejo', icon: CarIcon },
    { id: 'Conocer los autos', label: 'Conocer los autos', icon: CarIcon },
    { id: 'Inspección', label: 'Inspección', icon: MicroscopeIcon },
    { id: 'Mantenimiento', label: 'Mantenimiento', icon: WrenchIcon },
    { id: 'Vender auto', label: 'Vender mi auto', icon: DollarSignIcon },
    { id: 'Otro', label: 'Otro motivo', icon: PenSquareIcon },
];

// Generates some plausible future dates and times
const getAvailableSlots = () => {
    const slots: { date: string, times: string[] }[] = [];
    const today = new Date();
    for (let i = 1; i <= 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        slots.push({
            date: date.toLocaleDateString('es-MX', { weekday: 'long', month: 'long', day: 'numeric' }),
            times: ['10:00 AM', '12:00 PM', '03:00 PM']
        });
    }
    return slots;
};

// --- Main Component ---
const VisitasPage: React.FC = () => {
    useSEO({
        title: 'Agenda tu Visita o Prueba de Manejo | TREFA',
        description: 'Agenda tu cita en cualquiera de nuestras sucursales para una prueba de manejo, inspección o mantenimiento. Atención personalizada garantizada.',
        keywords: 'agendar cita trefa, prueba de manejo, cita agencia seminuevos, visitar trefa, inspección de auto'
    });

    const { user } = useAuth();
    
    // State Management
    type Step = 'branch' | 'reason' | 'other_reason' | 'valuation' | 'calendly' | 'dateTime' | 'message' | 'confirm' | 'success';
    const [step, setStep] = useState<Step>('branch');
    const [formData, setFormData] = useState({
        branch: '',
        reason: '',
        otherReason: '',
        message: '',
        date: '',
        time: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<Step[]>([]);

    // Mock CRM function as requested
    const logToCRM = async (event: string, data: Record<string, any>) => {
        console.log(`[CRM LOG] Event: ${event}`, { ...data, userId: user?.id, timestamp: new Date().toISOString() });
        // Simulate a network request
        await new Promise(res => setTimeout(res, 100));
    };

    // Step Transition Logic
    const handleNextStep = (nextStep: Step, eventName: string, data: Record<string, any>) => {
        setError(null);
        setHistory(prev => [...prev, step]);
        setFormData(prev => ({ ...prev, ...data }));
        setStep(nextStep);
        logToCRM(eventName, { ...formData, ...data });
    };

    const handleBack = () => {
        setError(null);
        const previousStep = history[history.length - 1];
        if (previousStep) {
            setHistory(prev => prev.slice(0, -1));
            setStep(previousStep);
        }
    };
    
    const handleSelectBranch = (branch: { id: string, name: string }) => {
        handleNextStep('reason', 'branch_selected', { branch: branch.name });
    };

    const handleSelectReason = (reason: string) => {
        if (reason === 'Otro') {
            handleNextStep('other_reason', 'reason_selected', { reason });
        } else if (['Prueba de manejo', 'Inspección'].includes(reason)) {
            handleNextStep('calendly', 'reason_selected', { reason });
        } else if (reason === 'Vender auto') {
            handleNextStep('valuation', 'reason_selected', { reason });
        } else {
            handleNextStep('dateTime', 'reason_selected', { reason });
        }
    };

    const handleValuationContinue = () => {
        // This function is called after the user interacts with the valuation form.
        handleNextStep('calendly', 'valuation_form_completed', { reason: 'Vender auto' });
    };

    const handleDateTimeSelect = (date: string, time: string) => {
        handleNextStep('message', 'datetime_selected', { date, time });
    };

    const handleSubmitMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const message = (e.target as any).message.value;
        if (message.trim().length < 5 && formData.reason === 'Otro') {
            setError("Por favor, describe brevemente tu motivo.");
            return;
        }
        handleNextStep('confirm', 'message_submitted', { message });
    };
    
    const handleConfirm = async () => {
        setIsSubmitting(true);
        setError(null);
        await logToCRM('appointment_confirmed', formData);
        await new Promise(res => setTimeout(res, 1500)); // Simulate final submission
        setIsSubmitting(false);
        setStep('success');
    };
    
    // Memoized values for rendering
    const selectedBranch = useMemo(() => BRANCHES.find(b => b.name === formData.branch), [formData.branch]);
    const availableSlots = useMemo(() => getAvailableSlots(), []);

    // --- Step Components ---
    const renderStep = () => {
        const commonWrapperClass = "bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in-up";
        
        switch (step) {
            case 'branch':
                return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={BuildingIcon} title="¿En qué sucursal te gustaría agendar tu cita?" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                            {BRANCHES.map(b => <OptionButton key={b.id} onClick={() => handleSelectBranch(b)} text={b.name} />)}
                        </div>
                    </div>
                );

            case 'reason':
                return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={MessageSquareIcon} title="Excelente, ¿cuál es el motivo de tu visita?" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                           {VISIT_REASONS.map(r => <OptionButton key={r.id} onClick={() => handleSelectReason(r.id)} text={r.label} icon={r.icon} />)}
                        </div>
                    </div>
                );

            case 'other_reason':
                 return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={PenSquareIcon} title="Por favor, describe el motivo de tu visita." />
                        <form onSubmit={handleSubmitMessage} className="mt-6 space-y-4">
                            <textarea name="message" rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Ej: Quiero revisar el estatus de mi trámite..."></textarea>
                            {error && <p className="text-sm text-red-500">{error}</p>}
                            <ActionButton type="submit" text="Continuar" />
                        </form>
                    </div>
                );

            case 'valuation':
                return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={DollarSignIcon} title="Primero, ayúdanos a valuar tu auto" />
                        <p className="text-sm text-gray-600 mt-2">Completa el formulario para obtener una oferta instantánea. Al terminar, podrás agendar la cita de inspección.</p>
                        <div className="mt-6 border-t pt-6">
                            <ValuationApp />
                        </div>
                        <div className="mt-6 text-center">
                            <ActionButton onClick={handleValuationContinue} text="Terminé de valuar, continuar a la agenda" />
                        </div>
                    </div>
                );
                
            case 'calendly':
                return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={CalendarIcon} title="Selecciona una fecha y hora en nuestra agenda" />
                        <div className="mt-6 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                             {selectedBranch?.calendlyUrl ? (
                                <iframe src={selectedBranch.calendlyUrl} width="100%" height="100%" frameBorder="0"></iframe>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">No se pudo cargar la agenda.</div>
                            )}
                        </div>
                        <p className="text-xs text-center text-gray-500 mt-4">Después de agendar en Calendly, tu cita quedará confirmada.</p>
                    </div>
                );

            case 'dateTime':
                return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={CalendarIcon} title="Elige una fecha y hora" />
                        <div className="mt-6 space-y-4">
                            {availableSlots.map(slot => (
                                <div key={slot.date}>
                                    <p className="font-semibold text-gray-700">{slot.date}</p>
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {slot.times.map(time => <OptionButton key={time} onClick={() => handleDateTimeSelect(slot.date, time)} text={time} />)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'message':
                return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={MessageSquareIcon} title="¿Hay algo más que debamos saber?" />
                        <form onSubmit={handleSubmitMessage} className="mt-6 space-y-4">
                            <textarea name="message" rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="Mensaje adicional (opcional)"></textarea>
                            <ActionButton type="submit" text="Continuar" />
                        </form>
                    </div>
                );

            case 'confirm':
                return (
                    <div className={commonWrapperClass}>
                        <StepHeader icon={CheckCircleIcon} title="Confirma los datos de tu cita" />
                        <div className="mt-6 space-y-3 p-4 bg-gray-50 rounded-lg border">
                            <p><strong>Sucursal:</strong> {formData.branch}</p>
                            <p><strong>Motivo:</strong> {formData.reason === 'Otro' ? formData.otherReason : formData.reason}</p>
                            <p><strong>Fecha:</strong> {formData.date}</p>
                            <p><strong>Hora:</strong> {formData.time}</p>
                            {formData.message && <p><strong>Mensaje:</strong> {formData.message}</p>}
                        </div>
                        <div className="mt-6">
                            <ActionButton onClick={handleConfirm} text={isSubmitting ? "Confirmando..." : "Confirmar Cita"} disabled={isSubmitting} icon={isSubmitting ? Loader2Icon : undefined} />
                        </div>
                    </div>
                );

            case 'success':
                 return (
                    <div className={`${commonWrapperClass} text-center`}>
                        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900">¡Cita Agendada!</h2>
                        <p className="mt-2 text-gray-600">Hemos recibido tu solicitud. Recibirás una confirmación por correo electrónico en breve.</p>
                        <p className="mt-1 text-gray-600">¡Te esperamos en la sucursal de {formData.branch}!</p>
                    </div>
                );
        }
    };
    
    return (
        <div className="w-full py-12 px-4 sm:px-6">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-800">Agenda tu Visita</h1>
                    <p className="mt-3 text-lg text-gray-600">Es rápido, fácil y te asegura una atención personalizada.</p>
                </div>

                <div className="relative">
                    {history.length > 0 && step !== 'success' && (
                        <button onClick={handleBack} className="absolute -top-4 left-0 flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-800">
                            <ChevronLeftIcon className="w-4 h-4" /> Atrás
                        </button>
                    )}
                    {renderStep()}
                </div>
            </div>
        </div>
    );
};

// --- Child Components ---
const StepHeader: React.FC<{ icon: React.ElementType, title: string }> = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-3 text-xl font-bold text-gray-800">
        <Icon className="w-6 h-6 text-primary-600 flex-shrink-0" />
        <h2>{title}</h2>
    </div>
);

const OptionButton: React.FC<{ onClick: () => void, text: string, icon?: React.ElementType }> = ({ onClick, text, icon: Icon }) => (
    <button onClick={onClick} className="w-full flex items-center justify-center gap-3 text-left p-4 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600 transition-all transform hover:-translate-y-0.5">
        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
        {text}
    </button>
);

const ActionButton: React.FC<{ onClick?: () => void, text: string, type?: 'button' | 'submit', disabled?: boolean, icon?: React.ElementType }> = ({ onClick, text, type = 'button', disabled, icon: Icon }) => (
    <button type={type} onClick={onClick} disabled={disabled} className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-60">
        {Icon && <Icon className="w-5 h-5 animate-spin" />}
        {text}
    </button>
);

export default VisitasPage;