'use client';

import { useState } from 'react';
import { Atmosphere } from '@/components/layout/Atmosphere';
import { LaneSelector } from '@/components/LaneSelector';
import { ChampionSearch } from '@/components/ChampionSearch';
import { AnalyzeButton } from '@/components/AnalyzeButton';
import { AnalysisResults } from '@/components/AnalysisResults';
import { GlassCard } from '@/components/ui/GlassCard';
import { RotateCcw } from 'lucide-react';

interface Champion {
  id: string;
  name: string;
  displayName?: string;
  roles?: string[];
}

export default function Home() {
  const [selectedLane, setSelectedLane] = useState<string | null>(null);
  const [selectedEnemies, setSelectedEnemies] = useState<Champion[]>([]);
  const [playerChampion, setPlayerChampion] = useState<Champion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = selectedEnemies.length > 0 && selectedLane;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enemies: selectedEnemies.map(e => e.id),
          lane: selectedLane,
          playerChampion: playerChampion?.id,
          options: {
            preferCounters: !playerChampion,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to analyze. Please try again.');
      console.error(err);
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

  const handleAddEnemy = (champion: Champion) => {
    setSelectedEnemies(prev => [...prev, champion]);
  };

  const handleRemoveEnemy = (championId: string) => {
    setSelectedEnemies(prev => prev.filter(c => c.id !== championId));
  };

  // Show results view
  if (results) {
    return (
      <Atmosphere intensity="medium" variant="warm">
        <AnalysisResults 
          results={results} 
          onClose={() => setResults(null)} 
        />
      </Atmosphere>
    );
  }

  return (
    <Atmosphere intensity="high" variant="warm">
      <div className="flex flex-col min-h-screen px-6 pb-8">
        
        {/* Header */}
        <header className="pt-12 pb-6 text-center animate-fade-in-down">
          <h1 className="text-2xl font-light tracking-tight text-white/90 mb-1">
            RiftCounter
          </h1>
          <p className="text-xs text-text-muted uppercase tracking-[0.2em]">
            Tactical Companion
          </p>
        </header>

        {/* Lane Selector */}
        <div className="py-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <LaneSelector 
            selectedLane={selectedLane} 
            onSelect={setSelectedLane} 
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          
          {/* Enemy Selection Card */}
          <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <GlassCard padding="lg" glow>
              <ChampionSearch
                selectedChampions={selectedEnemies}
                onSelect={handleAddEnemy}
                onRemove={handleRemoveEnemy}
                maxSelections={5}
                label="Enemy Team"
                placeholder="Search enemy champion..."
              />
            </GlassCard>
          </div>

          {/* Player Champion (Optional) */}
          <div className="mt-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <GlassCard padding="md">
              <ChampionSearch
                selectedChampions={playerChampion ? [playerChampion] : []}
                onSelect={(c) => setPlayerChampion(c)}
                onRemove={() => setPlayerChampion(null)}
                maxSelections={1}
                label="Playing As (Optional)"
                placeholder="Your champion..."
              />
            </GlassCard>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-threat-glow/10 border border-threat-glow/30 text-center animate-fade-in">
              <p className="text-threat-glow text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="pt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between max-w-md mx-auto w-full">
            
            {/* Status */}
            <div className="flex flex-col">
              <span className="text-text-muted text-xs uppercase tracking-[0.15em]">
                Status
              </span>
              <span className="text-white text-lg font-light">
                {!selectedLane && 'Select lane'}
                {selectedLane && selectedEnemies.length === 0 && 'Add enemies'}
                {selectedLane && selectedEnemies.length > 0 && 'Ready'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              {/* Reset Button */}
              {(selectedEnemies.length > 0 || selectedLane) && (
                <button
                  onClick={handleReset}
                  className="p-3 rounded-full bg-surface-glass border border-white/10 hover:bg-surface-highlight transition-all duration-300"
                >
                  <RotateCcw size={18} className="text-text-secondary" />
                </button>
              )}

              {/* Analyze Button */}
              <AnalyzeButton
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                loading={isAnalyzing}
              />
            </div>
          </div>
        </div>
      </div>
    </Atmosphere>
  );
}
