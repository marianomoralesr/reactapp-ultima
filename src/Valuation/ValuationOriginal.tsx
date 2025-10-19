import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    searchVehiclesWithAI,
    fetchIntelimotorValuation,
    saveValuationToAirtable,
    findVehicleVariations,
    ValuationFailedError
} from './services/valuationService';
import type { Vehicle, IntelimotorValuation } from '../types/types';
import Spinner from './components/Spinner';
import Confetti from './components/Confetti';
import AnimatedNumber from './components/AnimatedNumber';
import { Car, AlertTriangle, Search, CheckCircle, Info, RefreshCw, ArrowLeft } from 'lucide-react';
import { 
    PrintIcon, 
    DocumentDuplicateIcon, 
    CheckIcon 
} from '../components/icons';
import { config } from '../config';
import StepIndicator from './components/StepIndicator';


const valuationSchema = z.object({
  mileage: z.string().min(1, 'El kilometraje es requerido.'),
  clientName: z.string().min(2, 'Tu nombre es requerido.'),
  clientPhone: z.string().min(10, 'El teléfono debe tener 10 dígitos.'),
  clientEmail: z.string().email('El correo es inválido.'),
});
type ValuationFormData = z.infer<typeof valuationSchema>;

const VALUATION_FORM_STATE_KEY = 'trefaValuationFormState';
const navigate = useNavigate();


