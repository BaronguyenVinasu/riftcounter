/**
 * Redis cache service
 */

import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;

export async function initializeCache(): Promise<void> {
  if (!config.cacheEnabled) {
    console.log('Cache disabled');
    return;
  }

  try {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    await redis.connect();
    console.log('Redis connected');
  } catch (error) {
    console.error('Redis connection failed, continuing without cache:', error);
    redis = null;
  }
}

export function getRedis(): Redis | null {
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = config.cacheTtlSeconds
): Promise<void> {
  if (!redis) return;

  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function cacheDeletePattern(pattern: string): Promise<void> {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
}

// Cache key generators
export const cacheKeys = {
  champion: (id: string) => `champion:${id}`,
  champions: () => 'champions:all',
  championBuilds: (id: string) => `champion:${id}:builds`,
  items: () => 'items:all',
  matchup: (challenger: string, opponent: string, lane: string) => 
    `matchup:${challenger}:${opponent}:${lane}`,
  analysis: (hash: string) => `analysis:${hash}`,
  sources: () => 'sources:status',
};
