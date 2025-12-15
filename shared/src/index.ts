/**
 * RiftCounter Shared Types
 * 
 * Central export for all shared type definitions
 */

export * from './types/champion';
export * from './types/item';
export * from './types/matchup';
export * from './types/api';

// Re-export common constants
export const LANES = ['baron', 'mid', 'jungle', 'adc', 'support'] as const;

export const CHAMPION_ROLES = [
  'assassin',
  'fighter', 
  'mage',
  'marksman',
  'support',
  'tank'
] as const;

export const PLAYSTYLES = ['aggressive', 'farming', 'roaming', 'defensive'] as const;

// Utility type helpers
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;
