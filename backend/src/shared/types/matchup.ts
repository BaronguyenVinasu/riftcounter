/**
 * Matchup analysis and tactics types for RiftCounter
 */

import { Champion, ChampionSummary, DataSource, Lane } from './champion';
import { BuildRecommendation } from './item';

// Matchup score metrics
export interface MatchupMetrics {
  laneDominance: number;      // -100 to 100 (negative = enemy favored)
  killPotential: number;      // 0-100
  pokeAdvantage: number;      // -100 to 100
  waveclearDiff: number;      // -100 to 100
  roamAdvantage: number;      // -100 to 100
  objectiveControl: number;   // 0-100
  scaleComparison: number;    // -100 to 100 (positive = you scale better)
  gankVulnerability: number;  // 0-100 (higher = more vulnerable)
}

// Stored matchup data
export interface MatchupScore {
  id: string;
  challengerId: string;
  opponentId: string;
  lane: Lane;
  metrics: MatchupMetrics;
  notes: string[];
  sources: DataSource[];
  confidence: number;
  lastUpdated: string;
}

// Counter pick suggestion
export interface CounterPick {
  champion: ChampionSummary;
  reason: string;
  confidence: number;
  winrateEst?: number;
  matchupMetrics: Partial<MatchupMetrics>;
  difficulty: 'easy' | 'medium' | 'hard';
  sources: DataSource[];
}

// Tactical advice
export interface TacticStep {
  action: string;
  timing?: string;
  condition?: string;
}

export interface Tactic {
  id: string;
  title: string;
  phase: 'early' | 'mid' | 'late' | 'teamfight';
  steps: TacticStep[];
  reasoning: string;
  priority: number; // 1-5, higher = more important
  sources: DataSource[];
}

// Skill combo information
export interface SkillCombo {
  name: string;
  sequence: string; // e.g., "E > AA > Q > AA > W"
  description: string;
  timing: string;
  difficulty: 'easy' | 'medium' | 'hard';
  damage: 'low' | 'medium' | 'high' | 'lethal';
}

// Power spike timeline entry
export interface PowerSpikeEntry {
  time: string; // "Level 2", "First item", "12 minutes"
  type: 'level' | 'item' | 'time';
  champion: 'you' | 'enemy' | 'both';
  description: string;
  advantage: 'you' | 'enemy' | 'neutral';
}

// Complete analysis response
export interface AnalysisRequest {
  enemies: string[];
  lane: string;
  yourChampion?: string; // Optional: if user has already picked
  options?: AnalysisOptions;
}

export interface AnalysisOptions {
  preferCounters?: boolean;
  playstyle?: 'aggressive' | 'farming' | 'roaming';
  maxCounters?: number;
  includeOffMeta?: boolean;
}

export interface AnalysisResponse {
  // Input confirmation
  normalizedEnemies: ChampionSummary[];
  lane: Lane;
  laneEnemy: ChampionSummary | null;
  
  // Counter picks (if no champion selected)
  counters: CounterPick[];
  
  // Lane tactics
  tactics: Tactic[];
  
  // Build recommendations
  builds: BuildRecommendation[];
  
  // Skill combos and tips
  skillCombos: SkillCombo[];
  
  // Power spike timeline
  powerSpikes: PowerSpikeEntry[];
  
  // Enemy ability warnings
  abilityWarnings: AbilityWarning[];
  
  // Meta information
  confidence: number;
  uncertainty: 'low' | 'medium' | 'high';
  uncertaintyReason?: string;
  sources: DataSource[];
  lastRefreshed: string;
  patchVersion?: string;
}

export interface AbilityWarning {
  championId: string;
  ability: string;
  warning: string;
  counterplay: string;
}

// Matchup matrix computation
export interface MatchupComputeInput {
  challenger: Champion;
  opponent: Champion;
  lane: Lane;
  teamContext?: {
    allyChampions?: Champion[];
    enemyChampions?: Champion[];
  };
}

// Rule-based matchup factors
export interface MatchupFactors {
  rangeAdvantage: number;
  mobilityDiff: number;
  ccComparison: number;
  burstVsSustain: number;
  waveclearDiff: number;
  scalingDiff: number;
  damageTypeMismatch: number; // How well your damage type counters their resistances
}
