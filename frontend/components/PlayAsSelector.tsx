'use client';

/**
 * PlayAsSelector Component
 * 
 * Compact champion selector for the "Play As" feature.
 * Allows users to select their champion for champion-scoped analysis.
 */

import { useState, useEffect, useRef } from 'react';
import { ChampionSummary } from '@/shared';

interface PlayAsSelectorProps {
  selectedChampion: ChampionSummary | null;
  onSelect: (champion: ChampionSummary | null) => void;
  onAnalyze: () => void;
  disabled?: boolean;
  className?: string;
}

export default function PlayAsSelector({
  selectedChampion,
  onSelect,
  onAnalyze,
  disabled = false,
  className = '',
}: PlayAsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChampionSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search champions when query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const searchChampions = async () => {
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(
          `${apiUrl}/api/champions/search?q=${encodeURIComponent(searchQuery)}&limit=8`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.data || []);
        }
      } catch (error) {
        console.error('Error searching champions:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchChampions, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (champion: ChampionSummary) => {
    onSelect(champion);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery('');
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Play As</h3>
        {selectedChampion && (
          <button
            onClick={handleClear}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      {selectedChampion ? (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-gray-600">
              {selectedChampion.displayName?.charAt(0) || selectedChampion.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {selectedChampion.displayName || selectedChampion.name}
            </p>
            <p className="text-sm text-gray-500">
              {selectedChampion.roles?.join(' / ') || 'Unknown role'}
            </p>
          </div>
          <button
            onClick={onAnalyze}
            disabled={disabled}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Analyze
          </button>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search your champion..."
            disabled={disabled}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-black disabled:bg-gray-100"
          />

          {/* Search Icon */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isSearching ? (
              <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-black rounded-full" />
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Dropdown */}
          {isOpen && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((champion) => (
                <button
                  key={champion.id}
                  onClick={() => handleSelect(champion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-600">
                      {(champion.displayName || champion.name).charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {champion.displayName || champion.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {champion.roles?.join(' / ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <p className="mt-3 text-xs text-gray-500">
        Select your champion to get personalized matchup analysis, builds, and tactics.
      </p>
    </div>
  );
}
