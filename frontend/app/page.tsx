'use client';

import { useState } from 'react';
import { ChampionSelect } from '@/components/ChampionSelect';
import { LaneSelector } from '@/components/LaneSelector';
import { ResultsPanel } from '@/components/ResultsPanel';
import { SourceStrip } from '@/components/SourceStrip';
import PlayAsSelector from '@/components/PlayAsSelector';
import type { Lane, AnalysisResponse, ChampionSummary } from '@riftcounter/shared';

export default function HomePage() {
  const [selectedEnemies, setSelectedEnemies] = useState<string[]>([]);
  const [selectedLane, setSelectedLane] = useState<Lane | null>(null);
  const [playerChampion, setPlayerChampion] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (selectedEnemies.length === 0 || !selectedLane) {
      setError('Please select at least one enemy champion and a lane');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enemies: selectedEnemies,
          lane: selectedLane,
          playerChampion: playerChampion?.id,
          options: {
            preferCounters: !playerChampion,
            maxCounters: 5,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Analysis failed');
      }

      const data: AnalysisResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setSelectedEnemies([]);
    setSelectedLane(null);
    setPlayerChampion(null);
    setResults(null);
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold tracking-tight mb-3">
          Counter the Enemy
        </h2>
        <p className="text-primary-600 dark:text-primary-400 max-w-xl mx-auto">
          Enter the enemy team composition and your lane to get counter picks,
          lane tactics, and optimized builds.
        </p>
      </div>

      {/* Input Section */}
      <div className="grid gap-8 lg:grid-cols-3 mb-8">
        {/* Enemy Champion Select */}
        <div className="lg:col-span-2">
          <div className="card">
            <h3 className="font-semibold mb-4">Enemy Team</h3>
            <ChampionSelect
              selectedChampions={selectedEnemies}
              onSelect={(champions) => setSelectedEnemies(champions)}
              maxSelections={5}
              placeholder="Search champions..."
            />
            <p className="text-xs text-primary-500 mt-2">
              Select 1-5 enemy champions. Fuzzy search and aliases supported.
            </p>
          </div>
        </div>

        {/* Lane Selector */}
        <div>
          <div className="card h-full">
            <h3 className="font-semibold mb-4">Your Lane</h3>
            <LaneSelector
              selectedLane={selectedLane}
              onSelect={setSelectedLane}
            />
          </div>
        </div>
      </div>

      {/* Play As Selector */}
      <div className="mb-8">
        <PlayAsSelector
          selectedChampion={playerChampion}
          onSelect={setPlayerChampion}
          onAnalyze={handleAnalyze}
          disabled={isAnalyzing || selectedEnemies.length === 0 || !selectedLane}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 border border-error/30 bg-error/5 text-error text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || selectedEnemies.length === 0 || !selectedLane}
          className="btn-primary px-8 py-3 text-base"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <svg
                className="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Matchup'
          )}
        </button>
        {(selectedEnemies.length > 0 || selectedLane || results) && (
          <button onClick={handleReset} className="btn-secondary px-6 py-3">
            Reset
          </button>
        )}
      </div>

      {/* Results Section */}
      {results && (
        <div className="animate-fade-in">
          <ResultsPanel results={results} />
          <SourceStrip
            sources={results.sources}
            lastRefreshed={results.lastRefreshed}
            confidence={results.confidence}
            uncertainty={results.uncertainty}
          />
        </div>
      )}

      {/* Empty State */}
      {!results && !isAnalyzing && (
        <div className="text-center py-16 text-primary-400">
          <p className="text-lg">
            Select enemy champions and your lane to begin analysis
          </p>
        </div>
      )}
    </div>
  );
}
