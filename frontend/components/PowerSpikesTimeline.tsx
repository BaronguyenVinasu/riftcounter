'use client';

import { PowerSpikeEntry } from '@riftcounter/shared';

interface PowerSpikesTimelineProps {
  spikes: PowerSpikeEntry[];
}

export function PowerSpikesTimeline({ spikes }: PowerSpikesTimelineProps) {
  if (spikes.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-3 top-0 bottom-0 w-px bg-primary-200 dark:bg-primary-700" />

      {/* Spikes */}
      <div className="space-y-4">
        {spikes.map((spike, index) => (
          <div key={index} className="relative flex items-start gap-4 pl-8">
            {/* Dot */}
            <div
              className={`absolute left-1.5 w-3 h-3 rounded-full ${
                spike.advantage === 'you'
                  ? 'bg-primary-900 dark:bg-primary-100'
                  : spike.advantage === 'enemy'
                  ? 'bg-primary-400'
                  : 'bg-primary-200 dark:bg-primary-700'
              }`}
            />

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium px-1.5 py-0.5 bg-primary-100 dark:bg-primary-800">
                  {spike.time}
                </span>
                {spike.champion !== 'both' && (
                  <span
                    className={`text-2xs ${
                      spike.champion === 'you'
                        ? 'text-primary-900 dark:text-primary-100'
                        : 'text-primary-500'
                    }`}
                  >
                    {spike.champion === 'you' ? 'Your spike' : 'Enemy spike'}
                  </span>
                )}
              </div>
              <p className="text-sm text-primary-600 dark:text-primary-400">
                {spike.description}
              </p>
            </div>

            {/* Advantage indicator */}
            <div className="flex-shrink-0">
              {spike.advantage === 'you' && (
                <span className="text-xs font-medium text-primary-900 dark:text-primary-100">
                  ↑ You
                </span>
              )}
              {spike.advantage === 'enemy' && (
                <span className="text-xs text-primary-500">↓ Enemy</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
