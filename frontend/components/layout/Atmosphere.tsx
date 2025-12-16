'use client';

import React from 'react';

interface AtmosphereProps {
  children: React.ReactNode;
  intensity?: 'low' | 'medium' | 'high';
  variant?: 'warm' | 'cool' | 'neutral';
}

export const Atmosphere = ({ 
  children, 
  intensity = 'high',
  variant = 'warm' 
}: AtmosphereProps) => {
  const intensityClasses = {
    low: 'opacity-20',
    medium: 'opacity-35',
    high: 'opacity-50',
  };

  const glowColors = {
    warm: 'bg-warm-glow',
    cool: 'bg-cool-glow',
    neutral: 'bg-white',
  };

  return (
    <div className="relative min-h-screen w-full bg-black overflow-hidden text-text-primary selection:bg-warm-glow/30 selection:text-white">
      
      {/* The Living Glow - Positioned like the "sun" in Open iOS */}
      <div 
        className={`fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] 
        ${glowColors[variant]} rounded-full blur-[150px] mix-blend-screen pointer-events-none
        animate-breathe transition-opacity duration-1000 ${intensityClasses[intensity]}`}
      />

      {/* Secondary ambient glow */}
      <div 
        className={`fixed bottom-[-30%] right-[-10%] w-[600px] h-[600px] 
        bg-warm-dim rounded-full blur-[180px] mix-blend-screen pointer-events-none
        animate-breathe-slow ${intensity === 'high' ? 'opacity-20' : 'opacity-10'}`}
      />

      {/* Subtle noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content Layer */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default Atmosphere;
