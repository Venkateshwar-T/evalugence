'use client';

import { useEffect, useState } from 'react';

export default function DotBackground() {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isMounted) return null;

  // Size of the square mask (56px = exactly 4x4 dots)
  const maskSize = 56;

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 bg-background">
      {/* Base faint dots */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--dot-color) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
      />

      {/* Square block of lit dots tracking cursor (hidden on mobile) */}
      <div 
        className="hidden md:block absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--dot-glow-color) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
          WebkitMaskImage: 'linear-gradient(black, black)',
          WebkitMaskSize: `${maskSize}px ${maskSize}px`,
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`,
          maskImage: 'linear-gradient(black, black)',
          maskSize: `${maskSize}px ${maskSize}px`,
          maskRepeat: 'no-repeat',
          maskPosition: `${mousePosition.x - maskSize / 2}px ${mousePosition.y - maskSize / 2}px`,
        }}
      />
    </div>
  );
}
