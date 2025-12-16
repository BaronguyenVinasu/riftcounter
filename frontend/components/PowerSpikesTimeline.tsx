'use client';

import React from 'react';
import { Zap, Star, TrendingUp } from 'lucide-react';

interface PowerSpike {
  time: string;
  type: 'level' | 'item';
  champion: 'you' | 'enemy';
  description: string;
  advantage: 'you' | 'enemy' | 'neutral';
}

interface PowerSpikesTimelineProps {
  spikes: any[];
  playerName?: string;
  enemyName?: string;
}

export const PowerSpikesTimeline = ({ 
  spikes, 
  playerName = 'You',
  enemyName = 'Enemy'
}: PowerSpikesTimelineProps) => {
  if (!spikes || spikes.length === 0) return null;

  // Group spikes by phase
  const earlySpikes = spikes.filter(s => 
    s.time.includes('Level 2') || s.time.includes('Level 3') || s.time.includes('Level 5')
  );
  const midSpikes = spikes.filter(s => 
    s.time.includes('Level 6') || s.time.includes('Echo') || s.time.includes('First')
  );
  const lateSpikes = spikes.filter(s => 
    s.time.includes('Level 11') || s.time.includes('Deathcap') || s.time.includes('Edge')
  );

  const getAdvantageColor = (advantage: string) => {
    switch (advantage) {
      case 'you': return 'border-success/50 bg-success/5';
      case 'enemy': return 'border-threat-glow/50 bg-threat-glow/5';
      default: return 'border-white/10 bg-surface-subtle';
    }
  };

  const getAdvantageIcon = (advantage: string) => {
    switch (advantage) {
      case 'you': return <TrendingUp size={12} className="text-success" />;
      case 'enemy': return <Zap size={12} className="text-threat-glow" />;
      default: return <Star size={12} className="text-warning" />;
    }
  };

  const renderSpike = (spike: PowerSpike, index: number) => (
    <div 
      key={index}
      className={`p-3 rounded-xl border ${getAdvantageColor(spike.advantage)} transition-all duration-300`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {getAdvantageIcon(spike.advantage)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-white">
              {spike.time}
            </span>
            <span className={`text-[10px] uppercase tracking-wider ${
              spike.champion === 'you' ? 'text-success' : 'text-threat-glow'
            }`}>
              {spike.champion === 'you' ? playerName : enemyName}
            </span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {spike.description}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {earlySpikes.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">
            Early Game
          </h4>
          <div className="space-y-2">
            {earlySpikes.map(renderSpike)}
          </div>
        </div>
      )}

      {midSpikes.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">
            Mid Game
          </h4>
          <div className="space-y-2">
            {midSpikes.map(renderSpike)}
          </div>
        </div>
      )}

      {lateSpikes.length > 0 && (
        <div>
          <h4 className="text-[10px] uppercase tracking-[0.2em] text-text-muted mb-2">
            Late Game
          </h4>
          <div className="space-y-2">
            {lateSpikes.map(renderSpike)}
          </div>
        </div>
      )}

      {/* Simple list fallback if grouping doesn't match */}
      {earlySpikes.length === 0 && midSpikes.length === 0 && lateSpikes.length === 0 && (
        <div className="space-y-2">
          {spikes.slice(0, 6).map(renderSpike)}
        </div>
      )}
    </div>
  );
};

export default PowerSpikesTimeline;
