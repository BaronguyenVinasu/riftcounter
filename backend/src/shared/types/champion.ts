/**
 * Champion and game data types for RiftCounter
 */

// Lane types
export type Lane = 'baron' | 'mid' | 'jungle' | 'adc' | 'support';

export const LANE_ALIASES: Record<string, Lane> = {
  top: 'baron',
  baron: 'baron',
  solo: 'baron',
  mid: 'mid',
  middle: 'mid',
  jungle: 'jungle',
  jg: 'jungle',
  adc: 'adc',
  bot: 'adc',
  carry: 'adc',
  marksman: 'adc',
  support: 'support',
  sup: 'support',
  supp: 'support',
};

// Champion role tags
export type ChampionRole = 
  | 'assassin'
  | 'fighter'
  | 'mage'
  | 'marksman'
  | 'support'
  | 'tank';

// Damage profile
export interface DamageProfile {
  physical: number; // 0-1
  magic: number;    // 0-1
  true_damage: number; // 0-1
}

// Power spike definition
export interface PowerSpike {
  type: 'level' | 'item' | 'time';
  value: number | string; // Level number, item name, or game time
  power: number; // 0-1 strength rating
  notes: string;
}

// Data source reference
export interface DataSource {
  name: string;
  url: string;
  fetched: string; // ISO timestamp
  reliability: number; // 0-100
}

// Champion definition
export interface Champion {
  id: string;
  name: string;
  displayName: string;
  aliases: string[];
  roles: Lane[];
  tags: ChampionRole[];
  rangeType: 'melee' | 'ranged';
  baseStats: {
    health: number;
    mana: number;
    armor: number;
    magicResist: number;
    attackDamage: number;
    attackSpeed: number;
    moveSpeed: number;
  };
  // Scoring metrics (0-10)
  mobilityScore: number;
  ccScore: number;
  burstScore: number;
  sustainScore: number;
  waveclearScore: number;
  roamScore: number;
  scaleScore: number; // Late game scaling
  damageProfile: DamageProfile;
  powerSpikes: PowerSpike[];
  abilities: {
    passive: AbilityInfo;
    q: AbilityInfo;
    w: AbilityInfo;
    e: AbilityInfo;
    ultimate: AbilityInfo;
  };
  sources: DataSource[];
  lastUpdated: string;
}

export interface AbilityInfo {
  name: string;
  description: string;
  cooldown: number[];
  damage?: string;
  notes?: string;
}

// Simplified champion for list views
export interface ChampionSummary {
  id: string;
  name: string;
  displayName: string;
  roles: Lane[];
  tags: ChampionRole[];
  iconUrl?: string;
}

// Champion alias mapping for fuzzy search
export interface ChampionAlias {
  championId: string;
  alias: string;
  priority: number; // Higher = better match
}
