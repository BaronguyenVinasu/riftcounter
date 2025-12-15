/**
 * RiftCounter Backend Server
 * 
 * Main entry point for the Express API server
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import pino from 'pino';
import { config } from './config';
import { championRoutes } from './routes/champions';
import { analyzeRoutes } from './routes/analyze';
import { itemRoutes } from './routes/items';
import { sourceRoutes } from './routes/sources';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import { initializeCache } from './services/cache';
import { scheduleDataRefresh } from './data/scheduler';

const logger = pino({
  level: config.logLevel,
  transport: config.isDev ? { target: 'pino-pretty' } : undefined,
});

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(requestLogger(logger));

// Rate limiting for analyze endpoint
const analyzeRateLimit = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  message: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/champions', championRoutes);
app.use('/api/analyze', analyzeRateLimit, analyzeRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/sources', sourceRoutes);

// Error handling
app.use(errorHandler(logger));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', code: 'NOT_FOUND' });
});

// Start server
async function start() {
  try {
    // Initialize Redis cache
    await initializeCache();
    logger.info('Cache initialized');

    // Schedule data refresh
    if (config.enableScheduledRefresh) {
      scheduleDataRefresh(logger);
      logger.info('Data refresh scheduler started');
    }

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error(error, 'Failed to start server');
    process.exit(1);
  }
}

start();

export { app };
