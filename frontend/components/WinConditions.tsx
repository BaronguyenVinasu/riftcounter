'use client';

import React from 'react';
import { Trophy, XCircle, Target } from 'lucide-react';

interface WinConditionsProps {
  winCondition: string;
  avoidCondition: string;
  playerName?: string;
  enemyName?: string;
}

export const WinConditions = ({ 
  winCondition, 
  avoidCondition,
  playerName,
  enemyName 
}: WinConditionsProps) => {
  if (!winCondition && !avoidCondition) return null;

  return (
    <div className="space-y-4">
      {/* Win Condition */}
      {winCondition && (
        <div className="p-4 rounded-xl bg-success/5 border border-success/20">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-success" />
            <span className="text-xs uppercase tracking-[0.15em] text-success font-medium">
              How to Win
            </span>
          </div>
          <p className="text-sm text-white leading-relaxed">
            {winCondition}
          </p>
        </div>
      )}

      {/* Avoid Condition */}
      {avoidCondition && (
        <div className="p-4 rounded-xl bg-threat-glow/5 border border-threat-glow/20">
          <div className="flex items-center gap-2 mb-2">
            <XCircle size={16} className="text-threat-glow" />
            <span className="text-xs uppercase tracking-[0.15em] text-threat-glow font-medium">
              What to Avoid
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            {avoidCondition}
          </p>
        </div>
      )}
    </div>
  );
};

export default WinConditions;
