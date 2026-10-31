import React, { useEffect, useState } from 'react';

interface FallingPetalsProps {
  active: boolean;
}

interface Petal {
  id: number;
  left: number; // percentage
  size: number;
  duration: number; // seconds
  delay: number; // seconds
  rotate: number;
}

export const FallingPetals: React.FC<FallingPetalsProps> = ({ active }) => {
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    if (!active) {
      setPetals([]);
      return;
    }
    const items: Petal[] = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 96,
      size: 10 + Math.random() * 14,
      duration: 7 + Math.random() * 6,
      delay: Math.random() * 5,
      rotate: Math.random() * 360
    }));
    setPetals(items);
  }, [active]);

  if (!active || petals.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden" aria-hidden="true">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute opacity-60 animate-falling"
          style={{
            left: `${petal.left}%`,
            top: '-20px',
            width: `${petal.size}px`,
            height: `${petal.size * 1.3}px`,
            animation: `fallingPetal ${petal.duration}s linear infinite`,
            animationDelay: `${petal.delay}s`,
            transform: `rotate(${petal.rotate}deg)`
          }}
        >
          <svg viewBox="0 0 30 40" fill="none" className="w-full h-full drop-shadow-sm">
            <path
              d="M15,0 C25,12 30,24 20,35 C12,42 5,35 2,24 C-1,14 6,4 15,0 Z"
              fill="#F9CBD3"
              fillOpacity="0.85"
            />
            <path
              d="M15,2 C18,12 18,25 15,36"
              stroke="#E89EAE"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>
      ))}
      <style>{`
        @keyframes fallingPetal {
          0% {
            transform: translateY(0px) rotate(0deg) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.75;
          }
          50% {
            transform: translateY(50vh) rotate(180deg) translateX(25px);
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(105vh) rotate(360deg) translateX(-20px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
