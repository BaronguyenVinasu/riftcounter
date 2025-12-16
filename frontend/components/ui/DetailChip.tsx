'use client';

import React from 'react';

interface DetailChipProps {
  label: string;
  value: string;
  active?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
}

export const DetailChip = ({ 
  label, 
  value, 
  active = false,
  variant = 'default',
  onClick
}: DetailChipProps) => {
  const variantStyles = {
    default: active 
      ? 'bg-surface-highlight border-white/20 shadow-glow-sm' 
      : 'bg-surface-glass border-transparent hover:bg-surface-highlight',
    success: 'bg-success/10 border-success/30 text-success',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    danger: 'bg-threat-glow/10 border-threat-glow/30 text-threat-glow',
  };

  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center 
        py-4 px-3
        rounded-2xl border 
        transition-all duration-300
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <span className="text-[9px] uppercase tracking-[0.15em] text-text-muted mb-1">
        {label}
      </span>
      <span className={`text-sm font-medium ${variant === 'default' ? 'text-white' : ''}`}>
        {value}
      </span>
    </button>
  );
};

export default DetailChip;
