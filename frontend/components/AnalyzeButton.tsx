'use client';

import React from 'react';
import { Play, Loader2 } from 'lucide-react';

interface AnalyzeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const AnalyzeButton = ({ onClick, disabled = false, loading = false }: AnalyzeButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        group relative 
        w-20 h-20 
        rounded-full 
        flex items-center justify-center 
        transition-all duration-500
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Outer ring */}
      <div 
        className={`
          absolute inset-0 rounded-full 
          border transition-all duration-500
          ${disabled 
            ? 'border-white/10' 
            : 'border-white/20 group-hover:border-white/40'}
        `} 
      />
      
      {/* Glow effect on hover */}
      {!disabled && (
        <div 
          className="
            absolute inset-0 rounded-full 
            bg-warm-glow/0 group-hover:bg-warm-glow/10
            blur-xl
            transition-all duration-500
          " 
        />
      )}
      
      {/* Inner circle */}
      <div 
        className={`
          absolute inset-2 rounded-full 
          backdrop-blur-md
          transition-all duration-500
          ${disabled 
            ? 'bg-white/5' 
            : 'bg-white/10 group-hover:bg-white/20'}
        `} 
      />
      
      {/* Icon */}
      {loading ? (
        <Loader2 
          className="w-7 h-7 text-white animate-spin relative z-10" 
        />
      ) : (
        <Play 
          className={`
            w-7 h-7 ml-1 relative z-10
            fill-white text-white
            transition-transform duration-500
            ${disabled ? 'opacity-50' : 'group-hover:scale-110'}
          `} 
        />
      )}
    </button>
  );
};

export default AnalyzeButton;
