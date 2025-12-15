/**
 * Data Sources Management
 * 
 * Track data freshness and source status
 */

import { config } from '../config';

interface SourceStatusInternal {
  name: string;
  url: string;
  status: 'healthy' | 'stale' | 'error';
  lastFetched: string;
  nextRefresh: string;
  reliability: number;
  itemCount: number;
}

interface DataFreshnessInternal {
  patchVersion: string;
  patchDate: string;
  dataFreshness: 'fresh' | 'stale' | 'outdated';
  uncertainty: 'low' | 'medium' | 'high';
  uncertaintyReason?: string;
}

// Simulated source status (in production, this would come from the database)
const sourcesStatus: SourceStatusInternal[] = [
  {
    name: 'WildRiftFire',
    url: 'https://wildriftfire.com',
    status: 'healthy',
    lastFetched: new Date().toISOString(),
    nextRefresh: new Date(Date.now() + config.refreshIntervalHours * 60 * 60 * 1000).toISOString(),
    reliability: 85,
    itemCount: 150,
  },
  {
    name: 'WR-META',
    url: 'https://wr-meta.com',
    status: 'healthy',
    lastFetched: new Date().toISOString(),
    nextRefresh: new Date(Date.now() + config.refreshIntervalHours * 60 * 60 * 1000).toISOString(),
    reliability: 80,
    itemCount: 120,
  },
  {
    name: 'WildRiftGuides',
    url: 'https://wildriftguides.gg',
    status: 'healthy',
    lastFetched: new Date().toISOString(),
    nextRefresh: new Date(Date.now() + config.refreshIntervalHours * 60 * 60 * 1000).toISOString(),
    reliability: 75,
    itemCount: 100,
  },
];

// Current patch information
let currentPatch = {
  version: '5.4',
  date: '2025-12-01',
  lastChecked: new Date().toISOString(),
};

/**
 * Get status of all data sources
 */
export function getSourcesStatus(): SourceStatusInternal[] {
  return sourcesStatus;
}

/**
 * Get data freshness information
 */
export function getDataFreshness(): DataFreshnessInternal {
  const now = new Date();
  const oldestFetch = sourcesStatus.reduce((oldest, source) => {
    const fetchDate = new Date(source.lastFetched);
    return fetchDate < oldest ? fetchDate : oldest;
  }, now);

  const hoursSinceOldest = (now.getTime() - oldestFetch.getTime()) / (1000 * 60 * 60);
  
  let dataFreshness: 'fresh' | 'stale' | 'outdated';
  let uncertainty: 'low' | 'medium' | 'high';
  let uncertaintyReason: string | undefined;

  if (hoursSinceOldest < 24) {
    dataFreshness = 'fresh';
    uncertainty = 'low';
  } else if (hoursSinceOldest < 72) {
    dataFreshness = 'stale';
    uncertainty = 'medium';
    uncertaintyReason = 'Data is more than 24 hours old';
  } else {
    dataFreshness = 'outdated';
    uncertainty = 'high';
    uncertaintyReason = 'Data is more than 72 hours old - recommendations may be inaccurate';
  }

  // Check if any sources have errors
  const errorSources = sourcesStatus.filter(s => s.status === 'error');
  if (errorSources.length > 0) {
    uncertainty = 'medium';
    uncertaintyReason = `Some data sources unavailable: ${errorSources.map(s => s.name).join(', ')}`;
  }

  return {
    patchVersion: currentPatch.version,
    patchDate: currentPatch.date,
    dataFreshness,
    uncertainty,
    uncertaintyReason,
  };
}

/**
 * Update source status
 */
export function updateSourceStatus(
  sourceName: string,
  status: 'healthy' | 'stale' | 'error',
  itemCount?: number
): void {
  const source = sourcesStatus.find(s => s.name === sourceName);
  if (source) {
    source.status = status;
    source.lastFetched = new Date().toISOString();
    source.nextRefresh = new Date(Date.now() + config.refreshIntervalHours * 60 * 60 * 1000).toISOString();
    if (itemCount !== undefined) {
      source.itemCount = itemCount;
    }
  }
}

/**
 * Update patch information
 */
export function updatePatchInfo(version: string, date: string): void {
  currentPatch = {
    version,
    date,
    lastChecked: new Date().toISOString(),
  };
}

/**
 * Mark all data as stale (e.g., after patch detection)
 */
export function markAllStale(): void {
  for (const source of sourcesStatus) {
    source.status = 'stale';
  }
}
