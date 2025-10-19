import React, { useEffect, useState } from 'react';

// FIX: Removed the ConfettiPiece component and inlined the div to resolve the key prop type error.
const Confetti: React.FC = () => {
  const [pieces, setPieces] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const newPieces = Array.from({ length: 150 }).map((_, index) => {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        top: `${-20 - Math.random() * 100}%`,
        backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`,
        transform: `rotate(${Math.random() * 360}deg)`,
        animation: `fall ${3 + Math.random() * 3}s ease-out ${Math.random() * 0.5}s forwards`,
        opacity: 0,
      };
      return <div key={index} className="absolute w-2 h-4" style={style}></div>;
    });
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
      {pieces}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0vh) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(120vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;