'use client';

import { CounterPick } from '@riftcounter/shared';

interface CounterCardProps {
  counter: CounterPick;
  rank: number;
}

export function CounterCard({ counter, rank }: CounterCardProps) {
  const { champion, reason, confidence, difficulty, winrateEst } = counter;

  return (
    <div className="card p-3">
      <div className="flex items-start gap-3">
        {/* Rank Badge */}
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary-900 dark:bg-primary-100 text-white dark:text-primary-900 text-xs font-bold">
          {rank}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-semibold truncate">{champion.displayName}</h4>
            <div
              className={`text-xs font-medium ${
                confidence >= 75
                  ? 'confidence-high'
                  : confidence >= 50
                  ? 'confidence-medium'
                  : 'confidence-low'
              }`}
            >
              {confidence}%
            </div>
          </div>

          <p className="text-xs text-primary-600 dark:text-primary-400 mb-2">
            {reason}
          </p>

          <div className="flex items-center gap-3 text-2xs text-primary-500">
            {winrateEst && (
              <span>
                Est. WR: <strong>{winrateEst.toFixed(1)}%</strong>
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 ${
                difficulty === 'easy'
                  ? 'bg-primary-100 dark:bg-primary-800'
                  : difficulty === 'medium'
                  ? 'bg-primary-200 dark:bg-primary-700'
                  : 'bg-primary-300 dark:bg-primary-600'
              }`}
            >
              {difficulty}
            </span>
            <div className="flex gap-1">
              {champion.roles.slice(0, 2).map((role) => (
                <span key={role} className="uppercase">
                  {role === 'baron'
                    ? 'TOP'
                    : role === 'adc'
                    ? 'BOT'
                    : role === 'support'
                    ? 'SUP'
                    : role === 'jungle'
                    ? 'JG'
                    : role.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
