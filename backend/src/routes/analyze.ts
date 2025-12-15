/**
 * Enhanced Analyze API Route
 * 
 * Supports champion-scoped analysis with playerChampion parameter.
 * Maintains backward compatibility with existing API consumers.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import {
  AnalysisResponse,
  ChampionSummary,
} from '../shared';
import {
  normalizeChampionInputs,
  normalizeLane,
  getChampionById,
  getChampionsByIds,
} from '../services/champion';
import {
  computeMatchupMetrics,
  getCounterPicks,
  generateTactics,
  generatePowerSpikes,
  generateAbilityWarnings,
  generateSkillCombos,
} from '../services/matchup';
import {
  computeMatchupVector,
  generateSituationalSwaps,
  generateEnhancedTactics,
  generateDetailedCombos,
  calculateBuildConfidence,
  getRecencyWeight,
  MatchupVector,
  
  
  EnhancedTactic,
  DetailedSkillCombo,
} from '../services/championScopedMatchup';
import { SituationalSwap } from '../shared/types/item';
import { generateBuildRecommendations } from '../services/build';
import { cacheGet, cacheSet, cacheKeys } from '../services/cache';
import { AppError } from '../middleware/errorHandler';
import { getDataFreshness, getSourcesStatus } from '../data/sources';
import { getStaleStatus } from '../workers/patchWatcher';

const router = Router();

// Extended request validation schema with playerChampion
const analyzeSchema = z.object({
  enemies: z.array(z.string()).min(1).max(5),
  lane: z.string(),
  yourChampion: z.string().optional(),     // Legacy field
  playerChampion: z.string().optional(),   // New field (takes precedence)
  options: z.object({
    preferCounters: z.boolean().optional(),
    playstyle: z.enum(['aggressive', 'farming', 'roaming']).optional(),
    maxCounters: z.number().min(1).max(10).optional(),
    includeOffMeta: z.boolean().optional(),
  }).optional(),
});

// Extended response type for champion-scoped analysis
interface ChampionScopedResponse extends AnalysisResponse {
  playerChampion?: ChampionSummary;
  matchupVector?: MatchupVector;
  enhancedBuilds?: any[];
  enhancedTactics?: EnhancedTactic[];
  detailedCombos?: DetailedSkillCombo[];
  situationalSwaps?: SituationalSwap[];
  provenance?: {
    sources: Array<{ name: string; url: string; reliability: number }>;
    lastRefreshed: string;
  };
  stale?: boolean;
}

/**
 * POST /api/analyze
 * 
 * Analyze enemy lineup and generate recommendations.
 * When playerChampion is provided, returns champion-scoped analysis.
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = analyzeSchema.parse(req.body);
    const { enemies, lane, yourChampion, playerChampion: playerChampionInput, options } = validatedData;

    // playerChampion takes precedence over yourChampion (backward compatibility)
    const selectedChampion = playerChampionInput || yourChampion;

    // Normalize lane
    const normalizedLane = normalizeLane(lane);
    if (!normalizedLane) {
      throw new AppError(400, 'INVALID_LANE', `Invalid lane: ${lane}`);
    }

    // Normalize champion inputs
    const normalizedEnemies = normalizeChampionInputs(enemies);
    const failedNormalizations = normalizedEnemies.filter(e => !e.normalized);
    
    if (failedNormalizations.length > 0) {
      throw new AppError(400, 'UNKNOWN_CHAMPIONS', 
        `Could not identify champions: ${failedNormalizations.map(f => f.original).join(', ')}`);
    }

    // Create cache key from request
    const cacheHash = crypto
      .createHash('md5')
      .update(JSON.stringify({ 
        enemies: normalizedEnemies.map(e => e.normalized), 
        lane: normalizedLane, 
        playerChampion: selectedChampion 
      }))
      .digest('hex');
    
    // Check cache
    const cached = await cacheGet<ChampionScopedResponse>(cacheKeys.analysis(cacheHash));
    if (cached) {
      return res.json(cached);
    }

    // Get full champion data for enemies
    const enemyIds = normalizedEnemies.map(e => e.normalized!);
    const enemyChampions = getChampionsByIds(enemyIds);

    // Determine lane enemy (who is most likely in the selected lane)
    let laneEnemy: ChampionSummary | null = null;
    const laneEnemyChamp = enemyChampions.find(c => c.roles.includes(normalizedLane));
    if (laneEnemyChamp) {
      laneEnemy = {
        id: laneEnemyChamp.id,
        name: laneEnemyChamp.name,
        displayName: laneEnemyChamp.displayName,
        roles: laneEnemyChamp.roles,
        tags: laneEnemyChamp.tags,
      };
    } else if (enemyChampions.length > 0) {
      // Fallback: use highest threat from lineup
      const highestThreat = enemyChampions.reduce((max, c) => 
        (c.burstScore + c.ccScore) > (max.burstScore + max.ccScore) ? c : max
      );
      laneEnemy = {
        id: highestThreat.id,
        name: highestThreat.name,
        displayName: highestThreat.displayName,
        roles: highestThreat.roles,
        tags: highestThreat.tags,
      };
    }

    // Get data freshness and stale status
    const freshness = getDataFreshness();
    const sourcesStatus = getSourcesStatus();
    const staleStatus = getStaleStatus();

    // Generate counters (if no champion selected or preferCounters)
    let counters: any[] = [];
    if (!selectedChampion || options?.preferCounters) {
      const maxCounters = options?.maxCounters || 5;
      if (laneEnemy) {
        counters = await getCounterPicks(laneEnemy.id, normalizedLane, maxCounters);
      }
    }

    // Initialize response variables
    let tactics: any[] = [];
    let skillCombos: any[] = [];
    let powerSpikes: any[] = [];
    let abilityWarnings: any[] = [];
    let builds: any[] = [];
    
    // Champion-scoped analysis fields
    let playerChampionSummary: ChampionSummary | undefined;
    let matchupVector: MatchupVector | undefined;
    let enhancedBuilds: any[] | undefined;
    let enhancedTactics: EnhancedTactic[] | undefined;
    let detailedCombos: DetailedSkillCombo[] | undefined;
    let situationalSwaps: SituationalSwap[] | undefined;

    if (selectedChampion) {
      // User has selected a champion - provide champion-scoped analysis
      const normalizedPlayerChamp = normalizeChampionInputs([selectedChampion])[0];
      if (!normalizedPlayerChamp.normalized) {
        throw new AppError(400, 'UNKNOWN_CHAMPION', `Could not identify your champion: ${selectedChampion}`);
      }

      const playerChampionData = await getChampionById(normalizedPlayerChamp.normalized);
      if (playerChampionData && laneEnemyChamp) {
        // Set player champion summary
        playerChampionSummary = {
          id: playerChampionData.id,
          name: playerChampionData.name,
          displayName: playerChampionData.displayName,
          roles: playerChampionData.roles,
          tags: playerChampionData.tags,
        };

        // Compute matchup vector
        matchupVector = computeMatchupVector(playerChampionData, laneEnemyChamp);

        // Generate enhanced tactics with stage breakdown
        enhancedTactics = generateEnhancedTactics(playerChampionData, laneEnemyChamp, matchupVector);
        tactics = enhancedTactics;

        // Generate detailed skill combos
        detailedCombos = generateDetailedCombos(playerChampionData, laneEnemyChamp);
        skillCombos = detailedCombos;

        // Generate power spikes
        powerSpikes = generatePowerSpikes(playerChampionData, laneEnemyChamp);

        // Generate base builds
        const baseBuilds = await generateBuildRecommendations(
          playerChampionData.id,
          enemyChampions,
          normalizedLane
        );

        // Generate situational swaps based on enemy team
        const firstBuildItems = baseBuilds[0]?.items || [];
        situationalSwaps = generateSituationalSwaps(playerChampionData, enemyChampions, firstBuildItems);

        // Enhance builds with confidence and swaps
        enhancedBuilds = baseBuilds.map((build, index) => {
          const recency = getRecencyWeight(new Date(Date.now()));
          const sourceAgreement = build.sources?.length > 1 ? 0.8 : 0.6;
          const avgReliability = sourcesStatus.reduce((sum, s) => sum + s.reliability, 0) / 
            Math.max(sourcesStatus.length, 1) / 100;

          return {
            ...build,
            situationalSwaps: index === 0 ? situationalSwaps! : [],
            confidence: calculateBuildConfidence(sourceAgreement, recency, avgReliability),
            sources: build.sources?.map((s: any) => s.name) || ['RiftCounter Analysis'],
            reasoning: generateBuildReasoning(build, matchupVector!),
          };
        });
        builds = enhancedBuilds;
      }
    } else if (counters.length > 0 && laneEnemyChamp) {
      // No champion selected - use top counter for tactics/builds
      const topCounter = await getChampionById(counters[0].champion.id);
      if (topCounter) {
        const metrics = computeMatchupMetrics(topCounter, laneEnemyChamp, normalizedLane);
        tactics = generateTactics(topCounter, laneEnemyChamp, metrics);
        skillCombos = generateSkillCombos(topCounter);
        powerSpikes = generatePowerSpikes(topCounter, laneEnemyChamp);
        builds = await generateBuildRecommendations(
          topCounter.id,
          enemyChampions,
          normalizedLane
        );
      }
    }

    // Generate ability warnings for all enemies
    for (const enemy of enemyChampions) {
      abilityWarnings.push(...generateAbilityWarnings(enemy));
    }

    // Compute overall confidence
    const confidence = computeOverallConfidence(counters, builds, freshness);

    // Build response
    const response: ChampionScopedResponse = {
      normalizedEnemies: normalizedEnemies.map(e => e.champion!),
      lane: normalizedLane,
      laneEnemy,
      counters,
      tactics,
      builds,
      skillCombos,
      powerSpikes,
      abilityWarnings,
      confidence,
      uncertainty: freshness.uncertainty as 'low' | 'medium' | 'high',
      uncertaintyReason: freshness.uncertaintyReason,
      sources: sourcesStatus.map(s => ({
        name: s.name,
        url: s.url,
        fetched: s.lastFetched,
        reliability: s.reliability,
      })),
      lastRefreshed: new Date().toISOString(),
      patchVersion: freshness.patchVersion,
      // Champion-scoped fields (only present when playerChampion provided)
      ...(playerChampionSummary && { playerChampion: playerChampionSummary }),
      ...(matchupVector && { matchupVector }),
      ...(enhancedBuilds && { enhancedBuilds }),
      ...(enhancedTactics && { enhancedTactics }),
      ...(detailedCombos && { detailedCombos }),
      ...(situationalSwaps && { situationalSwaps }),
      ...(selectedChampion && {
        provenance: {
          sources: sourcesStatus.map(s => ({ name: s.name, url: s.url, reliability: s.reliability })),
          lastRefreshed: new Date().toISOString(),
        },
      }),
      stale: staleStatus.stale,
    };

    // Cache response
    await cacheSet(cacheKeys.analysis(cacheHash), response, 1800); // 30 min cache

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * Generate reasoning for a build based on matchup
 */
