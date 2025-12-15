'use client';

/**
 * ChampionAnalysisPanel Component
 * 
 * Displays champion-scoped analysis results including:
 * - Matchup vector visualization
 * - Enhanced builds with situational swaps
 * - Stage-based tactics (early/mid/late)
 * - Skill combos
 * - Confidence and provenance info
 */

import { useState } from 'react';

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
  condition: string;
  description: string;
  swapOut: string;
  swapIn: string;
  priority: 'high' | 'medium' | 'low';
}

interface EnhancedBuild {
  type: string;
  name: string;
  items: string[];
  emblem?: string;
  situationalSwaps: SituationalSwap[];
  confidence: number;
  sources: string[];
  reasoning?: string;
}

interface EnhancedTactic {
  id: string;
  title: string;
  stage: 'early' | 'mid' | 'late';
  steps: Array<{ action: string; timing?: string }>;
  reasoning: string;
  confidence: number;
}

interface DetailedSkillCombo {
  name: string;
  sequence: string;
  notes: string;
  timing?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  damage: 'low' | 'medium' | 'high' | 'lethal';
}

interface ChampionSummary {
  id: string;
  name: string;
  displayName?: string;
  roles?: string[];
  tags?: string[];
}

interface ChampionAnalysisPanelProps {
  playerChampion: ChampionSummary;
  laneEnemy: ChampionSummary | null;
  matchupVector: MatchupVector;
  builds: EnhancedBuild[];
  tactics: EnhancedTactic[];
  skillCombos: DetailedSkillCombo[];
  situationalSwaps: SituationalSwap[];
  provenance?: {
    sources: Array<{ name: string; url: string; reliability: number }>;
    lastRefreshed: string;
  };
  stale?: boolean;
  confidence: number;
}

