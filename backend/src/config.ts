/**
 * Application configuration
 * 
 * Loads from environment variables with sensible defaults
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/riftcounter',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  cacheEnabled: process.env.CACHE_ENABLED !== 'false',
  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '3600', 10),

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],

  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  // Data refresh
  enableScheduledRefresh: process.env.ENABLE_SCHEDULED_REFRESH !== 'false',
  refreshIntervalHours: parseInt(process.env.REFRESH_INTERVAL_HOURS || '24', 10),
  refreshCronSchedule: process.env.REFRESH_CRON_SCHEDULE || '0 4 * * *', // 4 AM daily

  // Source weights (higher = more trusted)
  sourceWeights: JSON.parse(process.env.SOURCE_WEIGHTS || JSON.stringify({
    'WildRiftFire': 1.0,
    'WR-META': 0.9,
    'WildRiftGuides': 0.8,
    'Community': 0.6,
  })),

  // Patch detection
  patchCheckUrl: process.env.PATCH_CHECK_URL || 'https://wildrift.leagueoflegends.com/en-us/news/',
  
  // Feature flags
  features: {
    fuzzySearch: process.env.FEATURE_FUZZY_SEARCH !== 'false',
    counterPicks: process.env.FEATURE_COUNTER_PICKS !== 'false',
    buildAggregation: process.env.FEATURE_BUILD_AGGREGATION !== 'false',
  },
} as const;

// Validate required config
function validateConfig() {
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }
}

validateConfig();
