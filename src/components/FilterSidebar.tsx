import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AccordionItem from './AccordionItem';
import PriceRangeSlider from './PriceRangeSlider';
import { FilterIcon, CheckIcon, XCircleIcon, XIcon } from './icons';
import type { VehicleFilters, WordPressVehicle } from '../types/types';
import { formatPromotion } from '../utils/formatters';
import { getCategoryImage } from '../utils/get-category-image';
import { BRAND_LOGOS } from '../utils/constants';
import { proxyImage } from '../utils/proxyImage';

// --- TYPES AND INTERFACES ---

interface FilterOption {
    name: string | number;
    count: number;
}

interface FilterSidebarProps {
    allVehicles: WordPressVehicle[];
    onFiltersChange: (filters: Partial<VehicleFilters>) => void;
    onClearFilters: () => void;
    filterOptions?: {
        marcas?: FilterOption[];
        years?: FilterOption[];
        warranties?: FilterOption[];
        promotions?: FilterOption[];
        carroceria?: FilterOption[];
        transmissions?: FilterOption[];
        combustibles?: FilterOption[];
        sucursales?: FilterOption[];
        minPrice?: number;
        maxPrice?: number;
        enganchemin?: number;
        maxEnganche?: number;
    };
    currentFilters: VehicleFilters;
    onRemoveFilter: (key: keyof VehicleFilters, value?: string | number | boolean) => void;
    activeFiltersList: { key: keyof VehicleFilters; value: string | number | boolean; label: string }[];
    isMobileSheet?: boolean;
    onCloseSheet?: () => void;
    resultsCount?: number;
}

// --- HELPER COMPONENTS ---

