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
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use(requestLogger(logger));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// API routes
app.use('/api/champions', championRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/sources', sourceRoutes);

// Error handling
app.use(errorHandler);

// Start server
async function start() {
  try {
    // Initialize cache
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
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
