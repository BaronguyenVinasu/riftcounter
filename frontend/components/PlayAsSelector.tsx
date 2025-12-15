'use client';

import { useState, useEffect, useRef } from 'react';

interface ChampionSummary {
  id: string;
  name: string;
  displayName?: string;
  roles?: string[];
  tags?: string[];
}

interface PlayAsSelectorProps {
  selectedChampion: ChampionSummary | null;
  onSelect: (champion: ChampionSummary | null) => void;
  onAnalyze: () => void;
  disabled?: boolean;
}

export default function PlayAsSelector({ selectedChampion, onSelect, onAnalyze, disabled = false }: PlayAsSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ChampionSummary[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const search = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await fetch(`${apiUrl}/api/champions/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        if (res.ok) { const data = await res.json(); setSearchResults(data.data || []); }
      } catch (e) { console.error(e); }
    };
    const t = setTimeout(search, 200);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Play As (Optional)</h3>
        {selectedChampion && <button onClick={() => onSelect(null)} className="text-sm text-primary-500">Clear</button>}
      </div>
      {selectedChampion ? (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">{selectedChampion.name.charAt(0)}</span>
          </div>
          <div>
            <p className="font-medium">{selectedChampion.displayName || selectedChampion.name}</p>
            <p className="text-sm text-primary-500">{selectedChampion.roles?.join(' / ')}</p>
          </div>
        </div>
      ) : (
        <div className="relative" ref={dropdownRef}>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }} 
            placeholder="Search your champion..." 
            disabled={disabled} 
            className="w-full px-4 py-3 border border-primary-200 rounded-lg focus:outline-none focus:border-primary-500" 
          />
          {isOpen && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((c) => (
                <button 
                  key={c.id} 
                  onClick={() => { onSelect(c); setSearchQuery(''); setIsOpen(false); }} 
                  className="w-full px-4 py-3 text-left hover:bg-primary-50 border-b last:border-b-0"
                >
                  <p className="font-medium">{c.displayName || c.name}</p>
                  <p className="text-xs text-primary-500">{c.roles?.join(' / ')}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="mt-3 text-xs text-primary-500">Select your champion for personalized analysis.</p>
    </div>
  );
}
