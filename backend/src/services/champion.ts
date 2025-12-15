/**
 * Champion service
 * 
 * Handles champion data access and fuzzy search
 */

import Fuse from 'fuse.js';
import { Champion, ChampionSummary, Lane, LANE_ALIASES } from '@riftcounter/shared';
import { cacheGet, cacheSet, cacheKeys } from './cache';
import { championsData } from '../data/champions';

// Fuse.js configuration for fuzzy search
const fuseOptions: Fuse.IFuseOptions<ChampionSummary> = {
  keys: [
    { name: 'name', weight: 0.4 },
    { name: 'displayName', weight: 0.3 },
    { name: 'id', weight: 0.2 },
  ],
  threshold: 0.4, // Lower = stricter matching
  includeScore: true,
  minMatchCharLength: 2,
};

let championFuse: Fuse<ChampionSummary> | null = null;

function getChampionFuse(): Fuse<ChampionSummary> {
  if (!championFuse) {
    const summaries = getChampionSummaries();
    championFuse = new Fuse(summaries, fuseOptions);
  }
  return championFuse;
}

export function getChampionSummaries(): ChampionSummary[] {
  return championsData.map(c => ({
    id: c.id,
    name: c.name,
    displayName: c.displayName,
    roles: c.roles,
    tags: c.tags,
    iconUrl: c.iconUrl,
  }));
}

export async function getAllChampions(): Promise<ChampionSummary[]> {
  const cached = await cacheGet<ChampionSummary[]>(cacheKeys.champions());
  if (cached) return cached;

  const champions = getChampionSummaries();
  await cacheSet(cacheKeys.champions(), champions);
  return champions;
}

export async function getChampionById(id: string): Promise<Champion | null> {
  const cached = await cacheGet<Champion>(cacheKeys.champion(id));
  if (cached) return cached;

  const champion = championsData.find(c => c.id === id.toLowerCase());
  if (champion) {
    await cacheSet(cacheKeys.champion(id), champion);
  }
  return champion || null;
}

/**
 * Normalize a champion name input to a champion ID
 * Handles aliases, partial matches, and fuzzy matching
 */
export function normalizeChampionInput(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  
  const cleaned = input.toLowerCase().trim();
  
  // Direct ID match
  const direct = championsData.find(c => c.id === cleaned);
  if (direct) return direct.id;

  // Name match
  const byName = championsData.find(
    c => c.name.toLowerCase() === cleaned || c.displayName.toLowerCase() === cleaned
  );
  if (byName) return byName.id;

  // Alias match
  const byAlias = championsData.find(c => 
    c.aliases?.some(a => a.toLowerCase() === cleaned)
  );
  if (byAlias) return byAlias.id;

  // Fuzzy search
  const fuse = getChampionFuse();
  const results = fuse.search(cleaned);
  
  if (results.length > 0 && results[0].score !== undefined && results[0].score < 0.3) {
    return results[0].item.id;
  }

  return null;
}

/**
 * Normalize multiple champion inputs
 */
export function normalizeChampionInputs(inputs: string[]): Array<{
  original: string;
  normalized: string | null;
  champion: ChampionSummary | null;
}> {
  return inputs.map(input => {
    const normalized = normalizeChampionInput(input);
    const champion = normalized 
      ? getChampionSummaries().find(c => c.id === normalized) || null
      : null;
    
    return { original: input, normalized, champion };
  });
}

/**
 * Normalize lane input
 */
export function normalizeLane(input: string): Lane | null {
  const cleaned = input.toLowerCase().trim();
  return LANE_ALIASES[cleaned] || null;
}

/**
 * Search champions with fuzzy matching
 */
export function searchChampions(query: string, limit: number = 10): ChampionSummary[] {
  if (!query || query.length < 2) {
    return getChampionSummaries().slice(0, limit);
  }

  const fuse = getChampionFuse();
  const results = fuse.search(query, { limit });
  return results.map(r => r.item);
}

/**
 * Get champions by role
 */
export function getChampionsByRole(role: Lane): ChampionSummary[] {
  return getChampionSummaries().filter(c => c.roles.includes(role));
}

/**
 * Get full champion data for multiple IDs
 */
export function getChampionsByIds(ids: string[]): Champion[] {
  return ids
    .map(id => championsData.find(c => c.id === id))
    .filter((c): c is Champion => c !== undefined);
}
