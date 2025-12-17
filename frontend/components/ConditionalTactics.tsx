'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface ConditionalTactic {
  condition: string;
  action: string;
  priority: 'must' | 'should' | 'consider';
  phase: 'early' | 'mid' | 'late' | 'all';
  icon?: 'warning' | 'info' | 'tip';
}

interface ConditionalTacticsProps {
  tactics: ConditionalTactic[];
  showAll?: boolean;
}

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'must': return 'border-l-threat-glow bg-threat-glow/5';
    case 'should': return 'border-l-warning bg-warning/5';
    case 'consider': return 'border-l-cool-glow bg-cool-glow/5';
    default: return 'border-l-white/20 bg-surface-subtle';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'must': return { text: 'MUST DO', color: 'text-threat-glow' };
    case 'should': return { text: 'SHOULD DO', color: 'text-warning' };
    case 'consider': return { text: 'CONSIDER', color: 'text-cool-glow' };
    default: return { text: 'TIP', color: 'text-text-secondary' };
  }
};

const getIcon = (icon?: string, priority?: string) => {
  if (icon === 'warning' || priority === 'must') {
    return <AlertTriangle size={14} className="text-threat-glow" />;
  }
  if (icon === 'info') {
    return <Info size={14} className="text-cool-glow" />;
  }
  return <Lightbulb size={14} className="text-warning" />;
};

export const ConditionalTactics = ({ tactics, showAll = false }: ConditionalTacticsProps) => {
  const [expanded, setExpanded] = useState(showAll);
  
  if (!tactics || tactics.length === 0) return null;

  // Sort by priority
  const sortedTactics = [...tactics].sort((a, b) => {
    const priorityOrder = { must: 0, should: 1, consider: 2 };
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });

  const displayTactics = expanded ? sortedTactics : sortedTactics.slice(0, 4);
  const hasMore = sortedTactics.length > 4;

  // Group by phase
  const phases = ['early', 'mid', 'late', 'all'];
  const groupedByPhase = phases.reduce((acc, phase) => {
    const phaseTactics = displayTactics.filter(t => t.phase === phase);
    if (phaseTactics.length > 0) {
      acc[phase] = phaseTactics;
    }
    return acc;
  }, {} as Record<string, ConditionalTactic[]>);

  const phaseLabels: Record<string, string> = {
    early: 'Early Game',
    mid: 'Mid Game', 
    late: 'Late Game',
    all: 'All Phases',
  };

  return (
    <div className="space-y-4">
      <h4 className="text-xs uppercase tracking-[0.15em] text-text-muted flex items-center gap-2">
        <Lightbulb size={14} />
        Conditional Tactics
      </h4>

      {Object.entries(groupedByPhase).map(([phase, phaseTactics]) => (
        <div key={phase} className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.2em] text-text-muted">
            {phaseLabels[phase]}
          </span>
          
          {phaseTactics.map((tactic, index) => {
            const priorityLabel = getPriorityLabel(tactic.priority);
            
            return (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-2 ${getPriorityStyle(tactic.priority)} transition-all duration-300`}
              >
                {/* Priority badge */}
                <div className="flex items-center gap-2 mb-1">
                  {getIcon(tactic.icon, tactic.priority)}
                  <span className={`text-[9px] uppercase tracking-wider font-medium ${priorityLabel.color}`}>
                    {priorityLabel.text}
                  </span>
                </div>
                
                {/* Condition */}
                <p className="text-sm text-white font-medium mb-1">
                  IF: {tactic.condition}
                </p>
                
                {/* Action */}
                <p className="text-sm text-text-secondary">
                  → {tactic.action}
                </p>
              </div>
            );
          })}
        </div>
      ))}

      {/* Show more/less button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2 text-sm text-text-secondary hover:text-white transition-colors flex items-center justify-center gap-1"
        >
          {expanded ? (
            <>Show less <ChevronUp size={16} /></>
          ) : (
            <>Show {sortedTactics.length - 4} more tips <ChevronDown size={16} /></>
          )}
        </button>
      )}
    </div>
  );
};

export default ConditionalTactics;
