import React from 'react';

interface Step {
  id: string;
  name: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStepId: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStepId }) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStepId);

  return (
    <nav aria-label="Progreso del cotizador">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''} px-2`}>
            {stepIdx < steps.length - 1 ? (
              <div
                className={`absolute left-1/2 top-4 h-0.5 w-full ${stepIdx < currentStepIndex ? 'bg-primary-700' : 'bg-gray-300'}`}
                aria-hidden="true"
              />
            ) : null}

            <div className="relative flex flex-col items-center text-center">
              {stepIdx < currentStepIndex ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-700">
                    <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-gray-700">{step.name}</p>
                </>
              ) : stepIdx === currentStepIndex ? (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary-600 bg-white">
                    <span className="text-sm font-semibold text-primary-600">{stepIdx + 1}</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-primary-600">{step.name}</p>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                    <span className="text-sm text-gray-500">{stepIdx + 1}</span>
                  </div>
                   <p className="mt-3 text-xs font-medium text-gray-500">{step.name}</p>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;