'use client';

import { Tactic } from '@riftcounter/shared';

interface TacticsListProps {
  tactics: Tactic[];
}

export function TacticsList({ tactics }: TacticsListProps) {
  if (tactics.length === 0) {
    return (
      <p className="text-sm text-primary-500">
        No specific tactics available for this matchup.
      </p>
    );
  }

  const phaseOrder = ['early', 'mid', 'late', 'teamfight'];
  const sortedTactics = [...tactics].sort(
    (a, b) => phaseOrder.indexOf(a.phase) - phaseOrder.indexOf(b.phase)
  );

  return (
    <div className="space-y-4">
      {sortedTactics.map((tactic) => (
        <div key={tactic.id} className="card p-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`phase-badge phase-${tactic.phase}`}>
              {tactic.phase}
            </span>
            <h4 className="font-semibold">{tactic.title}</h4>
          </div>

          {/* Steps */}
          <ol className="space-y-2 mb-3">
            {tactic.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-primary-100 dark:bg-primary-800 text-2xs font-medium">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <span>{step.action}</span>
                  {step.timing && (
                    <span className="text-primary-500 text-xs ml-2">
                      ({step.timing})
                    </span>
                  )}
                  {step.condition && (
                    <span className="block text-xs text-primary-500 mt-0.5">
                      ↳ {step.condition}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {/* Reasoning */}
          <div className="pt-3 border-t border-primary-200 dark:border-primary-700">
            <div className="text-xs text-primary-500 mb-1">Why</div>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              {tactic.reasoning}
            </p>
          </div>
        </div>
      ))}

      <style jsx>{`
        .phase-badge {
          font-size: 0.625rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.125rem 0.5rem;
        }
        .phase-early {
          background: #e5e5e5;
          color: #404040;
        }
        .phase-mid {
          background: #d4d4d4;
          color: #262626;
        }
        .phase-late {
          background: #a3a3a3;
          color: #171717;
        }
        .phase-teamfight {
          background: #171717;
          color: #fafafa;
        }
        :global(.dark) .phase-early {
          background: #404040;
          color: #e5e5e5;
        }
        :global(.dark) .phase-mid {
          background: #525252;
          color: #f5f5f5;
        }
        :global(.dark) .phase-late {
          background: #737373;
          color: #fafafa;
        }
        :global(.dark) .phase-teamfight {
          background: #fafafa;
          color: #171717;
        }
      `}</style>
    </div>
  );
}
