'use client';

import React, { useState } from 'react';
import { Sunrise, Sun, Moon } from 'lucide-react';

interface LaneStrategyProps {
  strategy: {
    early: string[];
    mid: string[];
    late: string[];
  };
}

type Phase = 'early' | 'mid' | 'late';

const phaseConfig: Record<Phase, { icon: React.ReactNode; label: string; time: string; color: string }> = {
  early: {
    icon: <Sunrise size={16} />,
    label: 'Early Game',
    time: 'Levels 1-5',
    color: 'text-warm-glow border-warm-glow/30 bg-warm-glow/5',
  },
  mid: {
    icon: <Sun size={16} />,
    label: 'Mid Game',
    time: 'Levels 6-10',
    color: 'text-warning border-warning/30 bg-warning/5',
  },
  late: {
    icon: <Moon size={16} />,
    label: 'Late Game',
    time: 'Levels 11+',
    color: 'text-cool-glow border-cool-glow/30 bg-cool-glow/5',
  },
};

export const LaneStrategy = ({ strategy }: LaneStrategyProps) => {
  const [activePhase, setActivePhase] = useState<Phase>('early');

  if (!strategy) return null;

  const phases: Phase[] = ['early', 'mid', 'late'];
  const currentSteps = strategy[activePhase] || [];

  return (
    <div className="space-y-4">
      {/* Phase Selector */}
      <div className="flex gap-2">
        {phases.map((phase) => {
          const config = phaseConfig[phase];
          const isActive = activePhase === phase;
          
          return (
            <button
              key={phase}
              onClick={() => setActivePhase(phase)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border
                transition-all duration-300
                ${isActive 
                  ? config.color 
                  : 'text-text-muted border-transparent bg-surface-subtle hover:bg-surface-glass'}
              `}
            >
              {config.icon}
              <span className="text-xs font-medium">{config.label}</span>
              <span className="text-[10px] text-text-muted">{config.time}</span>
            </button>
          );
        })}
      </div>

      {/* Strategy Steps */}
      <div className="space-y-2">
        {currentSteps.map((step, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-subtle border border-surface-border"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-glass flex items-center justify-center">
              <span className="text-xs font-medium text-warm-glow">{index + 1}</span>
            </div>
            <p className="text-sm text-white leading-relaxed flex-1">
              {step}
            </p>
          </div>
        ))}

        {currentSteps.length === 0 && (
          <p className="text-sm text-text-muted text-center py-4">
            No specific strategy for this phase
          </p>
        )}
      </div>
    </div>
  );
};

export default LaneStrategy;
