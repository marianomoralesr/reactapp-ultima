import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface OnboardingStepperProps {
  profileComplete: boolean;
  bankProfileComplete: boolean;
  applicationComplete: boolean;
  documentsComplete: boolean;
}

const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
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

  const allStepsComplete = steps.every(step => step.status);

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${allStepsComplete ? 'border-green-400' : ''}`}>
      <h2 className="text-lg font-bold text-gray-900 mb-4">Tu Progreso</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center">
            {step.status ? (
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            ) : (
              <Circle className="w-8 h-8 text-gray-300 mb-2" />
            )}
            <p className={`text-sm font-medium ${step.status ? 'text-gray-800' : 'text-gray-500'}`}>
              {step.label}
            </p>
          </div>
        ))}
      </div>
      {allStepsComplete && (
        <div className="mt-4 text-center text-green-600 font-semibold">
          ¡Felicidades! Has completado todos los pasos.
        </div>
      )}
    </div>
  );
};

export default OnboardingStepper;