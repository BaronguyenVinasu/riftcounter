'use client';

import React, { useState } from 'react';
import { X, ChevronRight, Shield, Zap, Target, BarChart3, Swords, Clock } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { DetailChip } from './ui/DetailChip';
import { MatchupVectorDisplay } from './MatchupVectorDisplay';
import { SituationalSwaps } from './SituationalSwaps';
import { PowerSpikesTimeline } from './PowerSpikesTimeline';
import { SkillCombos } from './SkillCombos';

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
  stage?: string;
  steps: { action: string; timing?: string }[];
  reasoning: string;
  confidence?: number;
}

interface MatchupVector {
  laneDominance: number;
  allInPotential: number;
  pokeAdvantage: number;
  mobilityDiff: number;
  ccDiff: number;
  sustainDiff: number;
  waveclearDiff: number;
  scalingDiff: number;
}

interface SituationalSwap {
  originalItem: string;
  swapItem: string;
  trigger: string;
  reason: string;
}

interface PowerSpike {
  time: string;
  type: 'level' | 'item';
  champion: 'you' | 'enemy';
  description: string;
  advantage: 'you' | 'enemy' | 'neutral';
}

interface SkillCombo {
  name: string;
  sequence: string;
  description?: string;
  notes?: string;
  timing?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  damage: 'low' | 'medium' | 'high' | 'lethal';
}

interface AnalysisResultsProps {
  results: {
    playerChampion?: {
      id: string;
      name: string;
      displayName?: string;
    };
    laneEnemy?: {
      id: string;
      name: string;
      displayName?: string;
    };
    counters: Counter[];
    tactics: Tactic[];
    enhancedTactics?: Tactic[];
    matchupVector?: MatchupVector;
    situationalSwaps?: SituationalSwap[];
    powerSpikes?: PowerSpike[];
    skillCombos?: SkillCombo[];
    detailedCombos?: SkillCombo[];
    confidence: number;
    uncertainty: string;
  };
  onClose: () => void;
}

type TabType = 'overview' | 'counters' | 'tactics' | 'combos' | 'spikes';

export const AnalysisResults = ({ results, onClose }: AnalysisResultsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  const enemy = results.laneEnemy;
  const player = results.playerChampion;
  const topCounters = results.counters.slice(0, 3);
  const tactics = results.enhancedTactics || results.tactics;
  const combos = results.detailedCombos || results.skillCombos || [];
  const hasMatchupVector = !!results.matchupVector;
  const hasSwaps = results.situationalSwaps && results.situationalSwaps.length > 0;
  const hasSpikes = results.powerSpikes && results.powerSpikes.length > 0;
  const hasCombos = combos.length > 0;

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

  const tabs: { id: TabType; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={14} />, show: hasMatchupVector },
    { id: 'counters', label: 'Counters', icon: <Shield size={14} />, show: true },
    { id: 'tactics', label: 'Tactics', icon: <Target size={14} />, show: tactics.length > 0 },
    { id: 'combos', label: 'Combos', icon: <Swords size={14} />, show: !!hasCombos },
    { id: 'spikes', label: 'Spikes', icon: <Clock size={14} />, show: !!hasSpikes },
  ];

  const visibleTabs = tabs.filter(t => t.show);

  return (
    <div className="min-h-screen flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start p-6 pt-12">
        <div className="animate-fade-in-down">
          {player && enemy ? (
            <>
              <p className="text-xs text-text-muted uppercase tracking-[0.2em] mb-1">
                {player.displayName || player.name}
              </p>
              <h2 className="text-3xl font-light text-white mb-2 tracking-tight">
                vs {enemy.displayName || enemy.name}
              </h2>
            </>
          ) : enemy ? (
            <>
              <h2 className="text-3xl font-light text-white mb-2 tracking-tight">
                vs {enemy.displayName || enemy.name}
              </h2>
              <span className="inline-block px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase tracking-[0.15em] text-text-secondary bg-surface-subtle">
                Counter Picks
              </span>
            </>
          ) : (
            <h2 className="text-3xl font-light text-white mb-2">
              Analysis Results
            </h2>
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
      <div className="relative flex-shrink-0 flex items-center justify-center py-8">
        <div className="relative w-40 h-40 animate-scale-in">
          <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
          <div className="absolute inset-4 rounded-full border border-white/5 animate-spin-slower" />
          
          <div className="absolute inset-6 rounded-full bg-surface-glass backdrop-blur-md flex items-center justify-center border border-white/10">
            <span className="text-3xl font-light text-white">
              {enemy?.name.charAt(0) || player?.name.charAt(0) || '?'}
            </span>
          </div>
          
          <div className="absolute inset-0 bg-gradient-radial from-warm-glow/20 to-transparent rounded-full blur-2xl animate-breathe" />
        </div>
      </div>

      {/* Stats Chips */}
      <div className="grid grid-cols-3 gap-2 px-6 mb-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
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
          label="Data" 
          value={results.uncertainty === 'low' ? 'Fresh' : 'Stale'}
          variant={results.uncertainty === 'low' ? 'success' : 'warning'}
        />
      </div>

      {/* Tab Selector */}
      <div className="flex gap-1 px-6 mb-4 overflow-x-auto scrollbar-hide">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap
              transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-surface-highlight text-white border border-white/10' 
                : 'bg-surface-subtle text-text-muted hover:text-text-secondary'}
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && hasMatchupVector && (
          <div className="space-y-4 animate-fade-in">
            <GlassCard>
              <h3 className="text-sm font-medium text-white mb-4">Matchup Analysis</h3>
              <MatchupVectorDisplay vector={results.matchupVector!} />
            </GlassCard>

            {hasSwaps && (
              <GlassCard>
                <SituationalSwaps swaps={results.situationalSwaps!} />
              </GlassCard>
            )}
          </div>
        )}

        {/* Counters Tab */}
        {activeTab === 'counters' && (
          <div className="space-y-3 animate-fade-in">
            {topCounters.map((counter, index) => (
              <GlassCard 
                key={counter.champion.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-highlight flex items-center justify-center flex-shrink-0 border border-white/10">
                    <span className="text-xl font-semibold text-warm-glow">
                      {counter.champion.name.charAt(0)}
                    </span>
                  </div>
                  
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

        {/* Tactics Tab */}
        {activeTab === 'tactics' && (
          <div className="space-y-3 animate-fade-in">
            {tactics.map((tactic, index) => (
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
                      {tactic.stage || tactic.phase}
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

                {tactic.reasoning && (
                  <p className="mt-3 ml-11 text-xs text-text-muted italic">
                    {tactic.reasoning}
                  </p>
                )}
              </GlassCard>
            ))}
          </div>
        )}

        {/* Combos Tab */}
        {activeTab === 'combos' && hasCombos && (
          <div className="animate-fade-in">
            <SkillCombos 
              combos={combos} 
              championName={player?.displayName || player?.name}
            />
          </div>
        )}

        {/* Power Spikes Tab */}
        {activeTab === 'spikes' && hasSpikes && (
          <div className="animate-fade-in">
            <GlassCard>
              <PowerSpikesTimeline 
                spikes={results.powerSpikes!}
                playerName={player?.displayName || player?.name || 'You'}
                enemyName={enemy?.displayName || enemy?.name || 'Enemy'}
              />
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;