function generateBuildReasoning(build: any, vector: MatchupVector): string {
  const reasons: string[] = [];

  if (vector.laneDominance > 20) {
    reasons.push('You have lane advantage - this build maximizes early pressure.');
  } else if (vector.laneDominance < -20) {
    reasons.push('Enemy has lane pressure - this build provides safety and scaling.');
  }

  if (vector.allInPotential > 60) {
    reasons.push('High all-in potential - burst items prioritized.');
  }

  if (vector.pokeAdvantage > 30) {
    reasons.push('Poke advantage - includes mana sustain for extended harass.');
  }

  if (reasons.length === 0) {
    reasons.push('Standard build path optimized for this matchup.');
  }

  return reasons.join(' ');
}

function computeOverallConfidence(
  counters: any[],
  builds: any[],
  freshness: { uncertainty: string }
): number {
  let confidence = 70;

  if (counters.length > 0) {
    const avgCounterConfidence = counters.reduce((sum, c) => sum + c.confidence, 0) / counters.length;
    confidence = (confidence + avgCounterConfidence) / 2;
  }

  if (builds.length > 0) {
    const avgBuildConfidence = builds.reduce((sum, b) => sum + (b.confidence || 70), 0) / builds.length;
    confidence = (confidence + avgBuildConfidence) / 2;
  }

  if (freshness.uncertainty === 'high') {
    confidence *= 0.7;
  } else if (freshness.uncertainty === 'medium') {
    confidence *= 0.85;
  }

  return Math.round(Math.min(95, Math.max(30, confidence)));
}

export { router as analyzeRoutes };
