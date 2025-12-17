'use client';

import React from 'react';
import { Clock, AlertTriangle, Zap } from 'lucide-react';

interface AbilityWindowTactic {
  trigger: string;
  window: string;
  action: string;
  risk: 'low' | 'medium' | 'high';
  phase: 'early' | 'mid' | 'late' | 'all';
}

interface AbilityWindowsProps {
  windows: AbilityWindowTactic[];
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'low': return 'text-success border-success/30 bg-success/5';
    case 'medium': return 'text-warning border-warning/30 bg-warning/5';
    case 'high': return 'text-threat-glow border-threat-glow/30 bg-threat-glow/5';
    default: return 'text-text-secondary border-white/10 bg-surface-subtle';
  }
};

const getRiskIcon = (risk: string) => {
  switch (risk) {
    case 'low': return <Zap size={14} className="text-success" />;
    case 'medium': return <Clock size={14} className="text-warning" />;
    case 'high': return <AlertTriangle size={14} className="text-threat-glow" />;
    default: return <Clock size={14} />;
  }
};

export const AbilityWindows = ({ windows }: AbilityWindowsProps) => {
  if (!windows || windows.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-[0.15em] text-text-muted flex items-center gap-2">
        <Clock size={14} />
        Ability Windows
      </h4>
      
      {windows.map((window, index) => (
        <div 
          key={index}
          className={`p-4 rounded-xl border ${getRiskColor(window.risk)} transition-all duration-300`}
        >
          {/* Trigger */}
          <div className="flex items-start gap-2 mb-2">
            {getRiskIcon(window.risk)}
            <p className="text-sm text-white font-medium leading-tight">
              {window.trigger}
            </p>
          </div>
          
          {/* Window timing */}
          <div className="flex items-center gap-2 mb-2 ml-6">
            <span className="text-xs px-2 py-0.5 rounded-full bg-surface-glass text-warm-glow font-mono">
              {window.window}
            </span>
          </div>
          
          {/* Action */}
          <p className="text-sm text-text-secondary ml-6">
            → {window.action}
          </p>
          
          {/* Risk badge */}
          <div className="flex items-center gap-2 mt-3 ml-6">
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRiskColor(window.risk)}`}>
              {window.risk} risk
            </span>
            {window.phase !== 'all' && (
              <span className="text-[10px] uppercase tracking-wider text-text-muted">
                {window.phase} game
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AbilityWindows;
