'use client';

import React from 'react';

interface MatchupVectorProps {
  vector: {
    laneDominance: number;
    allInPotential: number;
    pokeAdvantage: number;
    mobilityDiff: number;
    ccDiff: number;
    sustainDiff: number;
    waveclearDiff: number;
    scalingDiff: number;
  };
}

const VectorBar = ({ 
  label, 
  value, 
  description 
}: { 
  label: string; 
  value: number; 
  description?: string;
}) => {
  // Value ranges from -100 to 100
  const normalizedValue = Math.max(-100, Math.min(100, value));
  const isPositive = normalizedValue >= 0;
  const absValue = Math.abs(normalizedValue);
  
  // Color based on value
  const getColor = () => {
    if (normalizedValue > 30) return 'bg-success';
    if (normalizedValue > 0) return 'bg-success/60';
    if (normalizedValue > -30) return 'bg-warning/60';
    return 'bg-threat-glow';
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className={`text-xs font-medium ${isPositive ? 'text-success' : 'text-threat-glow'}`}>
          {isPositive ? '+' : ''}{normalizedValue}
        </span>
      </div>
      <div className="h-1.5 bg-surface-highlight rounded-full overflow-hidden flex">
        {/* Center point indicator */}
        <div className="w-1/2 flex justify-end">
          {!isPositive && (
            <div 
              className={`h-full ${getColor()} rounded-l-full transition-all duration-500`}
              style={{ width: `${absValue}%` }}
            />
          )}
        </div>
        <div className="w-1/2">
          {isPositive && (
            <div 
              className={`h-full ${getColor()} rounded-r-full transition-all duration-500`}
              style={{ width: `${absValue}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export const MatchupVectorDisplay = ({ vector }: MatchupVectorProps) => {
  const metrics = [
    { key: 'laneDominance', label: 'Lane Dominance', value: vector.laneDominance },
    { key: 'allInPotential', label: 'All-In Potential', value: vector.allInPotential - 50 }, // Normalize from 0-100 to -50 to 50
    { key: 'pokeAdvantage', label: 'Poke Advantage', value: vector.pokeAdvantage },
    { key: 'mobilityDiff', label: 'Mobility', value: vector.mobilityDiff },
    { key: 'waveclearDiff', label: 'Waveclear', value: vector.waveclearDiff },
    { key: 'scalingDiff', label: 'Scaling', value: vector.scalingDiff },
  ];

  // Calculate overall advantage
  const overallScore = Math.round(
    (vector.laneDominance + vector.pokeAdvantage + vector.scalingDiff) / 3
  );

  const getOverallLabel = () => {
    if (overallScore > 30) return { text: 'Strong Advantage', color: 'text-success' };
    if (overallScore > 10) return { text: 'Slight Advantage', color: 'text-success/80' };
    if (overallScore > -10) return { text: 'Even Matchup', color: 'text-warning' };
    if (overallScore > -30) return { text: 'Slight Disadvantage', color: 'text-warning' };
    return { text: 'Hard Matchup', color: 'text-threat-glow' };
  };

  const overall = getOverallLabel();

  return (
    <div className="space-y-4">
      {/* Overall assessment */}
      <div className="text-center pb-4 border-b border-white/5">
        <span className={`text-lg font-medium ${overall.color}`}>
          {overall.text}
        </span>
      </div>

      {/* Individual metrics */}
      <div className="space-y-3">
        {metrics.map((metric) => (
          <VectorBar 
            key={metric.key}
            label={metric.label}
            value={metric.value}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchupVectorDisplay;
