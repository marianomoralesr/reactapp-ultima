import React from 'react';
import { CheckCircle } from 'lucide-react';

interface StepProps {
  number: number;
  label: string;
  isComplete: boolean;
  isLast?: boolean;
}

const Step: React.FC<StepProps> = ({ number, label, isComplete, isLast = false }) => (
  <div className="flex items-start">
    <div className="flex flex-col items-center mr-4">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${isComplete ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-600'}`}>
        {isComplete ? <CheckCircle className="w-5 h-5" /> : number}
      </div>
      {!isLast && <div className={`w-0.5 h-12 mt-2 ${isComplete ? 'bg-blue-800' : 'bg-gray-200'}`} />}
    </div>
    <div className="pt-1">
      <p className={`font-semibold ${isComplete ? 'text-gray-800' : 'text-gray-500'}`}>{label}</p>
    </div>
  </div>
);

interface VerticalStepperProps {
  profileComplete: boolean;
  bankProfileComplete: boolean;
  applicationComplete: boolean;
  documentsComplete: boolean;
}

const VerticalStepper: React.FC<VerticalStepperProps> = ({
  profileComplete,
  bankProfileComplete,
  applicationComplete,
  documentsComplete,
}) => {
  const steps = [
    { label: 'Completa tu Perfil', status: profileComplete },
    { label: 'Perfilamiento Bancario', status: bankProfileComplete },
    { label: 'Solicitud de Financiamiento', status: applicationComplete },
    { label: 'Envío de Documentos', status: documentsComplete },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Siguientes Pasos</h2>
      <div className="flex flex-col">
        {steps.map((step, index) => (
          <Step
            key={index}
            number={index + 1}
            label={step.label}
            isComplete={step.status}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default VerticalStepper;