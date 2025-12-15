'use client';

import { AnalysisResponse } from '@riftcounter/shared';
import { BuildCard } from './BuildCard';
import { TacticsList } from './TacticsList';
import { CounterCard } from './CounterCard';
import { PowerSpikesTimeline } from './PowerSpikesTimeline';

interface ResultsPanelProps {
  results: AnalysisResponse;
}

export function ResultsPanel({ results }: ResultsPanelProps) {
  const {
    laneEnemy,
    counters,
    tactics,
    builds,
    skillCombos,
    powerSpikes,
    abilityWarnings,
  } = results;

  return (
    <div className="space-y-8">
      {/* Header with lane enemy */}
      {laneEnemy && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-primary-500 uppercase tracking-wider">
                Lane Opponent
              </span>
              <h3 className="text-2xl font-bold mt-1">
                {laneEnemy.displayName}
              </h3>
              <div className="flex gap-2 mt-2">
                {laneEnemy.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 text-2xs font-medium bg-primary-100 dark:bg-primary-800 uppercase"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-primary-500">Confidence</span>
              <div
                className={`text-3xl font-bold ${
                  results.confidence >= 75
                    ? 'text-primary-900 dark:text-primary-100'
                    : results.confidence >= 50
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-primary-400'
                }`}
              >
                {results.confidence}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column - Counters */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <span>Counter Picks</span>
              <span className="text-xs font-normal text-primary-500">
                ({counters.length})
              </span>
            </h3>
            <div className="space-y-3">
              {counters.map((counter, index) => (
                <CounterCard key={counter.champion.id} counter={counter} rank={index + 1} />
              ))}
              {counters.length === 0 && (
                <p className="text-sm text-primary-500">
                  No specific counters found for this matchup.
                </p>
              )}
            </div>
          </div>

          {/* Ability Warnings */}
          {abilityWarnings.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Watch Out For</h3>
              <div className="space-y-2">
                {abilityWarnings.slice(0, 3).map((warning, index) => (
                  <div
                    key={index}
                    className="p-3 bg-primary-50 dark:bg-primary-800/50 text-sm"
                  >
                    <div className="font-medium">{warning.ability}</div>
                    <p className="text-primary-600 dark:text-primary-400 text-xs mt-1">
                      {warning.counterplay}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Center Column - Tactics */}
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Lane Tactics</h3>
            <TacticsList tactics={tactics} />
          </div>

          {/* Skill Combos */}
          {skillCombos.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Skill Combos</h3>
              <div className="space-y-3">
                {skillCombos.map((combo, index) => (
                  <div key={index} className="card p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{combo.name}</span>
                      <span
                        className={`text-2xs px-2 py-0.5 ${
                          combo.difficulty === 'easy'
                            ? 'bg-primary-100 dark:bg-primary-800'
                            : combo.difficulty === 'medium'
                            ? 'bg-primary-200 dark:bg-primary-700'
                            : 'bg-primary-300 dark:bg-primary-600'
                        }`}
                      >
                        {combo.difficulty}
                      </span>
                    </div>
                    <code className="block text-sm font-mono text-primary-600 dark:text-primary-400 mb-2">
                      {combo.sequence}
                    </code>
                    <p className="text-xs text-primary-500">{combo.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Power Spikes */}
          {powerSpikes.length > 0 && (
            <div>
              <h3 className="font-semibold mb-4">Power Spikes</h3>
              <PowerSpikesTimeline spikes={powerSpikes} />
            </div>
          )}
        </div>

        {/* Right Column - Builds */}
        <div>
          <h3 className="font-semibold mb-4">Recommended Builds</h3>
          <div className="space-y-4">
            {builds.map((build, index) => (
              <BuildCard key={index} build={build} isPrimary={index === 0} />
            ))}
            {builds.length === 0 && (
              <p className="text-sm text-primary-500">
                No specific build recommendations available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
