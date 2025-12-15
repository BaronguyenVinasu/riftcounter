/**
 * API request/response types for RiftCounter
 */

import { Champion, ChampionSummary, DataSource, Lane } from './champion';
import { Build, Item } from './item';
import { AnalysisResponse, MatchupScore } from './matchup';

// API Error response
export interface ApiError {
  error: string;
  code: string;
  details?: Record<string, unknown>;
}

// Pagination
export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// GET /api/champions
export interface GetChampionsRequest extends PaginatedRequest {
  role?: Lane;
  tag?: string;
  search?: string;
}

export interface GetChampionsResponse extends PaginatedResponse<ChampionSummary> {}

// GET /api/champion/:id
export interface GetChampionResponse {
  champion: Champion;
  sources: DataSource[];
}

// GET /api/champion/:id/builds
export interface GetChampionBuildsRequest {
  lane?: Lane;
  playstyle?: string;
}

export interface GetChampionBuildsResponse {
  championId: string;
  builds: Build[];
  sources: DataSource[];
  lastUpdated: string;
}

// POST /api/analyze
export interface PostAnalyzeRequest {
  enemies: string[];
  lane: string;
  yourChampion?: string;
  options?: {
    preferCounters?: boolean;
    playstyle?: 'aggressive' | 'farming' | 'roaming';
    maxCounters?: number;
    includeOffMeta?: boolean;
  };
}

export type PostAnalyzeResponse = AnalysisResponse;

// GET /api/items
export interface GetItemsRequest extends PaginatedRequest {
  tag?: string;
  search?: string;
}

export interface GetItemsResponse extends PaginatedResponse<Item> {}

// GET /api/matchups
export interface GetMatchupsRequest {
  championId?: string;
  lane?: Lane;
}

export interface GetMatchupsResponse {
  matchups: MatchupScore[];
  sources: DataSource[];
}

// GET /api/sources
export interface SourceStatus {
  name: string;
  url: string;
  status: 'healthy' | 'stale' | 'error';
  lastFetched: string;
  nextRefresh: string;
  reliability: number;
  itemCount: number;
}

export interface GetSourcesResponse {
  sources: SourceStatus[];
  patchVersion: string;
  patchDate: string;
  dataFreshness: 'fresh' | 'stale' | 'outdated';
  uncertaintyLevel: 'low' | 'medium' | 'high';
}

// Webhook for patch notifications
export interface PatchNotification {
  version: string;
  date: string;
  notes?: string;
}

// Rate limiting response header info
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
}
