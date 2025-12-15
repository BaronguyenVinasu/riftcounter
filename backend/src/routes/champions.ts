/**
 * Champions API Route
 */

import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  getAllChampions,
  getChampionById,
  searchChampions,
  getChampionsByRole,
  normalizeLane,
} from '../services/champion';
import { getChampionBuilds } from '../services/build';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/champions
 * 
 * Get all champions with optional filtering
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search, page = '1', limit = '100' } = req.query;

    let champions = await getAllChampions();

    // Filter by role
    if (role && typeof role === 'string') {
      const normalizedRole = normalizeLane(role);
      if (normalizedRole) {
        champions = getChampionsByRole(normalizedRole);
      }
    }

    // Search filter
    if (search && typeof search === 'string') {
      champions = searchChampions(search, 50);
    }

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 100, 200);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedChampions = champions.slice(startIndex, startIndex + limitNum);

    res.json({
      data: paginatedChampions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: champions.length,
        totalPages: Math.ceil(champions.length / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/champions/search
 * 
 * Fuzzy search for champions
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q, limit = '10' } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError(400, 'MISSING_QUERY', 'Query parameter "q" is required');
    }

    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 20);
    const results = searchChampions(q, limitNum);

    res.json({ data: results });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/champions/:id
 * 
 * Get detailed champion information
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const champion = await getChampionById(id.toLowerCase());

    if (!champion) {
      throw new AppError(404, 'CHAMPION_NOT_FOUND', `Champion not found: ${id}`);
    }

    res.json({ champion, sources: champion.sources });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/champions/:id/builds
 * 
 * Get builds for a champion
 */
router.get('/:id/builds', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { lane } = req.query;

    const champion = await getChampionById(id.toLowerCase());
    if (!champion) {
      throw new AppError(404, 'CHAMPION_NOT_FOUND', `Champion not found: ${id}`);
    }

    let normalizedLane = undefined;
    if (lane && typeof lane === 'string') {
      normalizedLane = normalizeLane(lane) || undefined;
    }

    const builds = await getChampionBuilds(id.toLowerCase(), normalizedLane);

    res.json({
      championId: id.toLowerCase(),
      builds,
      sources: builds.flatMap(b => b.sources),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export { router as championRoutes };