export default function ChampionAnalysisPanel({
  playerChampion,
  laneEnemy,
  matchupVector,
  builds,
  tactics,
  skillCombos,
  situationalSwaps,
  provenance,
  stale,
  confidence,
}: ChampionAnalysisPanelProps) {
  const [selectedBuildIndex, setSelectedBuildIndex] = useState(0);
  const [showBuildReasoning, setShowBuildReasoning] = useState(false);
  const [activeStage, setActiveStage] = useState<'early' | 'mid' | 'late'>('early');

  const selectedBuild = builds[selectedBuildIndex];
  const stageTactics = tactics.filter(t => t.stage === activeStage);

  return (
    <div className="space-y-6">
      {/* Header with stale warning */}
      {stale && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-sm text-yellow-800">
            Data may be outdated. A new patch has been detected.
          </span>
        </div>
      )}

      {/* Matchup Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {playerChampion.displayName || playerChampion.name} vs {laneEnemy?.displayName || laneEnemy?.name || 'Enemy'}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Confidence</span>
            <span className={`px-2 py-1 rounded text-sm font-medium ${
              confidence >= 70 ? 'bg-green-100 text-green-800' :
              confidence >= 50 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {confidence}%
            </span>
          </div>
        </div>

        {/* Matchup Vector Bars */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(matchupVector).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{formatVectorKey(key)}</span>
                <span className={value > 0 ? 'text-green-600' : value < 0 ? 'text-red-600' : 'text-gray-600'}>
                  {value > 0 ? '+' : ''}{value}
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    value > 0 ? 'bg-green-500' : value < 0 ? 'bg-red-500' : 'bg-gray-300'
                  }`}
                  style={{
                    width: `${Math.min(Math.abs(value), 100)}%`,
                    marginLeft: value < 0 ? `${100 - Math.abs(value)}%` : '0',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Builds Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Recommended Builds</h3>
          <button
            onClick={() => setShowBuildReasoning(!showBuildReasoning)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Why this build?
          </button>
        </div>

        {/* Build Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {builds.map((build, index) => (
            <button
              key={index}
              onClick={() => setSelectedBuildIndex(index)}
              className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                selectedBuildIndex === index
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {build.name}
              <span className="ml-1 text-xs opacity-70">{build.confidence}%</span>
            </button>
          ))}
        </div>

        {/* Selected Build */}
        {selectedBuild && (
          <div className="space-y-4">
            {/* Items */}
            <div className="flex flex-wrap gap-2">
              {selectedBuild.items.map((item, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-gray-100 rounded-lg text-sm font-medium"
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Emblem */}
            {selectedBuild.emblem && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Emblem:</span> {selectedBuild.emblem}
              </div>
            )}

            {/* Reasoning */}
            {showBuildReasoning && selectedBuild.reasoning && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                <p className="font-medium mb-1">Why this build?</p>
                <p>{selectedBuild.reasoning}</p>
                {selectedBuild.sources && (
                  <p className="mt-2 text-xs text-gray-500">
                    Sources: {selectedBuild.sources.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Situational Swaps */}
            {selectedBuild.situationalSwaps?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Situational Swaps</p>
                <div className="space-y-2">
                  {selectedBuild.situationalSwaps.map((swap, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-2 p-2 rounded text-sm ${
                        swap.priority === 'high' ? 'bg-red-50' :
                        swap.priority === 'medium' ? 'bg-yellow-50' : 'bg-gray-50'
                      }`}
                    >
                      <span className={`mt-0.5 w-2 h-2 rounded-full ${
                        swap.priority === 'high' ? 'bg-red-500' :
                        swap.priority === 'medium' ? 'bg-yellow-500' : 'bg-gray-400'
                      }`} />
                      <div>
                        <p className="font-medium">{swap.condition}</p>
                        <p className="text-gray-600">
                          Swap <span className="text-red-600">{swap.swapOut}</span> → <span className="text-green-600">{swap.swapIn}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tactics Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Game Stage Tactics</h3>

        {/* Stage Tabs */}
        <div className="flex gap-2 mb-4">
          {(['early', 'mid', 'late'] as const).map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                activeStage === stage
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {stage} Game
            </button>
          ))}
        </div>

        {/* Stage Tactics */}
        {stageTactics.map((tactic) => (
          <div key={tactic.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{tactic.title}</h4>
              <span className="text-xs text-gray-500">{tactic.confidence}% confidence</span>
            </div>
            
            <ul className="space-y-2">
              {tactic.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 w-1.5 h-1.5 bg-black rounded-full" />
                  <div>
                    <span>{step.action}</span>
                    {step.timing && (
                      <span className="ml-2 text-gray-500">({step.timing})</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">
              <span className="font-medium">Reasoning:</span> {tactic.reasoning}
            </p>
          </div>
        ))}
      </div>

      {/* Skill Combos Section */}
      {skillCombos.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Skill Combos</h3>
          
          <div className="space-y-4">
            {skillCombos.map((combo, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{combo.name}</h4>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      combo.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      combo.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {combo.difficulty}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      combo.damage === 'lethal' ? 'bg-purple-100 text-purple-700' :
                      combo.damage === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {combo.damage} damage
                    </span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded p-2 font-mono text-sm mb-2">
                  {combo.sequence}
                </div>
                
                <p className="text-sm text-gray-600">{combo.notes}</p>
                
                {combo.timing && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">When:</span> {combo.timing}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Provenance */}
      {provenance && (
        <div className="text-xs text-gray-500 flex items-center justify-between">
          <span>
            Sources: {provenance.sources.map(s => s.name).join(', ')}
          </span>
          <span>
            Last updated: {new Date(provenance.lastRefreshed).toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

function formatVectorKey(key: string): string {
  const mapping: Record<string, string> = {
    laneDominance: 'Lane Dominance',
    allInPotential: 'All-In Potential',
    pokeAdvantage: 'Poke Advantage',
    mobilityDiff: 'Mobility',
    ccDiff: 'Crowd Control',
    sustainDiff: 'Sustain',
    waveclearDiff: 'Waveclear',
    scalingDiff: 'Scaling',
  };
  return mapping[key] || key;
}
