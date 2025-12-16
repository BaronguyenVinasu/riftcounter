'use client';

import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  glow?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export const GlassCard = ({ 
  children, 
  className = '', 
  style,
  hover = true,
  glow = false,
  padding = 'md'
}: GlassCardProps) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div 
      style={style}
      className={`
        ${paddingClasses[padding]}
        rounded-3xl 
        bg-surface-subtle 
        border border-surface-border
        backdrop-blur-md
        transition-all duration-500 ease-out
        ${hover ? 'hover:bg-surface-glass hover:border-white/10 hover:-translate-y-0.5' : ''}
        ${glow ? 'shadow-glow-sm hover:shadow-glow-md' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
