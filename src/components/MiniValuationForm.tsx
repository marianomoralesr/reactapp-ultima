import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from './icons';
import { searchVehiclesWithAI } from '../Valuation/services/valuationService';
import { config } from '../config';
import type { Vehicle } from '../types/types';
import { Search, Loader2 } from 'lucide-react';

interface MiniValuationFormProps {
  onClose: () => void;
}

const MiniValuationForm: React.FC<MiniValuationFormProps> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleOptions, setVehicleOptions] = useState<Vehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      const handler = setTimeout(() => {
        searchVehiclesWithAI(
          searchQuery,
          config.airtable.valuation.apiKey,
          config.airtable.valuation.baseId,
          config.airtable.valuation.tableId,
          config.airtable.valuation.view
        )
          .then(res => { setVehicleOptions(res); setIsDropdownOpen(res.length > 0); })
          .catch(err => console.error("Error searching vehicles in MiniValuationForm:", err))
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
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
    if (selectedVehicle?.ordencompra) {
      navigate(`/escritorio/aplicacion?ordencompra=${encodeURIComponent(selectedVehicle.ordencompra)}`);
    } else if (searchQuery.trim()) {
      navigate(`/vender-mi-auto?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/vender-mi-auto');
    }
  };

  return (
    <div className="w-full h-full rounded-lg p-6 flex flex-col justify-between text-left bg-gradient-to-br from-orange-500 to-primary-600 text-white overflow-hidden relative shadow-lg">
      <div className="relative z-10">
        <h3 className="font-extrabold text-xl leading-tight">Vende tu Auto Fácil</h3>
        <p className="mt-2 text-base text-white/90">Recibe una oferta competitiva en segundos. Ingresa los datos de tu auto.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-6 relative z-10" ref={dropdownRef}>
        <div className="relative">
          <input
            type="text"
            value={selectedVehicle ? selectedVehicle.label : searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedVehicle(null); }}
            placeholder="Ej: Nissan Versa 2020"
            className="w-full bg-white/20 border border-white/40 rounded-md py-2.5 px-4 text-white placeholder-white/80 focus:ring-2 focus:ring-white focus:border-transparent transition-all pl-10"
            onFocus={() => setIsDropdownOpen(searchQuery.length > 2 && vehicleOptions.length > 0)}
          />
          <div className="absolute top-1/2 left-3 -translate-y-1/2 text-white/60">
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          </div>
        </div>
        {isDropdownOpen && vehicleOptions.length > 0 && (
          <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {vehicleOptions.map(v => (
              <li key={v.id} onClick={() => handleSelectVehicle(v)} className="px-4 py-2 text-base text-gray-800 hover:bg-primary-50 cursor-pointer">
                {v.label}
              </li>
            ))}
          </ul>
        )}
        <button
          type="submit"
          disabled={isSearching || (searchQuery.length > 0 && !selectedVehicle)}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-md font-bold text-base py-3 px-4 bg-white text-primary-600 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <span>Cotizar Ahora</span>
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MiniValuationForm;