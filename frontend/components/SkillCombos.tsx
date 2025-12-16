'use client';

import React from 'react';
import { Swords, Zap, Target } from 'lucide-react';

interface SkillCombo {
  name: string;
  sequence: string;
  description?: string;
  notes?: string;
  timing?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  damage: 'low' | 'medium' | 'high' | 'lethal';
}

interface SkillCombosProps {
  combos: SkillCombo[];
  championName?: string;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-success bg-success/10 border-success/30';
    case 'medium': return 'text-warning bg-warning/10 border-warning/30';
    case 'hard': return 'text-threat-glow bg-threat-glow/10 border-threat-glow/30';
    default: return 'text-text-secondary bg-surface-glass border-white/10';
  }
};

const getDamageIcon = (damage: string) => {
  switch (damage) {
    case 'lethal': return <Swords size={14} className="text-threat-glow" />;
    case 'high': return <Zap size={14} className="text-warning" />;
    default: return <Target size={14} className="text-text-secondary" />;
  }
};

export const SkillCombos = ({ combos, championName }: SkillCombosProps) => {
  if (!combos || combos.length === 0) return null;

  return (
    <div className="space-y-3">
      {combos.map((combo, index) => (
        <div 
          key={index}
          className="p-4 rounded-xl bg-surface-subtle border border-surface-border"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getDamageIcon(combo.damage)}
              <h4 className="font-medium text-white">{combo.name}</h4>
            </div>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${getDifficultyColor(combo.difficulty)}`}>
              {combo.difficulty}
            </span>
          </div>

          {/* Sequence */}
          <div className="mb-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-text-muted block mb-1">
              Sequence
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {combo.sequence.split(/[→>]/).map((step, i, arr) => (
                <React.Fragment key={i}>
                  <span className="px-2 py-1 bg-surface-glass rounded-lg text-sm text-warm-glow font-mono">
                    {step.trim()}
                  </span>
                  {i < arr.length - 1 && (
                    <span className="text-text-muted">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Notes */}
          {(combo.notes || combo.description) && (
            <p className="text-sm text-text-secondary leading-relaxed mb-2">
              {combo.notes || combo.description}
            </p>
          )}

          {/* Timing */}
          {combo.timing && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-muted">When:</span>
              <span className="text-warm-glow">{combo.timing}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SkillCombos;
