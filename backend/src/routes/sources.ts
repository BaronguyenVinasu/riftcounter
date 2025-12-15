/**
 * Sources API Route
 * 
 * Returns data source status and freshness information
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getSourcesStatus, getDataFreshness } from '../data/sources';

const router = Router();

/**
 * GET /api/sources
 * 
 * Get status of all data sources
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sources = getSourcesStatus();
    const freshness = getDataFreshness();

    res.json({
      sources,
      patchVersion: freshness.patchVersion,
      patchDate: freshness.patchDate,
      dataFreshness: freshness.dataFreshness,
      uncertaintyLevel: freshness.uncertainty,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sources/refresh
 * 
 * Trigger a manual data refresh (admin only in production)
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // In a real implementation, this would trigger the data ingestion
    // For now, just return success
    res.json({
      message: 'Refresh triggered',
      estimatedCompletionTime: '5-10 minutes',
    });
  } catch (error) {
    next(error);
  }
});

export { router as sourceRoutes };
