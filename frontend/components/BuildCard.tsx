'use client';

import { useState } from 'react';
import { BuildRecommendation } from '@riftcounter/shared';

interface BuildCardProps {
  build: BuildRecommendation;
  isPrimary?: boolean;
}

export function BuildCard({ build, isPrimary = false }: BuildCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    type,
    items,
    boots,
    emblems,
    confidence,
    reasoning,
    swapsApplied,
    sources,
  } = build;

  const typeLabel =
    type === 'default'
      ? 'Core Build'
      : type === 'situational'
      ? 'Situational'
      : 'Counter Build';

  return (
    <div
      className={`card ${
        isPrimary ? 'border-primary-900 dark:border-primary-100' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`text-2xs font-medium px-2 py-0.5 ${
              isPrimary
                ? 'bg-primary-900 text-white dark:bg-primary-100 dark:text-primary-900'
                : 'bg-primary-100 dark:bg-primary-800'
            }`}
          >
            {typeLabel}
          </span>
          {isPrimary && (
            <span className="text-2xs text-primary-500">Recommended</span>
          )}
        </div>
        <div
          className={`text-sm font-medium ${
            confidence >= 75
              ? 'text-primary-900 dark:text-primary-100'
              : confidence >= 50
              ? 'text-primary-600 dark:text-primary-400'
              : 'text-primary-400'
          }`}
        >
          {confidence}%
        </div>
      </div>

      {/* Items */}
      <div className="mb-3">
        <div className="text-xs text-primary-500 mb-2">Items</div>
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="px-2 py-1 bg-primary-50 dark:bg-primary-800/50 text-sm font-medium"
              title={item}
            >
              {formatItemName(item)}
            </div>
          ))}
        </div>
      </div>

      {/* Boots */}
      <div className="mb-3">
        <div className="text-xs text-primary-500 mb-2">Boots</div>
        <div className="px-2 py-1 bg-primary-50 dark:bg-primary-800/50 text-sm font-medium inline-block">
          {formatItemName(boots)}
        </div>
      </div>

      {/* Reasoning */}
      <p className="text-xs text-primary-600 dark:text-primary-400 mb-3">
        {reasoning}
      </p>

      {/* Situational Swaps */}
      {swapsApplied.length > 0 && (
        <div className="mb-3 p-2 bg-primary-50 dark:bg-primary-800/50">
          <div className="text-xs font-medium mb-1">Applied Swaps:</div>
          {swapsApplied.map((swap, index) => (
            <div key={index} className="text-2xs text-primary-600 dark:text-primary-400">
              {formatItemName(swap.originalItem)} → {formatItemName(swap.swapItem)}
              <span className="text-primary-400 ml-1">({swap.reason})</span>
            </div>
          ))}
        </div>
      )}

      {/* Expand/Collapse */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="text-xs text-primary-500 hover:text-primary-900 dark:hover:text-primary-100 flex items-center gap-1"
      >
        {showDetails ? 'Hide' : 'Show'} details
        <svg
          className={`w-3 h-3 transition-transform ${
            showDetails ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-700 animate-slide-down">
          {/* Emblems */}
          <div className="mb-3">
            <div className="text-xs text-primary-500 mb-2">Emblems</div>
            <div className="text-sm">
              <div className="font-medium mb-1">
                Keystone: {formatEmblem(emblems.keystone)}
              </div>
              <div className="text-xs text-primary-600 dark:text-primary-400">
                Primary: {emblems.primary.map(formatEmblem).join(', ')}
              </div>
              <div className="text-xs text-primary-600 dark:text-primary-400">
                Secondary: {emblems.secondary.map(formatEmblem).join(', ')}
              </div>
            </div>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div>
              <div className="text-xs text-primary-500 mb-1">Sources</div>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, index) => (
                  <span
                    key={index}
                    className="text-2xs text-primary-400"
                    title={`Fetched: ${source.fetched}`}
                  >
                    {source.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatItemName(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatEmblem(id: string): string {
  return id
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
