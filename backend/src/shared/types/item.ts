/**
 * Item and build types for RiftCounter
 */

import { DataSource } from './champion';

// Item stat types
export type ItemStat = 
  | 'health'
  | 'mana'
  | 'armor'
  | 'magicResist'
  | 'attackDamage'
  | 'abilityPower'
  | 'attackSpeed'
  | 'critChance'
  | 'lifeSteal'
  | 'omnivamp'
  | 'abilityHaste'
  | 'moveSpeed'
  | 'lethality'
  | 'armorPen'
  | 'magicPen'
  | 'tenacity';

// Item tags for categorization
export type ItemTag =
  | 'armor'
  | 'magicResist'
  | 'health'
  | 'damage'
  | 'abilityPower'
  | 'attackSpeed'
  | 'critChance'
  | 'lifeSteal'
  | 'antiHeal'
  | 'tenacity'
  | 'boots'
  | 'starter'
  | 'mythic'
  | 'legendary';

// Situational triggers
export type SituationalTrigger =
  | 'heavyAD'
  | 'heavyAP'
  | 'heavyHeal'
  | 'heavyCC'
  | 'heavyCrit'
  | 'mobileThreat'
  | 'tankHeavy'
  | 'burstThreat'
  | 'pokeHeavy';

export interface Item {
  id: string;
  name: string;
  description: string;
  cost: number;
  stats: Partial<Record<ItemStat, number>>;
  tags: ItemTag[];
  passive?: string;
  active?: string;
  buildPath?: string[]; // Component item IDs
  buildsInto?: string[]; // Items this builds into
  situationalAgainst: SituationalTrigger[];
  iconUrl?: string;
}

// Emblem (Rune) types
export type EmblemPath = 
  | 'domination'
  | 'resolve'
  | 'inspiration'
  | 'precision';

export interface Emblem {
  id: string;
  name: string;
  path: EmblemPath;
  tier: 'keystone' | 'primary' | 'secondary';
  description: string;
  playstyleTag: 'aggressive' | 'defensive' | 'utility' | 'scaling';
}

export interface EmblemPage {
  keystone: string;
  primary: string[];
  secondary: string[];
}

// Build definition
export interface Build {
  id: string;
  championId: string;
  name: string;
  type: 'default' | 'situational' | 'off-meta';
  playstyle: 'aggressive' | 'farming' | 'roaming' | 'defensive';
  items: string[]; // Item IDs in order
  boots: string;
  emblems: EmblemPage;
  situationalSwaps: SituationalSwap[];
  skillOrder: string; // e.g., "Q > E > W" or "QEQWQRQEQE..."
  notes: string;
  confidence: number; // 0-100
  sources: DataSource[];
  metaWeight: number; // How meta this build is (0-1)
}

export interface SituationalSwap {
  originalItem: string;
  swapItem: string;
  trigger: SituationalTrigger;
  reason: string;
}

// Build recommendation response
export interface BuildRecommendation {
  type: 'default' | 'situational' | 'counter';
  items: string[];
  boots: string;
  emblems: EmblemPage;
  confidence: number;
  reasoning: string;
  sources: DataSource[];
  swapsApplied: SituationalSwap[];
}
