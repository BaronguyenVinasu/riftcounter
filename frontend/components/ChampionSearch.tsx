'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

interface Champion {
  id: string;
  name: string;
  displayName?: string;
  roles?: string[];
}

interface ChampionSearchProps {
  selectedChampions: Champion[];
  onSelect: (champion: Champion) => void;
  onRemove: (championId: string) => void;
  maxSelections?: number;
  placeholder?: string;
  label?: string;
}

export const ChampionSearch = ({
  selectedChampions,
  onSelect,
  onRemove,
  maxSelections = 5,
  placeholder = "Search champion...",
  label = "Enemy Team"
}: ChampionSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Champion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const search = async () => {
      setIsSearching(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/champions/search?q=${encodeURIComponent(searchQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          // Filter out already selected champions
          const filtered = (data.data || []).filter(
            (c: Champion) => !selectedChampions.find(s => s.id === c.id)
          );
          setSearchResults(filtered);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 200);
    return () => clearTimeout(debounce);
  }, [searchQuery, selectedChampions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (champion: Champion) => {
    if (selectedChampions.length < maxSelections) {
      onSelect(champion);
      setSearchQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs uppercase tracking-[0.2em]">
          {label}
        </span>
        <span className="text-text-muted text-xs">
          {selectedChampions.length}/{maxSelections}
        </span>
      </div>

      {/* Selected Champions */}
      {selectedChampions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedChampions.map((champion) => (
            <div
              key={champion.id}
              className="
                flex items-center gap-2 
                px-4 py-2 
                rounded-full 
                bg-surface-glass 
                border border-white/10
                group
                transition-all duration-300
                hover:bg-surface-highlight
              "
            >
              <div className="w-6 h-6 rounded-full bg-warm-glow/20 flex items-center justify-center">
                <span className="text-xs font-medium text-warm-glow">
                  {champion.name.charAt(0)}
                </span>
              </div>
              <span className="text-sm text-white font-medium">
                {champion.displayName || champion.name}
              </span>
              <button
                onClick={() => onRemove(champion.id)}
                className="
                  ml-1 p-0.5 rounded-full
                  text-text-muted hover:text-white
                  hover:bg-white/10
                  transition-all duration-300
                "
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search Input */}
      {selectedChampions.length < maxSelections && (
        <div className="relative" ref={dropdownRef}>
          <div className="relative">
            <Search 
              size={18} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" 
            />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="
                w-full 
                pl-12 pr-4 py-4
                bg-surface-subtle
                border border-surface-border
                rounded-2xl
                text-white
                placeholder:text-text-muted
                focus:outline-none 
                focus:border-white/20
                focus:bg-surface-glass
                transition-all duration-300
              "
            />
          </div>

          {/* Dropdown */}
          {isOpen && searchResults.length > 0 && (
            <div 
              className="
                absolute z-50 w-full mt-2
                bg-deep/95
                border border-white/10
                rounded-2xl
                shadow-2xl shadow-black/50
                backdrop-blur-xl
                overflow-hidden
                animate-fade-in
              "
            >
              {searchResults.map((champion) => (
                <button
                  key={champion.id}
                  onClick={() => handleSelect(champion)}
                  className="
                    w-full px-4 py-3
                    flex items-center gap-3
                    text-left
                    hover:bg-surface-highlight
                    transition-all duration-200
                    border-b border-white/5 last:border-b-0
                  "
                >
                  <div className="w-10 h-10 rounded-full bg-surface-glass flex items-center justify-center">
                    <span className="text-lg font-semibold text-white/80">
                      {champion.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {champion.displayName || champion.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {champion.roles?.join(' · ') || 'Unknown'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Loading state */}
          {isOpen && isSearching && searchQuery && (
            <div className="absolute z-50 w-full mt-2 p-4 bg-deep/95 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-center gap-2 text-text-muted">
                <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Searching...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChampionSearch;
