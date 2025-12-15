'use client';

import { Lane } from '@riftcounter/shared';

interface LaneSelectorProps {
  selectedLane: Lane | null;
  onSelect: (lane: Lane) => void;
}

const lanes: Array<{ id: Lane; name: string; shortName: string }> = [
  { id: 'baron', name: 'Baron Lane', shortName: 'TOP' },
  { id: 'jungle', name: 'Jungle', shortName: 'JG' },
  { id: 'mid', name: 'Mid Lane', shortName: 'MID' },
  { id: 'adc', name: 'Dragon Lane', shortName: 'ADC' },
  { id: 'support', name: 'Support', shortName: 'SUP' },
];

export function LaneSelector({ selectedLane, onSelect }: LaneSelectorProps) {
  return (
    <div className="space-y-2" role="radiogroup" aria-label="Select your lane">
      {lanes.map((lane) => (
        <button
          key={lane.id}
          onClick={() => onSelect(lane.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
            selectedLane === lane.id
              ? 'bg-primary-900 text-white dark:bg-primary-100 dark:text-primary-900'
              : 'bg-primary-50 hover:bg-primary-100 dark:bg-primary-800/50 dark:hover:bg-primary-800'
          }`}
          role="radio"
          aria-checked={selectedLane === lane.id}
        >
          <span
            className={`lane-indicator ${
              selectedLane === lane.id
                ? 'bg-white/20 dark:bg-primary-900/20'
                : ''
            }`}
          >
            {lane.shortName}
          </span>
          <span className="font-medium">{lane.name}</span>
        </button>
      ))}
    </div>
  );
}
