import React, { useState, useCallback, useEffect, useRef } from 'react';
import { formatPrice } from '../utils/formatters';

interface PriceRangeSliderProps {
    min: number;
    max: number;
    initialMin?: number;
    initialMax?: number;
    onPriceChange: (min: number, max: number) => void;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({ min, max, initialMin, initialMax, onPriceChange }) => {
    const [minVal, setMinVal] = useState(initialMin || min);
    const [maxVal, setMaxVal] = useState(initialMax || max);
    const minValRef = useRef(minVal);
    const maxValRef = useRef(maxVal);
    const rangeRef = useRef<HTMLDivElement>(null);

    // Sync state with props, especially when options load asynchronously or filters are cleared
    useEffect(() => {
        setMinVal(initialMin !== undefined ? initialMin : min);
        setMaxVal(initialMax !== undefined ? initialMax : max);
    }, [min, max, initialMin, initialMax]);

    // Update refs for real-time access in event handlers
    useEffect(() => { minValRef.current = minVal; }, [minVal]);
    useEffect(() => { maxValRef.current = maxVal; }, [maxVal]);

        // Debounce the callback to avoid excessive re-renders
        const debouncedOnPriceChange = useCallback(
            debounce((minV, maxV) => onPriceChange(minV, maxV), 300),
            [onPriceChange]
        );
    
        const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Math.min(Number(e.target.value), maxVal - 1);
            setMinVal(value);
            debouncedOnPriceChange(value, maxVal);
        };
    
        const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = Math.max(Number(e.target.value), minVal + 1);
            setMaxVal(value);
            debouncedOnPriceChange(minVal, value);
        };
        
        // Calculate percentage for styling the range bar
        const getPercent = useCallback((value: number) => {
            if (max - min === 0) return 0;
            return Math.round(((value - min) / (max - min)) * 100);
        }, [min, max]);
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxVal);
        if (rangeRef.current) {
            rangeRef.current.style.left = `${minPercent}%`;
            rangeRef.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, maxVal, getPercent]);

    return (
        <div className="pt-2 pb-4 px-4">
             <div className="relative h-1.5 w-full flex items-center">
                <div className="absolute w-full h-1.5 bg-gray-200 rounded-full"></div>
                <div ref={rangeRef} className="absolute h-1.5 bg-primary-500 rounded-full z-[1]"></div>
                
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={minVal}
                    onChange={handleMinChange}
                    className="slider-input"
                    style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
                    aria-label="Minimum price"
                />
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={maxVal}
                    onChange={handleMaxChange}
                    className="slider-input"
                    style={{ zIndex: 4 }}
                    aria-label="Maximum price"
                />
                 <style>{`
                    .slider-input {
                      -webkit-appearance: none;
                      -moz-appearance: none;
                      appearance: none;
                      width: 100%;
                      height: 0.375rem; /* h-1.5 */
                      background: transparent;
                      position: absolute;
                      pointer-events: none;
                    }
                    
                    .slider-input::-webkit-slider-thumb {
                      -webkit-appearance: none;
                      pointer-events: all;
                      width: 20px;
                      height: 20px;
                      border-radius: 9999px; /* rounded-full */
                      border: 3px solid #FF6801; /* border-primary-500 */
                      background-color: white;
                      cursor: pointer;
                      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1); /* shadow-sm */
                    }

                    .slider-input::-moz-range-thumb {
                      pointer-events: all;
                      width: 20px;
                      height: 20px;
                      border-radius: 9999px;
                      border: 3px solid #FF6801;
                      background-color: white;
                      cursor: pointer;
                      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
                    }
                `}</style>
            </div>
            <div className="flex justify-between text-sm text-gray-700 mt-5">
                <span>{formatPrice(minVal, { showZeroAsCurrency: true })}</span>
                <span>{formatPrice(maxVal, { showZeroAsCurrency: true })}</span>
            </div>
        </div>
    );
};

// Debounce utility
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
}


export default PriceRangeSlider;