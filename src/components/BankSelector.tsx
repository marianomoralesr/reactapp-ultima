import React from 'react';

interface Bank {
  id: string;
  name: string;
  logo: string;
  color: string;
  score: number;
}

const banks: Bank[] = [
    {id: 'bbva', name: 'BBVA', logo: 'B', color: 'blue', score: 92},
    {id: 'scotiabank', name: 'Scotiabank', logo: 'S', color: 'red', score: 88},
    {id: 'banorte', name: 'Banorte', logo: 'B', color: 'orange', score: 85},
    {id: 'hsbc', name: 'HSBC', logo: 'H', color: 'red', score: 81},
    {id: 'santander', name: 'Santander', logo: 'S', color: 'red', score: 78},
    {id: 'banregio', name: 'Banregio', logo: 'B', color: 'orange', score: 75},
];

interface BankSelectorProps {
  selectedBanks: string[];
  onSelectionChange: (selected: string[]) => void;
}

const BankSelector: React.FC<BankSelectorProps> = ({ selectedBanks, onSelectionChange }) => {
  const toggleBank = (bankId: string) => {
    const newSelection = selectedBanks.includes(bankId)
      ? selectedBanks.filter(id => id !== bankId)
      : [...selectedBanks, bankId];
    onSelectionChange(newSelection);
  };

  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    orange: 'bg-orange-500',
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Selecciona Bancos</h3>
        <p className="text-sm text-gray-600">
          Elige los bancos a los que quieres enviar tu solicitud. Te recomendamos los que tienen mayor probabilidad de aprobación para tu perfil.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {banks.sort((a,b) => b.score - a.score).map(bank => {
          const isSelected = selectedBanks.includes(bank.id);
          const logoColorClass = colorClasses[bank.color] || 'bg-gray-500';
          return (
            <div
              key={bank.id}
              onClick={() => toggleBank(bank.id)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${isSelected ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500/50' : 'border-gray-300 bg-white hover:border-primary-400'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-grow min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-full ${logoColorClass} flex-shrink-0 flex items-center justify-center text-white font-bold text-lg`}>
                    {bank.logo}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-semibold text-gray-900 truncate" title={bank.name}>{bank.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(bank.score)}`} style={{ width: `${bank.score}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 flex-shrink-0">{bank.score}%</span>
                    </div>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  checked={isSelected} 
                  readOnly 
                  className="h-5 w-5 rounded-md text-primary-500 focus:ring-primary-500 bg-gray-50 border-gray-300 mt-1 flex-shrink-0"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BankSelector;