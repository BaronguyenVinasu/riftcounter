'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChampionSummary } from '@riftcounter/shared';

interface ChampionSelectProps {
  selectedChampions: string[];
  onSelect: (champions: string[]) => void;
  maxSelections?: number;
  placeholder?: string;
}

// Mock data - in production, this would come from the API
const mockChampions: ChampionSummary[] = [
  { id: 'yasuo', name: 'Yasuo', displayName: 'Yasuo', roles: ['mid', 'baron'], tags: ['fighter', 'assassin'] },
  { id: 'jinx', name: 'Jinx', displayName: 'Jinx', roles: ['adc'], tags: ['marksman'] },
  { id: 'leesin', name: 'Lee Sin', displayName: 'Lee Sin', roles: ['jungle', 'baron'], tags: ['fighter', 'assassin'] },
  { id: 'lux', name: 'Lux', displayName: 'Lux', roles: ['mid', 'support'], tags: ['mage', 'support'] },
  { id: 'nautilus', name: 'Nautilus', displayName: 'Nautilus', roles: ['support'], tags: ['tank', 'support'] },
  { id: 'seraphine', name: 'Seraphine', displayName: 'Seraphine', roles: ['mid', 'support'], tags: ['mage', 'support'] },
  { id: 'draven', name: 'Draven', displayName: 'Draven', roles: ['adc'], tags: ['marksman'] },
  { id: 'ezreal', name: 'Ezreal', displayName: 'Ezreal', roles: ['adc'], tags: ['marksman', 'mage'] },
  { id: 'senna', name: 'Senna', displayName: 'Senna', roles: ['support', 'adc'], tags: ['marksman', 'support'] },
  { id: 'zed', name: 'Zed', displayName: 'Zed', roles: ['mid', 'jungle'], tags: ['assassin'] },
  { id: 'ahri', name: 'Ahri', displayName: 'Ahri', roles: ['mid'], tags: ['mage', 'assassin'] },
  { id: 'ekko', name: 'Ekko', displayName: 'Ekko', roles: ['mid', 'jungle'], tags: ['assassin', 'mage'] },
  { id: 'darius', name: 'Darius', displayName: 'Darius', roles: ['baron'], tags: ['fighter', 'tank'] },
  { id: 'garen', name: 'Garen', displayName: 'Garen', roles: ['baron'], tags: ['fighter', 'tank'] },
  { id: 'thresh', name: 'Thresh', displayName: 'Thresh', roles: ['support'], tags: ['support', 'tank'] },
];

export function ChampionSelect({
  selectedChampions,
  onSelect,
  maxSelections = 5,
  placeholder = 'Search...',
}: ChampionSelectProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [champions, setChampions] = useState<ChampionSummary[]>(mockChampions);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter champions based on query
  const filteredChampions = champions.filter((champion) => {
    const searchLower = query.toLowerCase();
    return (
      !selectedChampions.includes(champion.id) &&
      (champion.name.toLowerCase().includes(searchLower) ||
        champion.id.toLowerCase().includes(searchLower))
    );
  });

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter') {
          setIsOpen(true);
          e.preventDefault();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredChampions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredChampions[highlightedIndex]) {
            handleSelect(filteredChampions[highlightedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          break;
        case 'Backspace':
          if (query === '' && selectedChampions.length > 0) {
            onSelect(selectedChampions.slice(0, -1));
          }
          break;
      }
    },
    [isOpen, filteredChampions, highlightedIndex, query, selectedChampions, onSelect]
  );

  const handleSelect = (champion: ChampionSummary) => {
    if (selectedChampions.length < maxSelections) {
      onSelect([...selectedChampions, champion.id]);
      setQuery('');
      setHighlightedIndex(0);
      inputRef.current?.focus();
    }
  };

  const handleRemove = (championId: string) => {
    onSelect(selectedChampions.filter((id) => id !== championId));
    inputRef.current?.focus();
  };

  // Reset highlighted index when query changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [query]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (listRef.current && isOpen) {
      const highlighted = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlighted) {
        highlighted.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const getChampionById = (id: string) =>
    champions.find((c) => c.id === id);

  const getLaneAbbrev = (roles: string[]) => {
    const abbrevs: Record<string, string> = {
      baron: 'TOP',
      mid: 'MID',
      jungle: 'JG',
      adc: 'ADC',
      support: 'SUP',
    };
    return roles.map((r) => abbrevs[r] || r.toUpperCase()).join('/');
  };

  return (
    <div className="relative">
      {/* Selected Champions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {selectedChampions.map((id) => {
          const champion = getChampionById(id);
          return (
            <div
              key={id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-800 text-sm"
            >
              <span className="font-medium">
                {champion?.displayName || id}
              </span>
              <span className="text-2xs text-primary-500 font-mono">
                {champion && getLaneAbbrev(champion.roles)}
              </span>
              <button
                onClick={() => handleRemove(id)}
                className="ml-1 text-primary-500 hover:text-primary-900 dark:hover:text-primary-100"
                aria-label={`Remove ${champion?.displayName || id}`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedChampions.length >= maxSelections
              ? 'Max champions selected'
              : placeholder
          }
          disabled={selectedChampions.length >= maxSelections}
          className="input pr-10"
          aria-label="Search champions"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-primary-400 font-mono">
          {selectedChampions.length}/{maxSelections}
        </span>
      </div>

      {/* Dropdown */}
      {isOpen && filteredChampions.length > 0 && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-700 shadow-lg scrollbar-thin"
          role="listbox"
        >
          {filteredChampions.map((champion, index) => (
            <button
              key={champion.id}
              onClick={() => handleSelect(champion)}
              className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors ${
                index === highlightedIndex
                  ? 'bg-primary-100 dark:bg-primary-800'
                  : 'hover:bg-primary-50 dark:hover:bg-primary-800/50'
              }`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <span className="font-medium">{champion.displayName}</span>
              <span className="text-2xs text-primary-500 font-mono">
                {getLaneAbbrev(champion.roles)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* No results */}
      {isOpen && query && filteredChampions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 p-4 bg-white dark:bg-primary-900 border border-primary-200 dark:border-primary-700 text-center text-primary-500 text-sm">
          No champions found
        </div>
      )}
    </div>
  );
}
