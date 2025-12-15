/**
 * Build Aggregation Service
 * 
 * Aggregates builds from multiple sources and computes confidence scores
 */

import {
  Build,
  BuildRecommendation,
  SituationalSwap,
  SituationalTrigger,
  Champion,
  Lane,
  Item,
  DataSource,
} from '@riftcounter/shared';
import { config } from '../config';
import { buildsData } from '../data/builds';
import { itemsData } from '../data/items';
import { cacheGet, cacheSet, cacheKeys } from './cache';

/**
 * Get all builds for a champion
 */
export async function getChampionBuilds(
  championId: string,
  lane?: Lane
): Promise<Build[]> {
  const cacheKey = cacheKeys.championBuilds(championId);
  const cached = await cacheGet<Build[]>(cacheKey);
  
  if (cached) {
    return lane ? cached.filter(b => b.playstyle === 'aggressive' || true) : cached;
  }

  let builds = buildsData.filter(b => b.championId === championId);
  
  // Sort by confidence
  builds.sort((a, b) => b.confidence - a.confidence);
  
  await cacheSet(cacheKey, builds);
  return builds;
}

/**
 * Detect team composition threats
 */
export function detectThreats(enemyChampions: Champion[]): SituationalTrigger[] {
  const threats: SituationalTrigger[] = [];
  
  let totalPhysical = 0;
  let totalMagic = 0;
  let healerCount = 0;
  let ccCount = 0;
  let mobileCount = 0;
  let tankCount = 0;
  let burstCount = 0;
  let pokeCount = 0;
  let critCount = 0;

  for (const enemy of enemyChampions) {
    totalPhysical += enemy.damageProfile.physical;
    totalMagic += enemy.damageProfile.magic;
    
    if (enemy.sustainScore > 6) healerCount++;
    if (enemy.ccScore > 6) ccCount++;
    if (enemy.mobilityScore > 7) mobileCount++;
    if (enemy.tags.includes('tank')) tankCount++;
    if (enemy.burstScore > 7) burstCount++;
    if (enemy.rangeType === 'ranged' && enemy.tags.includes('mage')) pokeCount++;
    if (enemy.tags.includes('marksman')) critCount++;
  }

  if (totalPhysical / enemyChampions.length > 0.7) threats.push('heavyAD');
  if (totalMagic / enemyChampions.length > 0.6) threats.push('heavyAP');
  if (healerCount >= 2) threats.push('heavyHeal');
  if (ccCount >= 3) threats.push('heavyCC');
  if (mobileCount >= 2) threats.push('mobileThreat');
  if (tankCount >= 2) threats.push('tankHeavy');
  if (burstCount >= 2) threats.push('burstThreat');
  if (pokeCount >= 2) threats.push('pokeHeavy');
  if (critCount >= 2) threats.push('heavyCrit');

  return threats;
}

/**
 * Apply situational swaps to a build
 */
export function applySituationalSwaps(
  build: Build,
  threats: SituationalTrigger[]
): { items: string[]; swapsApplied: SituationalSwap[] } {
  const items = [...build.items];
  const swapsApplied: SituationalSwap[] = [];

  for (const swap of build.situationalSwaps) {
    if (threats.includes(swap.trigger)) {
      const idx = items.indexOf(swap.originalItem);
      if (idx !== -1) {
        items[idx] = swap.swapItem;
        swapsApplied.push(swap);
      }
    }
  }

  return { items, swapsApplied };
}

/**
 * Compute build confidence based on source agreement
 */
export function computeBuildConfidence(build: Build, threats: SituationalTrigger[]): number {
  let confidence = build.confidence;

  // Boost confidence if build has relevant situational items for detected threats
  const relevantSwaps = build.situationalSwaps.filter(s => threats.includes(s.trigger));
  confidence += relevantSwaps.length * 2;

  // Adjust based on meta weight
  confidence = confidence * (0.7 + build.metaWeight * 0.3);

  // Adjust based on source weights
  let sourceBoost = 0;
  for (const source of build.sources) {
    const weight = config.sourceWeights[source.name] || 0.5;
    sourceBoost += weight * 5;
  }
  confidence += sourceBoost / build.sources.length;

  return Math.min(95, Math.max(30, Math.round(confidence)));
}

