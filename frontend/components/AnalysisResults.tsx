'use client';

import React, { useState } from 'react';
import { X, ChevronRight, Shield, Sword, Zap, Target } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { DetailChip } from './ui/DetailChip';

interface Counter {
  champion: {
    id: string;
    name: string;
    displayName?: string;
    roles?: string[];
  };
  reason: string;
  confidence: number;
  difficulty?: string;
}

interface Tactic {
  id: string;
  title: string;
  phase: string;
  steps: { action: string; timing?: string }[];
  reasoning: string;
}

interface AnalysisResultsProps {
  results: {
    laneEnemy?: {
      id: string;
      name: string;
      displayName?: string;
    };
    counters: Counter[];
    tactics: Tactic[];
    powerSpikes?: any[];
    confidence: number;
    uncertainty: string;
  };
  onClose: () => void;
}

export const AnalysisResults = ({ results, onClose }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState<'counters' | 'tactics'>('counters');
  const enemy = results.laneEnemy;
  const topCounters = results.counters.slice(0, 3);

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 70) return 'High';
    if (conf >= 50) return 'Medium';
    return 'Low';
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case 'easy': return 'text-success';
      case 'medium': return 'text-warning';
      case 'hard': return 'text-threat-glow';
      default: return 'text-text-secondary';
    }
  };

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start p-6 pt-12">
        <div className="animate-fade-in-down">
          {enemy && (
            <>
              <h2 className="text-4xl font-light text-white mb-2 tracking-tight">
                vs {enemy.displayName || enemy.name}
              </h2>
              <span className="inline-block px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.15em] text-text-secondary bg-surface-subtle">
                Lane Opponent
              </span>
            </>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-surface-glass hover:bg-surface-highlight border border-white/10 transition-all duration-300"
        >
          <X size={20} className="text-white" />
        </button>
      </div>

      {/* Visual Orb */}
      <div className="relative flex-shrink-0 flex items-center justify-center py-12">
        <div className="relative w-48 h-48 animate-scale-in">
          {/* Rotating rings */}
          <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border border-white/5 animate-spin-slower" />
          
          {/* Center content */}
          <div className="absolute inset-8 rounded-full bg-surface-glass backdrop-blur-md flex items-center justify-center border border-white/10">
            <span className="text-4xl font-light text-white">
              {enemy?.name.charAt(0) || '?'}
            </span>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-radial from-warm-glow/20 to-transparent rounded-full blur-2xl animate-breathe" />
        </div>
      </div>

      {/* Stats Chips */}
      <div className="grid grid-cols-3 gap-3 px-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <DetailChip 
          label="Confidence" 
          value={getConfidenceLabel(results.confidence)} 
          active={results.confidence >= 70}
        />
        <DetailChip 
          label="Counters" 
          value={String(results.counters.length)} 
        />
        <DetailChip 
          label="Tactics" 
          value={String(results.tactics.length)} 
        />
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 px-6 mb-4">
        <button
          onClick={() => setActiveTab('counters')}
          className={`
            flex-1 py-3 rounded-xl text-sm font-medium
            transition-all duration-300
            ${activeTab === 'counters' 
              ? 'bg-surface-highlight text-white border border-white/10' 
              : 'bg-surface-subtle text-text-muted hover:text-text-secondary'}
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <Shield size={16} />
            Counters
          </div>
        </button>
        <button
          onClick={() => setActiveTab('tactics')}
          className={`
            flex-1 py-3 rounded-xl text-sm font-medium
            transition-all duration-300
            ${activeTab === 'tactics' 
              ? 'bg-surface-highlight text-white border border-white/10' 
              : 'bg-surface-subtle text-text-muted hover:text-text-secondary'}
          `}
        >
          <div className="flex items-center justify-center gap-2">
            <Zap size={16} />
            Tactics
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
        {activeTab === 'counters' && (
          <div className="space-y-3 animate-fade-in">
            {topCounters.map((counter, index) => (
              <GlassCard 
                key={counter.champion.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Champion Avatar */}
                  <div className="w-14 h-14 rounded-2xl bg-surface-highlight flex items-center justify-center flex-shrink-0 border border-white/10">
                    <span className="text-xl font-semibold text-warm-glow">
                      {counter.champion.name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-medium text-white">
                        {counter.champion.displayName || counter.champion.name}
                      </h3>
                      <span className={`text-xs font-medium ${getDifficultyColor(counter.difficulty)}`}>
                        {counter.difficulty || 'Medium'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-text-secondary leading-relaxed mb-2">
                      {counter.reason}
                    </p>
                    
                    {/* Confidence bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-surface-highlight rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-warm-dim to-warm-glow rounded-full transition-all duration-500"
                          style={{ width: `${counter.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-muted">
                        {counter.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
            
            {results.counters.length > 3 && (
              <button className="w-full py-3 text-sm text-text-secondary hover:text-white transition-colors flex items-center justify-center gap-1">
                View {results.counters.length - 3} more counters
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        )}

        {activeTab === 'tactics' && (
          <div className="space-y-3 animate-fade-in">
            {results.tactics.map((tactic, index) => (
              <GlassCard 
                key={tactic.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-warm-glow/10 flex items-center justify-center flex-shrink-0">
                    <Target size={16} className="text-warm-glow" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{tactic.title}</h3>
                    <span className="text-xs text-text-muted uppercase tracking-wider">
                      {tactic.phase}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 ml-11">
                  {tactic.steps.map((step, stepIndex) => (
                    <div key={stepIndex} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-warm-glow/50 mt-2 flex-shrink-0" />
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {step.action}
                        {step.timing && (
                          <span className="text-warm-glow ml-1">({step.timing})</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
