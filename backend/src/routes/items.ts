/**
 * Items API Route
 */

import { Router, Request, Response, NextFunction } from 'express';
import { getAllItems, getItemById } from '../services/build';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/items
 * 
 * Get all items with optional filtering
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tag, search, page = '1', limit = '100' } = req.query;

    let items = getAllItems();

    // Filter by tag
    if (tag && typeof tag === 'string') {
      items = items.filter(item => item.tags.includes(tag as any));
    }

    // Search filter
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.id.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 100, 200);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedItems = items.slice(startIndex, startIndex + limitNum);

    res.json({
      data: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: items.length,
        totalPages: Math.ceil(items.length / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/items/:id
 * 
 * Get a specific item
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const item = getItemById(id.toLowerCase());

    if (!item) {
      throw new AppError(404, 'ITEM_NOT_FOUND', `Item not found: ${id}`);
    }

    res.json({ item });
  } catch (error) {
    next(error);
  }
});

export { router as itemRoutes };