function ValuationApp({ initialSearchQuery }: { initialSearchQuery?: string | null }) {
  const [step, setStep] = useState<'vehicle' | 'contact' | 'valuating' | 'success'>('vehicle');
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || '');
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const [valuation, setValuation] = useState<IntelimotorValuation | null>(null);
  const [valuationPromise, setValuationPromise] = useState<Promise<{ valuation: IntelimotorValuation; rawResponse: any; }> | null>(null);
  const [alternativeVehicles, setAlternativeVehicles] = useState<Vehicle[]>([]);
  
  const [copied, setCopied] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const currencyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

  const { register, handleSubmit, formState: { errors }, setValue, trigger, reset, getValues, watch } = useForm<ValuationFormData>({
    resolver: zodResolver(valuationSchema),
    mode: 'onChange'
  });
  
  useEffect(() => {
    if (initialSearchQuery) {
        setSearchQuery(initialSearchQuery);
    }
    try {
      const savedStateJSON = localStorage.getItem(VALUATION_FORM_STATE_KEY);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState) {
          setSelectedVehicle(savedState.selectedVehicle || null);
          setSearchQuery(savedState.searchQuery || initialSearchQuery || '');
          reset(savedState.formData || {});
        }
      }
    } catch (e) { console.error("Failed to load saved valuation state.", e); }
  }, [initialSearchQuery, reset]);

  useEffect(() => {
    if (step !== 'vehicle' && step !== 'contact') return;
    const subscription = watch((values) => {
        const stateToSave = {
            selectedVehicle,
            searchQuery,
            formData: values,
        };
        localStorage.setItem(VALUATION_FORM_STATE_KEY, JSON.stringify(stateToSave));
    });
    return () => subscription.unsubscribe();
  }, [watch, selectedVehicle, searchQuery, step]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      setError(null);
      const handler = setTimeout(() => {
        searchVehiclesWithAI(
          config.airtable.valuation.apiKey,
          searchQuery,
          config.airtable.valuation.baseId,
          config.airtable.valuation.tableId,
          config.airtable.valuation.view
        )
          .then(res => { setVehicleOptions(res); setIsDropdownOpen(res.length > 0); })
          .catch(err => setError(err.message))
          .finally(() => setIsSearching(false));
      }, 300);
      return () => clearTimeout(handler);
    } else {
      setVehicleOptions([]);
      setIsDropdownOpen(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setSearchQuery(vehicle.label);
    setIsDropdownOpen(false);
    setError(null);
    setAlternativeVehicles([]);
    
    const currentYear = new Date().getFullYear();
    const carAge = Math.max(0, currentYear - vehicle.year);
    const estimatedMileage = Math.min(carAge * 15000, 85000);
    const roundedMileage = Math.round(estimatedMileage / 1000) * 1000;
    setValue('mileage', roundedMileage > 0 ? roundedMileage.toLocaleString('es-MX') : '');
    trigger('mileage');
  };
  
  const handleContinueToContact = async () => {
    const isMileageValid = await trigger('mileage');
    if (!selectedVehicle) {
        setError("Por favor, selecciona un auto de la lista para continuar.");
        return;
    }
    if (!isMileageValid) return;
    
    setError(null);

    const numericMileage = parseInt(getValues('mileage').replace(/[^0-9]/g, ''), 10);
    const promise = fetchIntelimotorValuation({
        vehicle: selectedVehicle, mileage: numericMileage,
        businessUnitId: config.intelimotor.businessUnitId, apiKey: config.intelimotor.apiKey,
        apiSecret: config.intelimotor.apiSecret
    });
    setValuationPromise(promise);
    setStep('contact');
  };

  const onSubmit = async (data: ValuationFormData) => {
    if (!valuationPromise) {
      setError("La valuación no se inició. Por favor, vuelve al paso anterior.");
      return;
    }
    
    setStep('valuating');
    setError(null);

    try {
        const result = await valuationPromise;
        setValuation(result.valuation);

        await saveValuationToAirtable({
            'Inventario': [selectedVehicle!.id], 'Kilometraje': parseInt(data.mileage.replace(/[^0-9]/g, ''), 10),
            'Oferta Sugerida': result.valuation.suggestedOffer,
            'Valor Mercado Alto': result.valuation.highMarketValue,
            'Valor Mercado Bajo': result.valuation.lowMarketValue,
            'Client Name': data.clientName, 'Client Phone': data.clientPhone, 'Client Email': data.clientEmail,
        }, config.airtable.valuation.apiKey, config.airtable.valuation.baseId, config.airtable.valuation.storageTableId);
        
        localStorage.removeItem(VALUATION_FORM_STATE_KEY);
        setStep('success');
    } catch (err: any) {
        if (err instanceof ValuationFailedError) {
            setError("No pudimos generar una oferta. ¿Quizá alguno de estos sea tu auto?");
            findVehicleVariations(selectedVehicle!, config.airtable.valuation.baseId, config.airtable.valuation.tableId, config.airtable.valuation.view, config.airtable.valuation.apiKey)
                .then(setAlternativeVehicles).catch(e => console.error("Error finding alternatives:", e));
        } else {
            setError(err.message || "No pudimos generar una oferta. Inténtalo de nuevo.");
        }
        setStep('contact'); // Go back to contact step on error
    }
  };

  const handleReset = () => {
    setStep('vehicle');
    setError(null);
    setSearchQuery('');
    setSelectedVehicle(null);
    setValuation(null);
    setValuationPromise(null);
    setAlternativeVehicles([]);
    reset({ mileage: '', clientName: '', clientPhone: '', clientEmail: '' });
    localStorage.removeItem(VALUATION_FORM_STATE_KEY);
  };

  const handleCopy = () => {
    if (!valuation || !selectedVehicle) return;
    const text = `TREFA me ofreció ${currencyFormatter.format(valuation.suggestedOffer)} por mi ${selectedVehicle.label}. ¡Valúa tu auto también! ${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    });
  };

  const offer = valuation?.suggestedOffer || 0;
  const whatsappText = `Me interesa vender mi ${selectedVehicle?.label} por la cantidad de ${currencyFormatter.format(offer)}, y quisiera concretar una cita de inspección.`;
  const whatsappUrl = `https://wa.me/528187049079?text=${encodeURIComponent(whatsappText)}`;

  const handleContinueToSellForm = () => {
    navigate('/escritorio/vende-mi-auto', { state: { valuationData: { vehicle: selectedVehicle, valuation } } });
  };
  
  const steps = [
    { id: 'vehicle', name: 'Tu auto' },
    { id: 'contact', name: 'Tus Datos' },
    { id: 'success', name: 'Tu Oferta' }
  ];

  let currentStepId = step;
  if (step === 'valuating' || step === 'success') {
      currentStepId = 'success';
  }

  if (step === 'success' && valuation) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-lg mx-auto w-full text-center animate-pop-in">
        <Confetti />
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold mt-4 text-gray-900">¡Tenemos una oferta para ti!</h2>
        <div className="p-6 bg-gray-50 rounded-lg my-6 border border-gray-200">
          <p className="text-lg font-medium text-gray-600">Oferta de Compra Estimada</p>
          <p className="text-5xl font-extrabold text-primary-600 tracking-tight my-2">
            <AnimatedNumber value={offer} />
          </p>
          <p className="text-sm text-gray-500">para tu {selectedVehicle?.label}</p>
        </div>
        <div className="space-y-3">
          <button onClick={handleContinueToSellForm} className="block w-full py-3.5 px-4 font-bold text-white bg-primary-600 rounded-lg transition hover:bg-primary-700">Continuar con la venta</button>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-3.5 px-4 font-bold text-white bg-green-600 rounded-lg transition hover:bg-green-700">Aceptar y Agendar Inspección</a>
        </div>
        <div className="flex items-center justify-center gap-6 pt-6 mt-4 border-t border-gray-200">
            <button onClick={() => window.print()} className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors">
                <PrintIcon className="w-6 h-6"/> <span className="text-xs">Imprimir</span>
            </button>
            <button onClick={handleCopy} className="flex flex-col items-center gap-1 text-gray-500 hover:text-primary-600 transition-colors">
                {copied ? <CheckIcon className="w-6 h-6 text-green-500" /> : <DocumentDuplicateIcon className="w-6 h-6"/>}
                <span className="text-xs">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
        </div>
        <button onClick={handleReset} className="mt-6 flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 mx-auto"><RefreshCw className="w-4 h-4" /> Cotizar otro auto</button>
      </div>
    );
  }


  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg max-w-2xl mx-auto w-full">
      <div className="text-center">
        <Car className="w-12 h-12 text-primary-500 mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mt-4">Cotiza el valor de tu auto</h1>
        <p className="text-gray-600 mt-2">Recibe una oferta por tu auto en segundos</p>
      </div>
      
      <div className="my-8 flex justify-center">
        <StepIndicator steps={steps} currentStepId={currentStepId} />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        {step === 'vehicle' && (
          <div className="space-y-6 animate-pop-in">
            <div className="relative" ref={dropdownRef}>
              <label htmlFor="vehicle-search" className="block text-sm font-medium text-gray-700 mb-1">1. Busca tu auto</label>
              <div className="relative">
                <input id="vehicle-search" type="text" placeholder="Ej: Nissan Versa 2020" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setSelectedVehicle(null); }} autoComplete="off"
                  className="w-full text-base bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 focus:outline-none placeholder-gray-400 pl-10" />
                <div className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400">{isSearching ? <Spinner className="w-5 h-5" /> : <Search className="w-5 h-5"/>}</div>
              </div>
              {isDropdownOpen && vehicleOptions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {vehicleOptions.map(v => <li key={v.id} onClick={() => handleSelectVehicle(v)} className="px-4 py-2 text-base text-gray-800 hover:bg-primary-50 cursor-pointer">{v.label}</li>)}
                </ul>
              )}
            </div>
            <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">2. Kilometraje</label>
                <input id="mileage" {...register('mileage')} placeholder="Ej: 45,000 km" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400" />
                {errors.mileage && <p className="text-xs text-red-500 mt-1">{errors.mileage.message}</p>}
            </div>
            {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2"><AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />{error}</div>}
             <button type="button" onClick={handleContinueToContact} data-gtm-id="valuation-step1-continue"
                className="w-full py-4 px-8 font-bold text-white bg-gradient-to-r from-yellow-500 to-primary-500 rounded-lg transition hover:from-yellow-600 hover:to-primary-600 flex items-center justify-center gap-2 text-lg">
                Continuar
            </button>
          </div>
        )}
        
        {step === 'contact' && (
             <div className="space-y-6 animate-pop-in">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-600">auto seleccionado:</p>
                    <p className="font-semibold text-gray-900">{selectedVehicle?.label}</p>
                </div>
                <h2 className="text-lg font-semibold text-gray-800 text-center -mb-2">Casi listo. Faltan tus datos.</h2>
                <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input id="clientName" {...register('clientName')} className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400" />
                    {errors.clientName && <p className="text-xs text-red-500 mt-1">{errors.clientName.message}</p>}
                </div>
                 <div>
                    <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">Teléfono (10 dígitos)</label>
                    <input id="clientPhone" {...register('clientPhone')} type="tel" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400" />
                    {errors.clientPhone && <p className="text-xs text-red-500 mt-1">{errors.clientPhone.message}</p>}
                </div>
                 <div>
                    <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                    <input id="clientEmail" {...register('clientEmail')} type="email" className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400" />
                    {errors.clientEmail && <p className="text-xs text-red-500 mt-1">{errors.clientEmail.message}</p>}
                </div>
                {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2"><AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />{error}</div>}
                
                {alternativeVehicles.length > 0 && (
                     <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-gray-800 text-sm flex items-center"><Info className="w-5 h-5 mr-2 text-blue-500" />Alternativas Sugeridas</h4>
                        <ul className="mt-2 space-y-2">
                            {alternativeVehicles.map(v => <li key={v.id} onClick={() => handleSelectVehicle(v)} className="p-2 text-sm bg-white rounded cursor-pointer hover:bg-primary-50">{v.label}</li>)}
                        </ul>
                    </div>
                )}
                
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => setStep('vehicle')} className="w-1/3 py-4 px-4 font-bold text-gray-700 bg-gray-200 rounded-lg transition hover:bg-gray-300 flex items-center justify-center gap-2 text-lg">
                        <ArrowLeft className="w-5 h-5"/> Atrás
                    </button>
                    <button type="submit" data-gtm-id="valuation-step2-submit"
                        className="w-2/3 py-4 px-8 font-bold text-white bg-gradient-to-r from-yellow-500 to-primary-500 rounded-lg transition hover:from-yellow-600 hover:to-primary-600 flex items-center justify-center gap-2 text-lg">
                        Obtener Oferta
                    </button>
                </div>
             </div>
        )}

        {step === 'valuating' && (
            <div className="text-center py-10">
                <Spinner className="w-12 h-12 mx-auto text-primary-600"/>
                <p className="mt-4 font-semibold text-gray-700">Finalizando tu oferta...</p>
                <p className="text-sm text-gray-500">Estamos consultando los últimos datos del mercado.</p>
            </div>
        )}
      </form>
      <p className="text-center text-xs text-gray-400 mt-6">Sin costo • Sin compromiso • Con la tecnología de Intelimotor®</p>
    </div>
  );
}

export default ValuationApp;
