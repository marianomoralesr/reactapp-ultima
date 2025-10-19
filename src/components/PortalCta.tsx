import React from 'react';
import LazyImage from './LazyImage';

const PortalCta: React.FC = () => {
    return (
        <div>
            <LazyImage 
                src="/images/tabs/portal.png" 
                alt="Portal de Clientes TREFA"
                className="rounded-lg mb-4"
            />
        </div>
    );
};

export default PortalCta;