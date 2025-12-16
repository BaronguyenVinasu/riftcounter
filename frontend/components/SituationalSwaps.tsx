'use client';

import React from 'react';
import { ArrowRight, Shield, Zap, Heart, Footprints } from 'lucide-react';

interface SituationalSwap {
  originalItem: string;
  swapItem: string;
  trigger: string;
  reason: string;
}

interface SituationalSwapsProps {
  swaps: SituationalSwap[];
}

const getTriggerIcon = (trigger: string) => {
  switch (trigger) {
    case 'heavyAD':
    case 'heavyAP':
      return <Shield size={14} className="text-cool-glow" />;
    case 'mobileThreat':
      return <Footprints size={14} className="text-warning" />;
    case 'heavyHeal':
      return <Heart size={14} className="text-threat-glow" />;
    default:
      return <Zap size={14} className="text-warm-glow" />;
  }
};

const getTriggerLabel = (trigger: string) => {
  switch (trigger) {
    case 'heavyAD': return 'AD Heavy';
    case 'heavyAP': return 'AP Heavy';
    case 'mobileThreat': return 'Assassin';
    case 'heavyHeal': return 'Anti-Heal';
    case 'heavyCC': return 'CC Heavy';
    default: return 'Situational';
  }
};

export const SituationalSwaps = ({ swaps }: SituationalSwapsProps) => {
  if (!swaps || swaps.length === 0) return null;

  return (
    <div className="space-y-3">
      <h4 className="text-xs uppercase tracking-[0.15em] text-text-muted mb-2">
        Situational Adjustments
      </h4>
      
      {swaps.map((swap, index) => (
        <div 
          key={index}
          className="p-3 rounded-xl bg-surface-subtle border border-surface-border"
        >
          {/* Trigger badge */}
          <div className="flex items-center gap-2 mb-2">
            {getTriggerIcon(swap.trigger)}
            <span className="text-[10px] uppercase tracking-wider text-text-secondary">
              {getTriggerLabel(swap.trigger)}
            </span>
          </div>
          
          {/* Swap visualization */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-text-secondary line-through">
              {swap.originalItem}
            </span>
            <ArrowRight size={14} className="text-warm-glow" />
            <span className="text-sm text-white font-medium">
              {swap.swapItem}
            </span>
          </div>
          
          {/* Reason */}
          <p className="text-xs text-text-muted leading-relaxed">
            {swap.reason}
          </p>
        </div>
      ))}
    </div>
  );
};

export default SituationalSwaps;
