/**
 * Seed Adapter
 * 
 * Reads champion and item data from packages/data/seed/*.json
 * and imports into the database. Used as fallback when external
 * sources are unavailable.
 */

import * as fs from 'fs';
import * as path from 'path';
import { Champion, Item } from '../shared';

export interface SeedData {
  champions: Champion[];
  items: Item[];
  matchups: any[];
  builds: any[];
}

export interface AdapterResult {
  success: boolean;
  source: string;
  fetchedAt: string;
  count: number;
  errors?: string[];
}

export interface IngestionAdapter {
  name: string;
  priority: number;
  enabled: boolean;
  fetch(): Promise<AdapterResult>;
  checkRobotsTxt?(): Promise<boolean>;
}

/**
 * Seed Adapter - reads from local JSON files
 */
export class SeedAdapter implements IngestionAdapter {
  name = 'SeedAdapter';
  priority = 10; // Lowest priority - fallback only
  enabled = true;
  
  private seedPath: string;
  private data: SeedData | null = null;

  constructor(seedPath?: string) {
    // Default to packages/data/seed relative to backend
    this.seedPath = seedPath || path.resolve(__dirname, '../../../data/seed');
  }

  async fetch(): Promise<AdapterResult> {
    const errors: string[] = [];
    let totalCount = 0;

    try {
      // Load mid-champions.json
      const championsPath = path.join(this.seedPath, 'mid-champions.json');
      if (fs.existsSync(championsPath)) {
        const rawData = fs.readFileSync(championsPath, 'utf-8');
        const seedFile = JSON.parse(rawData);
        
        if (seedFile.champions && Array.isArray(seedFile.champions)) {
          this.data = {
            champions: seedFile.champions.map((c: any) => this.normalizeChampion(c)),
            items: [],
            matchups: [],
            builds: seedFile.champions.flatMap((c: any) => 
              (c.canonicalBuilds || []).map((b: any) => ({
                championId: c.id,
                ...b,
              }))
            ),
          };
          totalCount = this.data.champions.length;
          console.log(`[SeedAdapter] Loaded ${totalCount} champions from seed data`);
        }
      } else {
        errors.push(`Seed file not found: ${championsPath}`);
      }

      // Load items if available
      const itemsPath = path.join(this.seedPath, 'items.json');
      if (fs.existsSync(itemsPath) && this.data) {
        const rawItems = fs.readFileSync(itemsPath, 'utf-8');
        const itemsFile = JSON.parse(rawItems);
        if (itemsFile.items) {
          this.data.items = itemsFile.items;
          totalCount += this.data.items.length;
        }
      }

      return {
        success: errors.length === 0,
        source: 'seed',
        fetchedAt: new Date().toISOString(),
        count: totalCount,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('[SeedAdapter] Error loading seed data:', errorMsg);
      return {
        success: false,
        source: 'seed',
        fetchedAt: new Date().toISOString(),
        count: 0,
        errors: [errorMsg],
      };
    }
  }

  /**
   * Normalize champion data from seed format to internal format
   */
  private normalizeChampion(raw: any): Champion {
    const profiles = raw.baseProfiles || {};
    
    return {
      id: raw.id,
      name: raw.name,
      displayName: raw.displayName || raw.name,
      roles: raw.roles || ['mid'],
      tags: raw.tags || [],
      rangeType: raw.rangeType || 'ranged',
      damageProfile: raw.damageProfile || { physical: 0, magic: 100, trueDamage: 0 },
      baseStats: raw.baseStats || { health: 500, armor: 20, magicResist: 30 },
      mobilityScore: profiles.mobilityScore || 5,
      ccScore: profiles.ccScore || 5,
      burstScore: profiles.burstScore || 5,
      sustainScore: profiles.sustainScore || 5,
      waveclearScore: profiles.waveclearScore || 5,
      scaleScore: profiles.scaleScore || 5,
      roamScore: profiles.roamScore || 5,
      powerSpikes: raw.powerSpikes || [],
      abilities: raw.abilities,
      aliases: raw.aliases || [],
      lastUpdated: new Date().toISOString(),
      sources: [{ name: 'Seed Data', url: '', fetched: new Date().toISOString(), reliability: 70 }],
    };
  }

  /**
   * Get loaded champions
   */
  getChampions(): Champion[] {
    return this.data?.champions || [];
  }

  /**
   * Get loaded items
   */
  getItems(): Item[] {
    return this.data?.items || [];
  }

  /**
   * Get loaded builds
   */
  getBuilds(): any[] {
    return this.data?.builds || [];
  }
}

/**
 * Riot Adapter - stub for official Riot API data
 * TODO: Implement when API access is available
 */
export class RiotAdapter implements IngestionAdapter {
  name = 'RiotAdapter';
  priority = 1; // Highest priority
  enabled = false; // Disabled until API access is configured
  
