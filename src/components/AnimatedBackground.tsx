import React from 'react';

const AnimatedBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 -z-20 overflow-hidden bg-gray-50">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern-light opacity-50"></div>
        </div>
    );
};

export default AnimatedBackground;
