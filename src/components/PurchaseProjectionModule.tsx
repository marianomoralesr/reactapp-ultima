import React, { useState } from 'react';
import { Calculator } from 'lucide-react';

const PurchaseProjectionModule: React.FC = () => {
  const [vehiclePrice, setVehiclePrice] = useState<number | ''>(0);
  const [downPayment, setDownPayment] = useState<number | ''>(0);
  const [loanTerm, setLoanTerm] = useState<number | ''>(60); // Default to 60 months
  const [interestRate, setInterestRate] = useState<number | ''>(15); // Default to 15% annual
  const [monthlyPayment, setMonthlyPayment] = useState<number | null>(null);

  const calculateMonthlyPayment = () => {
    const price = Number(vehiclePrice);
    const down = Number(downPayment);
    const term = Number(loanTerm);
    const rate = Number(interestRate) / 100 / 12; // Monthly interest rate

    if (isNaN(price) || isNaN(down) || isNaN(term) || isNaN(rate) || price <= 0 || term <= 0 || rate <= 0) {
      setMonthlyPayment(null);
      return;
    }

    const principal = price - down;
    if (principal <= 0) {
      setMonthlyPayment(0);
      return;
    }

    const payment = (principal * rate) / (1 - Math.pow(1 + rate, -term));
    setMonthlyPayment(payment);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center mb-4">
        <Calculator className="w-6 h-6 text-primary-600 mr-3" />
        <h2 className="text-lg font-semibold text-gray-900">Proyección de Compra</h2>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        Estima tus pagos mensuales para la compra de un vehículo.
      </p>

      <div className="space-y-4">
        <div>
          <label htmlFor="vehiclePrice" className="block text-sm font-medium text-gray-700">Precio del Vehículo ($)</label>
          <input
            type="number"
            id="vehiclePrice"
            value={vehiclePrice}
            onChange={(e) => setVehiclePrice(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: 250000"
          />
        </div>
        <div>
          <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700">Enganche ($)</label>
          <input
            type="number"
            id="downPayment"
            value={downPayment}
            onChange={(e) => setDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: 50000"
          />
        </div>
        <div>
          <label htmlFor="loanTerm" className="block text-sm font-medium text-gray-700">Plazo (Meses)</label>
          <select
            id="loanTerm"
            value={loanTerm}
            onChange={(e) => setLoanTerm(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={36}>36</option>
            <option value={48}>48</option>
            <option value={60}>60</option>
            <option value={72}>72</option>
          </select>
        </div>
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-gray-700">Tasa de Interés Anual (%)</label>
          <input
            type="number"
            id="interestRate"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value === '' ? '' : Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Ej: 15"
          />
        </div>
        <button
          onClick={calculateMonthlyPayment}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Calcular Pago Mensual
        </button>
      </div>

      {monthlyPayment !== null && (monthlyPayment > 0) && (
        <div className="mt-6 p-4 bg-primary-50 rounded-md text-center">
          <p className="text-sm font-medium text-primary-800">Pago Mensual Estimado:</p>
          <p className="text-2xl font-bold text-primary-900 mt-1">
            {monthlyPayment.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
          </p>
        </div>
      )}
    </div>
  );
};

export default PurchaseProjectionModule;