/**
 * Generate build recommendations for a matchup
 */
export async function generateBuildRecommendations(
  championId: string,
  enemyChampions: Champion[],
  lane: Lane
): Promise<BuildRecommendation[]> {
  const builds = await getChampionBuilds(championId, lane);
  const threats = detectThreats(enemyChampions);
  
  const recommendations: BuildRecommendation[] = [];

  // Default build (highest confidence without situational)
  const defaultBuild = builds.find(b => b.type === 'default') || builds[0];
  if (defaultBuild) {
    recommendations.push({
      type: 'default',
      items: defaultBuild.items,
      boots: defaultBuild.boots,
      emblems: defaultBuild.emblems,
      confidence: computeBuildConfidence(defaultBuild, threats),
      reasoning: 'Standard build for consistent performance',
      sources: defaultBuild.sources,
      swapsApplied: [],
    });
  }

  // Situational build (apply swaps)
  if (threats.length > 0 && defaultBuild) {
    const { items, swapsApplied } = applySituationalSwaps(defaultBuild, threats);
    
    if (swapsApplied.length > 0) {
      const sitBuild = builds.find(b => b.type === 'situational') || defaultBuild;
      recommendations.push({
        type: 'situational',
        items,
        boots: determineBoots(threats, sitBuild.boots),
        emblems: sitBuild.emblems,
        confidence: computeBuildConfidence(sitBuild, threats) + 5,
        reasoning: `Adjusted for enemy team: ${threats.join(', ')}`,
        sources: sitBuild.sources,
        swapsApplied,
      });
    }
  }

  // Counter build (if specific enemy composition)
  const counterBuild = builds.find(b => b.type === 'situational');
  if (counterBuild && threats.length >= 2) {
    const { items, swapsApplied } = applySituationalSwaps(counterBuild, threats);
    
    recommendations.push({
      type: 'counter',
      items,
      boots: determineBoots(threats, counterBuild.boots),
      emblems: counterBuild.emblems,
      confidence: computeBuildConfidence(counterBuild, threats),
      reasoning: `Counter build specifically for this team composition`,
      sources: counterBuild.sources,
      swapsApplied,
    });
  }

  // Sort by confidence
  recommendations.sort((a, b) => b.confidence - a.confidence);

  return recommendations.slice(0, 3);
}

/**
 * Determine optimal boots based on threats
 */
function determineBoots(threats: SituationalTrigger[], defaultBoots: string): string {
  if (threats.includes('heavyCC')) return 'mercury-treads';
  if (threats.includes('heavyAD')) return 'plated-steelcaps';
  if (threats.includes('mobileThreat')) return 'boots-of-swiftness';
  return defaultBoots;
}

/**
 * Get item details
 */
export function getItemById(itemId: string): Item | null {
  return itemsData.find(i => i.id === itemId) || null;
}

/**
 * Get all items
 */
export function getAllItems(): Item[] {
  return itemsData;
}

/**
 * Format build for display
 */
export function formatBuildForDisplay(
  recommendation: BuildRecommendation
): {
  items: Array<{ id: string; name: string; iconUrl?: string }>;
  boots: { id: string; name: string; iconUrl?: string };
  reasoning: string;
} {
  const items = recommendation.items.map(itemId => {
    const item = getItemById(itemId);
    return {
      id: itemId,
      name: item?.name || itemId,
      iconUrl: item?.iconUrl,
    };
  });

  const boots = getItemById(recommendation.boots);

  return {
    items,
    boots: {
      id: recommendation.boots,
      name: boots?.name || recommendation.boots,
      iconUrl: boots?.iconUrl,
    },
    reasoning: recommendation.reasoning,
  };
}