const CheckboxFilterGroup: React.FC<{
    options: (string | number)[];
    selected: (string | number)[];
    onChange: (value: string | number) => void;
    counts: Record<string | number, number>;
    labelFormatter?: (option: string | number) => string;
}> = React.memo(({ options, selected, onChange, counts, labelFormatter = String }) => (
    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {options.map(option => {
            const optionId = `filter-${String(option).replace(/\s/g, '-')}`;
            const isChecked = selected.includes(option);
            return (
                <label key={optionId} htmlFor={optionId} className="flex items-center justify-between text-gray-700 cursor-pointer group">
                    <div className="flex items-center">
                        <input id={optionId} type="checkbox" className="sr-only" checked={isChecked} onChange={() => onChange(option)} />
                        <div className={`w-5 h-5 border-2 rounded flex-shrink-0 flex items-center justify-center transition-all duration-200 ${isChecked ? 'bg-primary-600 border-primary-600' : 'bg-white border-gray-300 group-hover:border-primary-400'}`}>
                            {isChecked && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="ml-3 text-sm">{labelFormatter(option)}</span>
                    </div>
                    <span className="text-xs font-medium bg-gray-100 px-1.5 py-0.5 rounded">{counts[option] || 0}</span>
                </label>
            );
        })}
    </div>
));

const ToggleSwitch: React.FC<{ label: string; isEnabled: boolean; onToggle: () => void; }> = React.memo(({ label, isEnabled, onToggle }) => (
    <div className="flex items-center justify-between py-3">
        <span className="font-semibold text-gray-800 text-sm">{label}</span>
        <button onClick={onToggle} type="button" role="switch" aria-checked={isEnabled} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${isEnabled ? 'bg-primary-600' : 'bg-gray-300'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ease-in-out ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
));

// --- MAIN COMPONENT ---

const FilterSidebar: React.FC<FilterSidebarProps> = (props) => {
    const { onFiltersChange, onClearFilters, filterOptions, currentFilters, onRemoveFilter, activeFiltersList, isMobileSheet = false, onCloseSheet, resultsCount = 0 } = props;

    const handleCheckboxChange = useCallback((filterKey: keyof VehicleFilters, value: string | number) => {
        const currentValues = (currentFilters[filterKey] as (string | number)[]) || [];
        const newValues = currentValues.includes(value) ? currentValues.filter(v => v !== value) : [...currentValues, value];
        onFiltersChange({ ...currentFilters, [filterKey]: newValues.length > 0 ? newValues : undefined });
    }, [currentFilters, onFiltersChange]);

    const handlePriceChange = useCallback((min: number, max: number) => {
        onFiltersChange({
            ...currentFilters,
            minPrice: min === filterOptions?.minPrice ? undefined : min,
            maxPrice: max === filterOptions?.maxPrice ? undefined : max
        });
    }, [currentFilters, onFiltersChange, filterOptions?.minPrice, filterOptions?.maxPrice]);

    const handleEngancheChange = useCallback((min: number, max: number) => {
        onFiltersChange({
            ...currentFilters,
            enganchemin: min === filterOptions?.enganchemin ? undefined : min,
            maxEnganche: max === filterOptions?.maxEnganche ? undefined : max
        });
    }, [currentFilters, onFiltersChange, filterOptions?.enganchemin, filterOptions?.maxEnganche]);

    const handleToggleChange = (filterKey: keyof VehicleFilters) => {
        onFiltersChange({
            ...currentFilters,
            [filterKey]: !currentFilters[filterKey] || undefined
        });
    };

    const counts = useMemo(() => ({
        marcas: Object.fromEntries((filterOptions?.marcas || []).map(s => [s.name, s.count])),
        autoano: Object.fromEntries((filterOptions?.autoano || []).map(y => [y.name, y.count])),
        garantia: Object.fromEntries((filterOptions?.garantia || []).map(c => [c.name, c.count])),
        transmision: Object.fromEntries((filterOptions?.transmision || []).map(t => [t.name, t.count])),
        combustible: Object.fromEntries((filterOptions?.combustible || []).map(f => [f.name, f.count])),
        carroceria: Object.fromEntries((filterOptions?.carroceria || []).map(w => [w.name, w.count])),
        promociones: Object.fromEntries((filterOptions?.promociones || []).map(p => [p.name, p.count])),
        ubicacion: Object.fromEntries((filterOptions?.ubicacion || []).map(p => [p.name, p.count])),
    }), [filterOptions]);

    const FilterBody = (
        <>
            {activeFiltersList.length > 0 && (
                <div className="pb-4 mb-4 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-semibold text-gray-600">Filtros Activos</h3>
                        <button onClick={onClearFilters} type="button" className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-800 font-semibold">
                            <XCircleIcon className="w-4 h-4" /> Limpiar
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {activeFiltersList.map(({ key, value, label }) => (
                            <div key={`${key}-${String(value)}`} className="flex items-center bg-primary-100 text-primary-700 text-xs font-semibold pl-2.5 pr-1 py-1 rounded-full">
                                <span>{label}</span>
                                <button type="button" onClick={() => onRemoveFilter(key, value)} className="ml-1 p-0.5 rounded-full hover:bg-primary-200" aria-label={`Remover filtro ${label}`}>
                                    <XIcon className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AccordionItem title="Carrocería" startOpen>
                <div className="grid grid-cols-4 gap-2">
                    {(filterOptions?.carroceria || []).map(c => {
                        const isSelected = (currentFilters.carroceria || []).includes(c.name as string);
                        return (
                            <button
                                key={c.name}
                                type="button"
                                onClick={() => handleCheckboxChange('carroceria', c.name as string)}
                                className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group ${isSelected ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
                                aria-pressed={isSelected}
                            >
                                <img src={getCategoryImage('carroceria', c.name as string)} alt={c.name as string} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105" />
                                {isSelected && <div className="absolute inset-0 bg-primary-500/10"></div>}
                            </button>
                        );
                    })}
                </div>
            </AccordionItem>

            <AccordionItem title="Marca" startOpen>
                <div className="grid grid-cols-4 gap-2">
                    {(filterOptions?.marcas || []).slice(0, 8).map(m => {
                        const isSelected = (currentFilters.marca || []).includes(m.name as string);
                        return (
                            <button
                                key={m.name}
                                type="button"
                                onClick={() => {
                                    console.log('Marca button clicked:', m.name);
                                    handleCheckboxChange('marca', m.name as string);
                                }}
                                className={`relative overflow-hidden rounded-lg border-2 p-2 bg-white transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 group ${isSelected ? 'border-primary-500' : 'border-gray-200 hover:border-gray-300'}`}
                                aria-pressed={isSelected}
                            >
                                <img src={BRAND_LOGOS[m.name as string] || getCategoryImage('marca', m.name as string)} alt={m.name as string} className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105" style={{ aspectRatio: '1/1' }} />
                            </button>
                        );
                    })}
                </div>
                {(filterOptions?.marcas || []).length > 8 && (
                    <AccordionItem title="Más marcas">
                        <CheckboxFilterGroup options={(filterOptions?.marcas || []).slice(8).map(m => m.name)} selected={currentFilters.marca || []} onChange={(v) => handleCheckboxChange('marca', v)} counts={counts.marcas} />
                    </AccordionItem>
                )}
            </AccordionItem>

            <AccordionItem title="Precio">
                <div className="px-4">
                    <PriceRangeSlider min={filterOptions?.minPrice || 0} max={filterOptions?.maxPrice || 1000000} initialMin={currentFilters.minPrice} initialMax={currentFilters.maxPrice} onPriceChange={handlePriceChange} />
                </div>
            </AccordionItem>

            <AccordionItem title="Enganche">
                <div className="px-4">
                    <PriceRangeSlider min={filterOptions?.enganchemin || 0} max={filterOptions?.maxEnganche || 500000} initialMin={currentFilters.enganchemin} initialMax={currentFilters.maxEnganche} onPriceChange={handleEngancheChange} />
                </div>
            </AccordionItem>

            <AccordionItem title="Año">
                <CheckboxFilterGroup options={(filterOptions?.autoano || []).map(y => y.name)} selected={currentFilters.autoano || []} onChange={(v) => handleCheckboxChange('autoano', v)} counts={counts.autoano} />
            </AccordionItem>

            <AccordionItem title="Sucursal">
                <CheckboxFilterGroup options={(filterOptions?.ubicacion || []).map(s => s.name)} selected={currentFilters.ubicacion || []} onChange={(v) => handleCheckboxChange('ubicacion', v)} counts={counts.ubicacion} />
            </AccordionItem>

            <AccordionItem title="Transmisión">
                <CheckboxFilterGroup options={(filterOptions?.transmision || []).map(t => t.name)} selected={currentFilters.transmision || []} onChange={(v) => handleCheckboxChange('transmision', v)} counts={counts.transmision} />
            </AccordionItem>

            <AccordionItem title="Combustible">
                <CheckboxFilterGroup options={(filterOptions?.combustible || []).map(c => c.name)} selected={currentFilters.combustible || []} onChange={(v) => handleCheckboxChange('combustible', v)} counts={counts.combustible} />
            </AccordionItem>

            <AccordionItem title="Garantía">
                <CheckboxFilterGroup options={(filterOptions?.garantia || []).map(w => w.name)} selected={currentFilters.garantia || []} onChange={(v) => handleCheckboxChange('garantia', v)} counts={counts.garantia} />
            </AccordionItem>

            <AccordionItem title="Promociones">
                <CheckboxFilterGroup options={(filterOptions?.promotions || []).map(p => p.name)} selected={currentFilters.promotion || []} onChange={(v) => handleCheckboxChange('promotion', v)} counts={counts.promotions} labelFormatter={formatPromotion} />
            </AccordionItem>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <ToggleSwitch label="Ocultar separados" isEnabled={!!currentFilters.hideSeparado} onToggle={() => handleToggleChange('hideSeparado')} />
            </div>

            <div className="mt-6 flex flex-col gap-2">
                <button
                    onClick={onClearFilters}
                    className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Limpiar Filtros
                </button>
            </div>
        </>
    );

    if (isMobileSheet) {
        return (
            <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                    <h2 className="text-lg font-bold text-gray-800">Filtros</h2>
                    <button onClick={onCloseSheet} className="p-2 rounded-full text-gray-600 hover:bg-gray-100"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="overflow-y-auto px-6 py-4 flex-grow pb-24">{FilterBody}</div>
                <div className="p-4 border-t border-gray-200 flex-shrink-0 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                    <button onClick={onCloseSheet} className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-lg hover:bg-primary-700 transition-colors">
                        Mostrar {resultsCount} resultados
                    </button>
                </div>
            </div>
        );
    }

    return (
        <aside className="w-full lg:w-96 p-6 bg-white rounded-2xl shadow-sm h-fit sticky top-28">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Filtrar por</h2>
                <FilterIcon className="w-6 h-6 text-gray-500" />
            </div>
            {FilterBody}
        </aside>
    );
};

export default FilterSidebar;