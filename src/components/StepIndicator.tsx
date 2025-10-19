import React from 'react';

interface Step {
  title: string;
  icon: React.ElementType;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => (
          <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
            {stepIdx < steps.length - 1 && (
                <div className={`absolute left-4 top-1/2 -ml-px mt-0.5 h-0.5 w-full ${stepIdx < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} aria-hidden="true" />
            )}
            
            <div className="relative flex flex-col items-center text-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${stepIdx <= currentStep ? 'bg-blue-600' : 'bg-white border-2 border-gray-300'}`}>
                    <step.icon className={`h-5 w-5 ${stepIdx <= currentStep ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />
                </div>
                <p className={`mt-2 text-xs text-center ${stepIdx <= currentStep ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>{step.title}</p>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default StepIndicator;