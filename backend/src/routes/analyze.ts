/**
 * Analyze API Route
 * 
 * Main analysis endpoint for matchup analysis
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
import { generateBuildRecommendations } from '../services/build';
import { cacheGet, cacheSet, cacheKeys } from '../services/cache';
import { AppError } from '../middleware/errorHandler';
import { getDataFreshness, getSourcesStatus } from '../data/sources';

const router = Router();

// Request validation schema
const analyzeSchema = z.object({
  enemies: z.array(z.string()).min(1).max(5),
  lane: z.string(),
  yourChampion: z.string().optional(),
  options: z.object({
    preferCounters: z.boolean().optional(),
    playstyle: z.enum(['aggressive', 'farming', 'roaming']).optional(),
    maxCounters: z.number().min(1).max(10).optional(),
    includeOffMeta: z.boolean().optional(),
  }).optional(),
});

/**
 * POST /api/analyze
 * 
 * Analyze enemy lineup and generate recommendations
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate input
    const validatedData = analyzeSchema.parse(req.body);
    const { enemies, lane, yourChampion, options } = validatedData;

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
      .update(JSON.stringify({ enemies: normalizedEnemies.map(e => e.normalized), lane: normalizedLane, yourChampion }))
      .digest('hex');
    
    // Check cache
    const cached = await cacheGet<AnalysisResponse>(cacheKeys.analysis(cacheHash));
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
    }

    // Get data freshness status
    const freshness = getDataFreshness();
    const sourcesStatus = getSourcesStatus();

    // Generate counters (if no champion selected or preferCounters)
    let counters: any[] = [];
    if (!yourChampion || options?.preferCounters) {
      const maxCounters = options?.maxCounters || 5;
      if (laneEnemy) {
        counters = await getCounterPicks(laneEnemy.id, normalizedLane, maxCounters);
      }
    }

    // Generate tactics and builds
    let tactics: any[] = [];
    let skillCombos: any[] = [];
    let powerSpikes: any[] = [];
    let abilityWarnings: any[] = [];
    let builds: any[] = [];

    if (yourChampion) {
      // User has selected a champion
      const normalizedYourChamp = normalizeChampionInputs([yourChampion])[0];
      if (!normalizedYourChamp.normalized) {
        throw new AppError(400, 'UNKNOWN_CHAMPION', `Could not identify your champion: ${yourChampion}`);
      }

      const yourChampionData = await getChampionById(normalizedYourChamp.normalized);
      if (yourChampionData && laneEnemyChamp) {
        // Compute matchup
        const metrics = computeMatchupMetrics(yourChampionData, laneEnemyChamp, normalizedLane);
        
        // Generate tactics
        tactics = generateTactics(yourChampionData, laneEnemyChamp, metrics);
        
        // Generate skill combos
        skillCombos = generateSkillCombos(yourChampionData);
        
        // Generate power spikes
        powerSpikes = generatePowerSpikes(yourChampionData, laneEnemyChamp);
        
        // Generate builds
        builds = await generateBuildRecommendations(
          yourChampionData.id,
          enemyChampions,
          normalizedLane
        );
      }
    } else if (counters.length > 0 && laneEnemyChamp) {
      // Use top counter for tactics/builds
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
    const response: AnalysisResponse = {
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
    };

    // Cache response
    await cacheSet(cacheKeys.analysis(cacheHash), response, 1800); // 30 min cache

    res.json(response);
  } catch (error) {
    next(error);
  }
});

function computeOverallConfidence(
  counters: any[],
  builds: any[],
  freshness: { uncertainty: string }
): number {
  let confidence = 70;

  // Adjust for counter confidence
  if (counters.length > 0) {
    const avgCounterConfidence = counters.reduce((sum, c) => sum + c.confidence, 0) / counters.length;
    confidence = (confidence + avgCounterConfidence) / 2;
  }

  // Adjust for build confidence
  if (builds.length > 0) {
    const avgBuildConfidence = builds.reduce((sum, b) => sum + b.confidence, 0) / builds.length;
    confidence = (confidence + avgBuildConfidence) / 2;
  }

  // Reduce confidence if data is stale
  if (freshness.uncertainty === 'high') {
    confidence *= 0.7;
  } else if (freshness.uncertainty === 'medium') {
    confidence *= 0.85;
  }

  return Math.round(Math.min(95, Math.max(30, confidence)));
}

export { router as analyzeRoutes };
