'use client';

import { DataSource } from '@riftcounter/shared';

interface SourceStripProps {
  sources: DataSource[];
  lastRefreshed: string;
  confidence: number;
  uncertainty: 'low' | 'medium' | 'high';
}

export function SourceStrip({
  sources,
  lastRefreshed,
  confidence,
  uncertainty,
}: SourceStripProps) {
  const formattedDate = new Date(lastRefreshed).toLocaleString();

  return (
    <div className="mt-8 pt-6 border-t border-primary-200 dark:border-primary-800">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-primary-500">
        {/* Sources */}
        <div className="flex items-center gap-2">
          <span className="font-medium">Sources:</span>
          <div className="flex flex-wrap gap-2">
            {sources.map((source, index) => (
              <span key={index} className="flex items-center gap-1">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary-900 dark:hover:text-primary-100 underline"
                  >
                    {source.name}
                  </a>
                ) : (
                  source.name
                )}
                <span className="text-primary-300">
                  ({source.reliability}%)
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4">
          {/* Uncertainty badge */}
          <div className="flex items-center gap-1">
            <span
              className={`w-2 h-2 rounded-full ${
                uncertainty === 'low'
                  ? 'bg-success'
                  : uncertainty === 'medium'
                  ? 'bg-warning'
                  : 'bg-error animate-pulse-subtle'
              }`}
            />
            <span
              className={
                uncertainty === 'high' ? 'text-error font-medium' : ''
              }
            >
              {uncertainty === 'low'
                ? 'Data fresh'
                : uncertainty === 'medium'
                ? 'Data may be stale'
                : 'High uncertainty'}
            </span>
          </div>

          {/* Last refreshed */}
          <span>Updated: {formattedDate}</span>

          {/* Overall confidence */}
          <span>
            Confidence:{' '}
            <strong
              className={
                confidence >= 75
                  ? 'text-primary-900 dark:text-primary-100'
                  : confidence >= 50
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-primary-400'
              }
            >
              {confidence}%
            </strong>
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="mt-3 text-2xs text-primary-400">
        Recommendations are based on aggregated community data and rule-based
        heuristics. Actual gameplay outcomes may vary. Use as guidance, not
        gospel.
      </p>
    </div>
  );
}