  private apiKey: string | null = null;
  private baseUrl = 'https://ddragon.leagueoflegends.com/cdn';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.RIOT_API_KEY || null;
    this.enabled = !!this.apiKey;
  }

  async checkRobotsTxt(): Promise<boolean> {
    // Riot's official API is allowed
    return true;
  }

  async fetch(): Promise<AdapterResult> {
    if (!this.enabled) {
      return {
        success: false,
        source: 'riot',
        fetchedAt: new Date().toISOString(),
        count: 0,
        errors: ['RiotAdapter disabled - no API key configured'],
      };
    }

    // TODO: Implement actual Riot API fetching
    // For now, return stub result
    console.log('[RiotAdapter] TODO: Implement Riot API data fetching');
    
    return {
      success: false,
      source: 'riot',
      fetchedAt: new Date().toISOString(),
      count: 0,
      errors: ['RiotAdapter not yet implemented'],
    };
  }
}

/**
 * WildRiftFire Adapter - community site
 * DISABLED: robots.txt forbids scraping
 */
export class WildRiftFireAdapter implements IngestionAdapter {
  name = 'WildRiftFireAdapter';
  priority = 5;
  enabled = false; // Disabled due to robots.txt

  async checkRobotsTxt(): Promise<boolean> {
    // This site's robots.txt forbids scraping
    console.log('[WildRiftFireAdapter] Scraping forbidden by robots.txt');
    return false;
  }

  async fetch(): Promise<AdapterResult> {
    // Check robots.txt first
    const allowed = await this.checkRobotsTxt();
    if (!allowed) {
      return {
        success: false,
        source: 'wildriftfire',
        fetchedAt: new Date().toISOString(),
        count: 0,
        errors: ['Scraping forbidden by robots.txt - using seed data instead'],
      };
    }

    // Would implement scraping here if allowed
    return {
      success: false,
      source: 'wildriftfire',
      fetchedAt: new Date().toISOString(),
      count: 0,
      errors: ['Adapter disabled'],
    };
  }
}

/**
 * Ingestion Manager - coordinates multiple adapters
 */
export class IngestionManager {
  private adapters: IngestionAdapter[] = [];

  constructor() {
    // Register adapters in priority order
    this.adapters = [
      new RiotAdapter(),
      new WildRiftFireAdapter(),
      new SeedAdapter(),
    ];
  }

  /**
   * Run ingestion from all enabled adapters
   */
  async runIngestion(): Promise<Map<string, AdapterResult>> {
    const results = new Map<string, AdapterResult>();

    // Sort by priority (lower = higher priority)
    const sortedAdapters = [...this.adapters].sort((a, b) => a.priority - b.priority);

    for (const adapter of sortedAdapters) {
      if (!adapter.enabled) {
        console.log(`[IngestionManager] Skipping disabled adapter: ${adapter.name}`);
        continue;
      }

      console.log(`[IngestionManager] Running adapter: ${adapter.name}`);
      const result = await adapter.fetch();
      results.set(adapter.name, result);

      if (result.success && result.count > 0) {
        console.log(`[IngestionManager] ${adapter.name} succeeded with ${result.count} items`);
        // In production, we'd merge/update database here
      } else {
        console.log(`[IngestionManager] ${adapter.name} failed or returned no data`);
      }
    }

    return results;
  }

  /**
   * Get all adapters
   */
  getAdapters(): IngestionAdapter[] {
    return this.adapters;
  }

  /**
   * Get adapter by name
   */
  getAdapter(name: string): IngestionAdapter | undefined {
    return this.adapters.find(a => a.name === name);
  }
}

// Export singleton manager
export const ingestionManager = new IngestionManager();
