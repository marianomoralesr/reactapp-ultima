import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import type { WordPressVehicle } from '../types/types';
import { useVehicles } from '../context/VehicleContext';
import { formatPrice } from '../utils/formatters';

const HeaderSearchBar: React.FC = () => {
  const { vehicles: allVehicles } = useVehicles();
  const [query, setQuery] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [results, setResults] = useState<WordPressVehicle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tooltipShown = sessionStorage.getItem('headerSearchTooltipShown');
    if (!tooltipShown) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        sessionStorage.setItem('headerSearchTooltipShown', 'true');
      }, 2500); // Wait 2.5s before showing
      
      const hideTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 7500); // Tooltip is visible for 5s

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      setIsDropdownVisible(false);
      return;
    }
    setIsSearching(true);
    const handler = setTimeout(() => {
      try {
        const lowercasedQuery = query.toLowerCase();
        const filtered = allVehicles.filter(v =>
          v.titulo.toLowerCase().includes(lowercasedQuery) ||
          (v.automarca && v.automarca.toLowerCase().includes(lowercasedQuery)) ||
          (v.autosubmarcaversion && v.autosubmarcaversion.toLowerCase().includes(lowercasedQuery)) ||
          (v.autoano && v.autoano.toString().includes(lowercasedQuery))
        );
        setResults(filtered.slice(0, 5)); // Show top 5 results
        setIsDropdownVisible(true);
      } catch (error) {
        console.error("Live search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query, allVehicles]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownVisible(false);
    if (query.trim()) {
      navigate(`/autos?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleResultClick = (slug: string) => {
    setIsDropdownVisible(false);
    setQuery('');
    navigate(`/autos/${slug}`);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={searchRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="header-search-container">
          <div className="relative flex items-center w-full bg-white rounded-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              {isSearching ? <Loader2 className="h-5 w-5 text-gray-400 animate-spin" /> : <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />}
            </div>
            <input
              type="search"
              name="search"
              id="header-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Busca por marca, modelo o año..."
              className="block w-full rounded-full border-0 bg-transparent py-2.5 pl-11 pr-4 text-gray-900 placeholder:text-gray-500 focus:ring-0 sm:text-sm"
              autoComplete="off"
            />
          </div>
        </div>
      </form>
      {isDropdownVisible && results.length > 0 && (
        <ul className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg z-50 overflow-hidden border border-gray-200">
          {results.map(vehicle => (
            <li key={vehicle.id}>
              <button onClick={() => handleResultClick(vehicle.slug)} className="w-full text-left flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors">
                <img src={vehicle.feature_image} alt={vehicle.titulo} className="w-16 h-12 object-cover rounded-md flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{vehicle.titulo}</p>
                  <p className="text-sm text-primary-600 font-medium">{formatPrice(vehicle.precio)}</p>
                </div>
              </button>
            </li>
          ))}
           <li className="p-2 bg-gray-50">
                <button onClick={() => handleSubmit(new Event('submit') as any)} className="w-full text-center text-sm font-semibold text-primary-600 hover:text-primary-700">
                    Ver todos los resultados para "{query}"
                </button>
            </li>
        </ul>
      )}
      {showTooltip && (
        <div className="header-search-tooltip">
          ¿Qué auto estás buscando?
        </div>
      )}
    </div>
  );
};

export default HeaderSearchBar;