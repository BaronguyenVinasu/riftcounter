'use client';

import React from 'react';

interface Lane {
  id: string;
  name: string;
  shortName: string;
}

const lanes: Lane[] = [
  { id: 'baron', name: 'Baron Lane', shortName: 'B' },
  { id: 'jungle', name: 'Jungle', shortName: 'J' },
  { id: 'mid', name: 'Mid Lane', shortName: 'M' },
  { id: 'dragon', name: 'Dragon Lane', shortName: 'D' },
  { id: 'support', name: 'Support', shortName: 'S' },
];

interface LaneSelectorProps {
  selectedLane: string | null;
  onSelect: (lane: string) => void;
}

export const LaneSelector = ({ selectedLane, onSelect }: LaneSelectorProps) => {
  return (
    <div className="flex justify-center items-center gap-8">
      {lanes.map((lane) => (
        <button
          key={lane.id}
          onClick={() => onSelect(lane.id)}
          className="flex flex-col items-center gap-3 group transition-all duration-500"
        >
          <span 
            className={`
              text-xs tracking-[0.25em] font-medium uppercase
              transition-all duration-500
              ${selectedLane === lane.id 
                ? 'text-white' 
                : 'text-text-muted group-hover:text-text-secondary'}
            `}
          >
            {lane.shortName}
          </span>
          
          {/* Active indicator dot */}
          <div 
            className={`
              h-1.5 w-1.5 rounded-full 
              transition-all duration-500
              ${selectedLane === lane.id 
                ? 'bg-white scale-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]' 
                : 'bg-transparent scale-0 group-hover:scale-75 group-hover:bg-text-muted'}
            `} 
          />
        </button>
      ))}
    </div>
  );
};

export default LaneSelector;
