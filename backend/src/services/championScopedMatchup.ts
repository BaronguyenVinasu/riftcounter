/**
 * Enhanced Matchup Analysis Engine
 * 
 * Champion-scoped analysis with matchup vectors and tactical breakdowns
 */

import {
  Champion,
  Lane,
  Tactic,
  TacticStep,
  PowerSpikeEntry,
  SkillCombo,
} from '../shared';
import { SituationalSwap, SituationalTrigger } from '../shared/types/item';

/**
 * Matchup Vector - detailed comparison between two champions
 */
export interface MatchupVector {
  laneDominance: number;
  allInPotential: number;
  pokeAdvantage: number;
  mobilityDiff: number;
  ccDiff: number;
  sustainDiff: number;
  waveclearDiff: number;
  scalingDiff: number;
}

/**
 * Enhanced tactic with stage info
 */
export interface EnhancedTactic extends Tactic {
  stage: 'early' | 'mid' | 'late';
  confidence: number;
}

/**
 * Detailed skill combo
 */
export interface DetailedSkillCombo {
  name: string;
  sequence: string;
  notes: string;
  timing?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  damage: 'low' | 'medium' | 'high' | 'lethal';
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Compute matchup vector between player champion and lane enemy
 */
export function computeMatchupVector(
  player: Champion,
  enemy: Champion
): MatchupVector {
  const rangeBonus = player.rangeType === 'ranged' && enemy.rangeType === 'melee' ? 25 : 
                     player.rangeType === 'melee' && enemy.rangeType === 'ranged' ? -20 : 0;
  
  const laneDominance = clamp(
    rangeBonus +
    (player.burstScore - enemy.burstScore) * 5 +
    (player.waveclearScore - enemy.waveclearScore) * 3 +
    (player.sustainScore - enemy.sustainScore) * 4,
    -100, 100
  );

  const allInPotential = clamp(
    50 +
    player.burstScore * 4 +
    player.ccScore * 3 -
    enemy.mobilityScore * 3 -
    enemy.sustainScore * 2,
    0, 100
  );

  const pokeAdvantage = clamp(
    rangeBonus * 1.5 +
    (player.rangeType === 'ranged' ? 15 : -10) +
    player.waveclearScore * 2 -
    enemy.sustainScore * 3,
    -100, 100
  );

  const mobilityDiff = clamp((player.mobilityScore - enemy.mobilityScore) * 12, -100, 100);
  const ccDiff = clamp((player.ccScore - enemy.ccScore) * 12, -100, 100);
  const sustainDiff = clamp((player.sustainScore - enemy.sustainScore) * 12, -100, 100);
  const waveclearDiff = clamp((player.waveclearScore - enemy.waveclearScore) * 12, -100, 100);
  const scalingDiff = clamp((player.scaleScore - enemy.scaleScore) * 12, -100, 100);

  return {
    laneDominance,
    allInPotential,
    pokeAdvantage,
    mobilityDiff,
    ccDiff,
    sustainDiff,
    waveclearDiff,
    scalingDiff,
  };
}

/**
 * Generate situational item swaps based on enemy team composition
 */
export function generateSituationalSwaps(
  player: Champion,
  enemies: Champion[],
  baseBuild: string[]
): SituationalSwap[] {
  const swaps: SituationalSwap[] = [];

  const totalPhysical = enemies.reduce((sum, e) => sum + e.damageProfile.physical, 0);
  const totalMagic = enemies.reduce((sum, e) => sum + e.damageProfile.magic, 0);
  const totalDamage = totalPhysical + totalMagic;
  
  const adShare = totalDamage > 0 ? (totalPhysical / totalDamage) * 100 : 50;
  const apShare = totalDamage > 0 ? (totalMagic / totalDamage) * 100 : 50;

  if (adShare >= 60) {
    swaps.push({
      originalItem: baseBuild[baseBuild.length - 1] || 'Last slot',
      swapItem: player.damageProfile.magic > 50 ? "Zhonya's Hourglass" : 'Plated Steelcaps',
      trigger: 'heavyAD' as SituationalTrigger,
      reason: `Enemy team is ${Math.round(adShare)}% AD - build armor early`,
    });
  }

  if (apShare >= 60) {
    swaps.push({
      originalItem: baseBuild[baseBuild.length - 1] || 'Last slot',
      swapItem: player.damageProfile.magic > 50 ? "Banshee's Veil" : 'Mercury Treads',
      trigger: 'heavyAP' as SituationalTrigger,
      reason: `Enemy team is ${Math.round(apShare)}% AP - build magic resist`,
    });
  }

  const assassins = enemies.filter(e => e.tags.includes('assassin') && e.mobilityScore >= 7);
  if (assassins.length >= 1) {
    swaps.push({
      originalItem: baseBuild[baseBuild.length - 1] || 'Last slot',
      swapItem: player.damageProfile.magic > 50 ? "Zhonya's Hourglass" : 'Guardian Angel',
      trigger: 'mobileThreat' as SituationalTrigger,
      reason: `${assassins[0].displayName} is a mobile assassin - build defensive`,
    });
  }

  const healers = enemies.filter(e => e.sustainScore >= 7);
  if (healers.length >= 1) {
    swaps.push({
      originalItem: baseBuild[baseBuild.length - 1] || 'Last slot',
      swapItem: player.damageProfile.magic > 50 ? 'Morellonomicon' : 'Mortal Reminder',
      trigger: 'heavyHeal' as SituationalTrigger,
      reason: `${healers[0].displayName} has high sustain - build anti-heal`,
    });
  }

  return swaps;
}

/**
 * Generate enhanced tactics with stage breakdown
 */
export function generateEnhancedTactics(
  player: Champion,
  enemy: Champion,
  vector: MatchupVector
): EnhancedTactic[] {
  const tactics: EnhancedTactic[] = [];

  // Early game
  const earlySteps: TacticStep[] = [];
  let earlyReasoning = '';
  
  if (vector.laneDominance > 20) {
    earlySteps.push({ action: 'Trade aggressively at level 1-2', timing: 'First wave' });
    earlySteps.push({ action: 'Push for level 2 advantage', timing: 'Second wave' });
    earlyReasoning = 'You have lane dominance - press early advantage.';
  } else if (vector.laneDominance < -20) {
    earlySteps.push({ action: 'Focus on safe farming', timing: 'Levels 1-3' });
    earlySteps.push({ action: 'Stay near tower if pushed', timing: 'Early game' });
    earlyReasoning = 'Enemy has early pressure - survive and scale.';
  } else {
    earlySteps.push({ action: 'Trade when abilities available' });
    earlySteps.push({ action: 'Match enemy push' });
    earlyReasoning = 'Even matchup - farm well and trade efficiently.';
  }

  tactics.push({
    id: 'early-game',
    title: 'Early Game (Levels 1-5)',
    phase: 'early',
    stage: 'early',
    steps: earlySteps,
    reasoning: earlyReasoning,
    priority: 5,
    sources: [],
    confidence: 75,
  });

  // Mid game
  const midSteps: TacticStep[] = [];
  let midReasoning = '';

  if (vector.scalingDiff < -20) {
    midSteps.push({ action: 'Force fights - you need to end early', timing: 'After first item' });
    midSteps.push({ action: 'Roam to snowball leads' });
    midReasoning = 'Enemy outscales - force early objectives.';
  } else if (vector.scalingDiff > 20) {
    midSteps.push({ action: 'Farm safely, avoid risky plays' });
    midSteps.push({ action: 'Group for objectives when ready', timing: 'After second item' });
    midReasoning = 'You outscale - focus on consistent farming.';
  } else {
    midSteps.push({ action: 'Look for roam opportunities' });
    midSteps.push({ action: 'Contest objectives with team' });
    midReasoning = 'Similar scaling - gain advantages through macro.';
  }

  tactics.push({
    id: 'mid-game',
    title: 'Mid Game (Levels 6-10)',
    phase: 'mid',
    stage: 'mid',
    steps: midSteps,
    reasoning: midReasoning,
    priority: 4,
    sources: [],
    confidence: 72,
  });

  // Late game
  const lateSteps: TacticStep[] = [];
  let lateReasoning = '';

  if (player.tags.includes('assassin')) {
    lateSteps.push({ action: 'Look for picks on isolated enemies' });
    lateSteps.push({ action: 'Flank in teamfights' });
    lateReasoning = 'As assassin, eliminate priority targets.';
  } else if (player.tags.includes('mage')) {
    lateSteps.push({ action: 'Stay in backline, deal consistent damage' });
    lateSteps.push({ action: 'Use abilities to zone from objectives' });
    lateReasoning = 'As mage, maximize damage while staying safe.';
  } else {
    lateSteps.push({ action: 'Group with team for objectives' });
    lateSteps.push({ action: 'Play around key cooldowns' });
    lateReasoning = 'Focus on your teamfight role.';
  }

  tactics.push({
    id: 'late-game',
    title: 'Late Game (Levels 11+)',
    phase: 'teamfight',
    stage: 'late',
    steps: lateSteps,
    reasoning: lateReasoning,
    priority: 3,
    sources: [],
    confidence: 68,
  });

  return tactics;
}

/**
 * Generate detailed skill combos for champion
 */
export function generateDetailedCombos(
  player: Champion,
  enemy: Champion
): DetailedSkillCombo[] {
  const combos: DetailedSkillCombo[] = [];

  // Champion-specific combos
  const championCombos: Record<string, DetailedSkillCombo[]> = {
    ahri: [
      { name: 'Charm Combo', sequence: 'E → Q → W → R → Auto → R', notes: 'Land charm first for guaranteed Q', timing: 'When charm available', difficulty: 'medium', damage: 'lethal' },
      { name: 'Safe Poke', sequence: 'Q through minions → Auto', notes: 'Q return deals true damage', timing: 'When enemy CSing', difficulty: 'easy', damage: 'medium' },
    ],
    yasuo: [
      { name: 'Beyblade', sequence: 'E → Q3 → R', notes: 'EQ during dash for instant knockup', timing: 'When Q3 stacked', difficulty: 'hard', damage: 'lethal' },
      { name: 'Basic Trade', sequence: 'E → Q → Auto → E out', notes: 'Use minions for mobility', timing: 'When enemy uses ability', difficulty: 'medium', damage: 'medium' },
    ],
    fizz: [
      { name: 'Full Burst', sequence: 'R → Q → Auto → W → E', notes: 'Wait for shark knockup', timing: 'When ult lands', difficulty: 'medium', damage: 'lethal' },
      { name: 'Quick Trade', sequence: 'Q → Auto → W → E out', notes: 'E for escape', timing: 'When enemy on cooldown', difficulty: 'easy', damage: 'high' },
    ],
    katarina: [
      { name: 'Full Combo', sequence: 'Q → E to dagger → W → E to W dagger → R', notes: 'Maximize dagger pickups', timing: 'When enemy isolated', difficulty: 'hard', damage: 'lethal' },
    ],
    zed: [
      { name: 'Basic Combo', sequence: 'W → E → Q', notes: 'Shadow placement is key', timing: 'From range', difficulty: 'medium', damage: 'high' },
    ],
  };

  if (championCombos[player.id]) {
    combos.push(...championCombos[player.id]);
  }

  // Generic combos if none specific
  if (combos.length === 0) {
    if (player.tags.includes('assassin')) {
      combos.push({ name: 'Burst Pattern', sequence: 'Gap close → CC → Full rotation → Escape', notes: 'Standard assassination', timing: 'Target isolated', difficulty: 'medium', damage: 'lethal' });
    }
    if (player.tags.includes('mage')) {
      combos.push({ name: 'Poke Pattern', sequence: 'Long range ability → Auto if safe', notes: 'Whittle down before all-in', timing: 'Abilities available', difficulty: 'easy', damage: 'medium' });
    }
  }

  return combos;
}

/**
 * Calculate build confidence
 */
export function calculateBuildConfidence(
  sourceAgreement: number,
  recencyWeight: number,
  sourceWeightAvg: number
): number {
  const confidence = Math.round(40 * sourceAgreement + 30 * recencyWeight + 30 * sourceWeightAvg);
  return clamp(confidence, 0, 100);
}

/**
 * Get recency weight based on data age
 */
export function getRecencyWeight(lastUpdated: Date): number {
  const ageInDays = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays < 7) return 1.0;
  if (ageInDays < 14) return 0.9;
  if (ageInDays < 30) return 0.7;
  if (ageInDays < 60) return 0.5;
  return 0.3;
}
