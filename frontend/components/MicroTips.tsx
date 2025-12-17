'use client';

import React from 'react';
import { Swords, Wheat, MapPin, Eye, Target } from 'lucide-react';

interface MicroTip {
  tip: string;
  timing?: string;
  category: 'trading' | 'farming' | 'positioning' | 'vision' | 'objective';
}

interface MicroTipsProps {
  tips: MicroTip[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'trading': return <Swords size={12} className="text-threat-glow" />;
    case 'farming': return <Wheat size={12} className="text-success" />;
    case 'positioning': return <MapPin size={12} className="text-warning" />;
    case 'vision': return <Eye size={12} className="text-cool-glow" />;
    case 'objective': return <Target size={12} className="text-warm-glow" />;
    default: return <Target size={12} />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'trading': return 'bg-threat-glow/10 border-threat-glow/20';
    case 'farming': return 'bg-success/10 border-success/20';
    case 'positioning': return 'bg-warning/10 border-warning/20';
    case 'vision': return 'bg-cool-glow/10 border-cool-glow/20';
    case 'objective': return 'bg-warm-glow/10 border-warm-glow/20';
    default: return 'bg-surface-subtle border-white/10';
  }
};

export const MicroTips = ({ tips }: MicroTipsProps) => {
  if (!tips || tips.length === 0) return null;

  // Group by category
  const grouped = tips.reduce((acc, tip) => {
    if (!acc[tip.category]) acc[tip.category] = [];
    acc[tip.category].push(tip);
    return acc;
  }, {} as Record<string, MicroTip[]>);

  const categoryLabels: Record<string, string> = {
    trading: 'Trading',
    farming: 'Farming',
    positioning: 'Positioning',
    vision: 'Vision',
    objective: 'Objectives',
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-[0.15em] text-text-muted">
        Quick Tips
      </h4>

      <div className="grid grid-cols-1 gap-2">
        {tips.slice(0, 6).map((tip, index) => (
          <div 
            key={index}
            className={`flex items-start gap-3 p-3 rounded-xl border ${getCategoryColor(tip.category)} transition-all duration-300`}
          >
            <div className="mt-0.5 flex-shrink-0">
              {getCategoryIcon(tip.category)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white leading-relaxed">
                {tip.tip}
              </p>
              {tip.timing && (
                <span className="text-xs text-warm-glow mt-1 inline-block">
                  ⏱ {tip.timing}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Category summary */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(grouped).map(([category, catTips]) => (
          <span 
            key={category}
            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${getCategoryColor(category)} flex items-center gap-1`}
          >
            {getCategoryIcon(category)}
            {categoryLabels[category]} ({catTips.length})
          </span>
        ))}
      </div>
    </div>
  );
};

export default MicroTips;
