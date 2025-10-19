import React from 'react';
import LazyImage from './LazyImage';

const TestimonialCta: React.FC = () => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200/80">
             <LazyImage 
                src="/images/testimonio.png" 
                alt="Testimonio de cliente TREFA"
                className="rounded-lg"
            />
        </div>
    );
};

export default TestimonialCta;