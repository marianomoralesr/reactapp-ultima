import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ValuationApp from '../Valuation/App';
import useSEO from '../hooks/useSEO';

const GetAQuotePage: React.FC = () => {
    useSEO({
        title: 'Valúa tu Auto | Vende tu Seminuevo en TREFA',
        description: 'Obtén una oferta instantánea para tu auto. Nuestro proceso es rápido, gratuito y 100% en línea. Vende tu auto de forma segura con TREFA.',
        keywords: 'vender auto, valuar auto, cotizar auto, oferta por mi auto, trefa, seminuevos'
    });

    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search');

    return (
        <div className="w-full flex justify-center items-start py-8 sm:py-12">
             <ValuationApp initialSearchQuery={initialSearch} />
        </div>
    );
};

export default GetAQuotePage;
