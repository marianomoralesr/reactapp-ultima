import React from 'react';

const AnimatedGridBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-white">
            <div className="absolute inset-0 bg-grid-pattern-light animate-pan-bg-1"></div>
        </div>
    );
};

export default AnimatedGridBackground;
