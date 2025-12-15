/**
 * Patch Watcher Worker
 * 
 * Monitors for new game patches and marks data as stale when detected.
 * Configurable via config/default.json
 */

import { EventEmitter } from 'events';

export interface PatchWatcherConfig {
  patchFeedUrl: string;
  pollIntervalMs: number;
  enabled: boolean;
}

export interface PatchInfo {
  patchId: string;
  version: string;
  releasedAt: string;
  notes?: string;
}

export interface StaleStatus {
  stale: boolean;
  lastPatch: string;
  lastChecked: string;
  reason?: string;
}

class PatchWatcher extends EventEmitter {
  private config: PatchWatcherConfig;
  private lastPatch: string | null = null;
  private staleStatus: StaleStatus;
  private pollInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(config: PatchWatcherConfig) {
    super();
    this.config = config;
    this.staleStatus = {
      stale: false,
      lastPatch: '',
      lastChecked: new Date().toISOString(),
    };
  }

  /**
   * Start the patch watcher
   */
  start(): void {
    if (this.isRunning) {
      console.log('[PatchWatcher] Already running');
      return;
    }

    if (!this.config.enabled) {
      console.log('[PatchWatcher] Disabled in config');
      return;
    }

    this.isRunning = true;
    console.log(`[PatchWatcher] Starting with poll interval ${this.config.pollIntervalMs}ms`);
    
    // Initial check
    this.checkForNewPatch();

    // Set up polling interval
    this.pollInterval = setInterval(
      () => this.checkForNewPatch(),
      this.config.pollIntervalMs
    );
  }

  /**
   * Stop the patch watcher
   */
  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isRunning = false;
    console.log('[PatchWatcher] Stopped');
  }

  /**
   * Check for new patch
   */
  async checkForNewPatch(): Promise<void> {
    try {
      const patchInfo = await this.fetchPatchInfo();
      
      this.staleStatus.lastChecked = new Date().toISOString();

      if (this.lastPatch && patchInfo.patchId !== this.lastPatch) {
        console.log(`[PatchWatcher] New patch detected: ${patchInfo.version}`);
        this.markStale(patchInfo);
        this.emit('newPatch', patchInfo);
      } else if (!this.lastPatch) {
        console.log(`[PatchWatcher] Initial patch: ${patchInfo.version}`);
        this.lastPatch = patchInfo.patchId;
        this.staleStatus.lastPatch = patchInfo.version;
      }
    } catch (error) {
      console.error('[PatchWatcher] Error checking for patch:', error);
      // Don't mark stale on fetch errors - could be temporary
    }
  }

  /**
   * Fetch patch info from configured URL
   */
  private async fetchPatchInfo(): Promise<PatchInfo> {
    // In production, this would fetch from the configured URL
    // For now, return simulated data that can be overridden in tests
    
    if (this.config.patchFeedUrl.startsWith('mock://')) {
      // Mock mode for testing
      return this.getMockPatchInfo();
    }

    try {
      const response = await fetch(this.config.patchFeedUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return this.normalizePatchData(data);
    } catch (error) {
      // Fallback to mock if fetch fails
      console.warn('[PatchWatcher] Using mock data due to fetch error');
      return this.getMockPatchInfo();
    }
  }

  /**
   * Normalize patch data from various sources
   */
  private normalizePatchData(data: any): PatchInfo {
    // Handle different API formats
    if (data.patchId) {
      return data as PatchInfo;
    }
    
    // Riot-style format
    if (data.version) {
      return {
        patchId: data.version,
        version: data.version,
        releasedAt: data.timestamp || new Date().toISOString(),
        notes: data.notes,
      };
    }

    // Generic format
    return {
      patchId: data.id || 'unknown',
      version: data.version || data.id || 'unknown',
      releasedAt: data.date || new Date().toISOString(),
      notes: data.description,
    };
  }

  /**
   * Get mock patch info for testing
   */
  private getMockPatchInfo(): PatchInfo {
    return {
      patchId: '5.4.0',
      version: '5.4',
      releasedAt: new Date().toISOString(),
      notes: 'Mock patch data',
    };
  }

  /**
   * Mark all data as stale
   */
  private markStale(newPatch: PatchInfo): void {
    this.lastPatch = newPatch.patchId;
    this.staleStatus = {
      stale: true,
      lastPatch: newPatch.version,
      lastChecked: new Date().toISOString(),
      reason: `New patch ${newPatch.version} detected`,
    };

    // Emit event for other services to handle
    this.emit('staleData', this.staleStatus);

    // Enqueue ingestion jobs
    this.enqueueIngestionJobs(newPatch);
  }

  /**
   * Enqueue jobs to refresh data
   */
  private enqueueIngestionJobs(patch: PatchInfo): void {
    console.log(`[PatchWatcher] Enqueueing ingestion jobs for patch ${patch.version}`);
    
    // In production, this would add jobs to a queue (Bull, BullMQ, etc.)
    // For now, emit events that can be handled by ingestion service
    this.emit('refreshChampions', patch);
    this.emit('refreshItems', patch);
    this.emit('refreshMatchups', patch);
  }

  /**
   * Mark data as fresh (after successful ingestion)
   */
  markFresh(): void {
    this.staleStatus.stale = false;
    this.staleStatus.reason = undefined;
    console.log('[PatchWatcher] Data marked as fresh');
    this.emit('dataFresh', this.staleStatus);
  }

  /**
   * Get current stale status
   */
  getStaleStatus(): StaleStatus {
    return { ...this.staleStatus };
  }

  /**
   * Get last known patch
   */
  getLastPatch(): string | null {
    return this.lastPatch;
  }

  /**
   * Simulate new patch (for testing)
   */
  simulateNewPatch(version: string): void {
    const mockPatch: PatchInfo = {
      patchId: version,
      version,
      releasedAt: new Date().toISOString(),
      notes: 'Simulated patch for testing',
    };
    this.markStale(mockPatch);
  }
}

// Singleton instance
let patchWatcherInstance: PatchWatcher | null = null;

export function initializePatchWatcher(config: PatchWatcherConfig): PatchWatcher {
  if (patchWatcherInstance) {
    patchWatcherInstance.stop();
  }
  patchWatcherInstance = new PatchWatcher(config);
  return patchWatcherInstance;
}

export function getPatchWatcher(): PatchWatcher | null {
  return patchWatcherInstance;
}

export function getStaleStatus(): StaleStatus {
  if (patchWatcherInstance) {
    return patchWatcherInstance.getStaleStatus();
  }
  return {
    stale: false,
    lastPatch: 'unknown',
    lastChecked: new Date().toISOString(),
  };
}

export default PatchWatcher;
