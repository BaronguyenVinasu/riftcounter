/**
 * Matchup Analysis Engine
 * 
 * Computes matchup scores and generates tactical advice
 */

import {
  Champion,
  ChampionSummary,
  Lane,
  MatchupMetrics,
  MatchupFactors,
  CounterPick,
  Tactic,
  TacticStep,
  PowerSpikeEntry,
  AbilityWarning,
  SkillCombo,
} from '@riftcounter/shared';
import { getChampionById, getChampionsByRole } from './champion';
import { matchupsData } from '../data/matchups';

/**
 * Compute matchup factors between two champions
 */
function computeMatchupFactors(challenger: Champion, opponent: Champion): MatchupFactors {
  // Range advantage: ranged vs melee gets bonus
  let rangeAdvantage = 0;
  if (challenger.rangeType === 'ranged' && opponent.rangeType === 'melee') {
    rangeAdvantage = 20;
  } else if (challenger.rangeType === 'melee' && opponent.rangeType === 'ranged') {
    rangeAdvantage = -15;
  }

  // Mobility comparison
  const mobilityDiff = (challenger.mobilityScore - opponent.mobilityScore) * 5;

  // CC comparison
  const ccComparison = (challenger.ccScore - opponent.ccScore) * 4;

  // Burst vs sustain
  const burstVsSustain = 
    (challenger.burstScore * 3 - opponent.sustainScore * 2) - 
    (opponent.burstScore * 3 - challenger.sustainScore * 2);

  // Waveclear
  const waveclearDiff = (challenger.waveclearScore - opponent.waveclearScore) * 3;

  // Scaling
  const scalingDiff = (challenger.scaleScore - opponent.scaleScore) * 4;

  // Damage type mismatch (physical damage vs magic resist, etc.)
  const damageTypeMismatch = computeDamageTypeMismatch(challenger, opponent);

  return {
    rangeAdvantage,
    mobilityDiff,
    ccComparison,
    burstVsSustain,
    waveclearDiff,
    scalingDiff,
    damageTypeMismatch,
  };
}

function computeDamageTypeMismatch(challenger: Champion, opponent: Champion): number {
  // If challenger deals mostly physical and opponent has low armor
  const physicalAdvantage = challenger.damageProfile.physical * 
    (100 - opponent.baseStats.armor) / 100 * 10;
  
  // If challenger deals mostly magic and opponent has low MR
  const magicAdvantage = challenger.damageProfile.magic * 
    (100 - opponent.baseStats.magicResist) / 100 * 10;

  return physicalAdvantage + magicAdvantage;
}

/**
 * Compute full matchup metrics
 */
export function computeMatchupMetrics(
  challenger: Champion,
  opponent: Champion,
  lane: Lane
): MatchupMetrics {
  const factors = computeMatchupFactors(challenger, opponent);

  // Check for stored matchup data first
  const storedMatchup = matchupsData.find(
    m => m.challengerId === challenger.id && 
         m.opponentId === opponent.id && 
         m.lane === lane
  );

  if (storedMatchup) {
    // Blend stored data with computed factors
    return {
      ...storedMatchup.metrics,
      // Apply some adjustment from computed factors
      laneDominance: storedMatchup.metrics.laneDominance + factors.rangeAdvantage * 0.3,
    };
  }

  // Compute from factors
  const laneDominance = Math.max(-100, Math.min(100,
    factors.rangeAdvantage +
    factors.mobilityDiff * 0.5 +
    factors.ccComparison * 0.5 +
    factors.burstVsSustain * 0.3
  ));

  const killPotential = Math.max(0, Math.min(100,
    50 +
    challenger.burstScore * 3 +
    challenger.ccScore * 2 -
    opponent.mobilityScore * 2 -
    opponent.sustainScore
  ));

  const pokeAdvantage = Math.max(-100, Math.min(100,
    factors.rangeAdvantage +
    (challenger.rangeType === 'ranged' ? 20 : 0) -
    (opponent.rangeType === 'ranged' ? 20 : 0)
  ));

  const waveclearDiff = Math.max(-100, Math.min(100, factors.waveclearDiff * 3));

  const roamAdvantage = Math.max(-100, Math.min(100,
    (challenger.mobilityScore - opponent.mobilityScore) * 5 +
    challenger.roamScore * 3 -
    opponent.roamScore * 3
  ));

  const objectiveControl = Math.max(0, Math.min(100,
    50 + challenger.burstScore * 2 + challenger.sustainScore
  ));

  const scaleComparison = Math.max(-100, Math.min(100, factors.scalingDiff * 3));

  const gankVulnerability = Math.max(0, Math.min(100,
    50 -
    challenger.mobilityScore * 3 -
    challenger.ccScore * 2 +
    (challenger.rangeType === 'melee' ? 10 : 0)
  ));

  return {
    laneDominance,
    killPotential,
    pokeAdvantage,
    waveclearDiff,
    roamAdvantage,
    objectiveControl,
    scaleComparison,
    gankVulnerability,
  };
}

/**
 * Get counter picks for a champion in a specific lane
 */
export async function getCounterPicks(
  opponentId: string,
  lane: Lane,
  limit: number = 5
): Promise<CounterPick[]> {
  const opponent = await getChampionById(opponentId);
  if (!opponent) return [];

  const laneCandidates = getChampionsByRole(lane);
  const counters: Array<{ champion: ChampionSummary; score: number; metrics: MatchupMetrics }> = [];

  for (const candidate of laneCandidates) {
    if (candidate.id === opponentId) continue;

    const fullChampion = await getChampionById(candidate.id);
    if (!fullChampion) continue;

    const metrics = computeMatchupMetrics(fullChampion, opponent, lane);
    const score = 
      metrics.laneDominance * 0.35 +
      metrics.killPotential * 0.25 +
      metrics.pokeAdvantage * 0.15 +
      Math.abs(metrics.scaleComparison) * 0.15 +
      (100 - metrics.gankVulnerability) * 0.1;

    counters.push({ champion: candidate, score, metrics });
  }

  // Sort by score descending
  counters.sort((a, b) => b.score - a.score);

  return counters.slice(0, limit).map(c => ({
    champion: c.champion,
    reason: generateCounterReason(c.champion, opponent, c.metrics),
    confidence: Math.min(95, Math.max(40, Math.round(50 + c.score * 0.3))),
    matchupMetrics: c.metrics,
    difficulty: c.score > 70 ? 'easy' : c.score > 50 ? 'medium' : 'hard',
    sources: [{ name: 'RiftCounter Analysis', url: '', fetched: new Date().toISOString(), reliability: 75 }],
  }));
}

function generateCounterReason(
  counter: ChampionSummary,
  opponent: Champion,
  metrics: MatchupMetrics
): string {
  const reasons: string[] = [];

  if (metrics.laneDominance > 30) {
    reasons.push('strong lane presence');
  }
  if (metrics.killPotential > 60) {
    reasons.push('high kill potential');
  }
  if (metrics.pokeAdvantage > 20) {
    reasons.push('effective poke');
  }
  if (metrics.scaleComparison > 30) {
    reasons.push('outscales in late game');
  }
  if (metrics.waveclearDiff > 30) {
    reasons.push('superior waveclear');
  }

  if (reasons.length === 0) {
    reasons.push('favorable matchup overall');
  }

  return `${counter.displayName || counter.name} has ${reasons.slice(0, 2).join(' and ')} against ${opponent.displayName || opponent.name}`;
}

/**
 * Generate lane tactics based on matchup
 */
export function generateTactics(
  challenger: Champion,
  opponent: Champion,
  metrics: MatchupMetrics
): Tactic[] {
  const tactics: Tactic[] = [];

  // Early lane tactic
  const earlySteps: TacticStep[] = [];

  if (metrics.laneDominance > 20) {
    earlySteps.push({
      action: 'Trade aggressively at levels 1-2',
      timing: 'Levels 1-2',
    });
    earlySteps.push({
      action: 'Push for level 2 first to establish pressure',
    });
  } else if (metrics.laneDominance < -20) {
    earlySteps.push({
      action: 'Play safe and farm from range if possible',
      timing: 'Levels 1-3',
    });
    earlySteps.push({
      action: 'Avoid extended trades',
    });
  }

  if (metrics.pokeAdvantage > 20) {
    earlySteps.push({
      action: 'Use abilities to poke before engaging',
    });
  }

  if (metrics.gankVulnerability > 60) {
    earlySteps.push({
      action: 'Ward river by 2:30 - high gank vulnerability',
      timing: '2:30',
    });
  }

  if (earlySteps.length > 0) {
    tactics.push({
      id: 'early-lane',
      title: 'Early Lane (Levels 1-5)',
      phase: 'early',
      steps: earlySteps,
      reasoning: metrics.laneDominance > 0 
        ? 'You have lane advantage - press it early'
        : 'Enemy has early pressure - survive to scale',
      priority: 5,
      sources: [],
    });
  }

  // Mid game tactic
  const midSteps: TacticStep[] = [];

  if (metrics.roamAdvantage > 20) {
    midSteps.push({
      action: 'Look for roam opportunities after pushing wave',
      timing: 'After first item',
    });
  }

  if (metrics.objectiveControl > 60) {
    midSteps.push({
      action: 'Contest dragon/herald when your jungler is nearby',
    });
  }

  if (metrics.scaleComparison > 30) {
    midSteps.push({
      action: 'Focus on farming - you outscale',
    });
  } else if (metrics.scaleComparison < -30) {
    midSteps.push({
      action: 'Force plays before enemy scales',
    });
  }

  if (midSteps.length > 0) {
    tactics.push({
      id: 'mid-game',
      title: 'Mid Game (Levels 6-10)',
      phase: 'mid',
      steps: midSteps,
      reasoning: 'Transition strategy based on power curves',
      priority: 4,
      sources: [],
    });
  }

  // Teamfight tactic
  const teamfightSteps: TacticStep[] = [];

  if (challenger.ccScore > 6) {
    teamfightSteps.push({
      action: 'Look for key CC on priority targets',
    });
  }

  if (challenger.burstScore > 7) {
    teamfightSteps.push({
      action: 'Flank or wait for enemy to use key abilities before engaging',
    });
  }

  if (opponent.burstScore > 7) {
    teamfightSteps.push({
      action: `Watch for ${opponent.displayName}'s burst combo - don't get caught`,
    });
  }

  if (teamfightSteps.length > 0) {
    tactics.push({
      id: 'teamfight',
      title: 'Teamfighting',
      phase: 'teamfight',
      steps: teamfightSteps,
      reasoning: 'Maximize your champion\'s strengths in fights',
      priority: 3,
      sources: [],
    });
  }

  return tactics;
}

/**
 * Generate power spike timeline
 */
export function generatePowerSpikes(
  challenger: Champion,
  opponent: Champion
): PowerSpikeEntry[] {
  const spikes: PowerSpikeEntry[] = [];

  // Add challenger spikes
  for (const spike of challenger.powerSpikes || []) {
    spikes.push({
      time: spike.type === 'level' ? `Level ${spike.value}` : String(spike.value),
      type: spike.type,
      champion: 'you',
      description: spike.notes,
      advantage: spike.power > 0.7 ? 'you' : 'neutral',
    });
  }

  // Add opponent spikes
  for (const spike of opponent.powerSpikes || []) {
    spikes.push({
      time: spike.type === 'level' ? `Level ${spike.value}` : String(spike.value),
      type: spike.type,
      champion: 'enemy',
      description: `${opponent.displayName}: ${spike.notes}`,
      advantage: spike.power > 0.7 ? 'enemy' : 'neutral',
    });
  }

  // Sort by type priority: level < item < time
  const typePriority: Record<string, number> = { level: 1, item: 2, time: 3 };
  spikes.sort((a, b) => {
    const aPriority = typePriority[a.type] || 99;
    const bPriority = typePriority[b.type] || 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    
    // Within same type, sort by value
    if (a.type === 'level' && b.type === 'level') {
      const aLevel = parseInt(a.time.replace('Level ', ''));
      const bLevel = parseInt(b.time.replace('Level ', ''));
      return aLevel - bLevel;
    }
    return 0;
  });

  return spikes;
}

/**
 * Generate ability warnings for enemy
 */
export function generateAbilityWarnings(opponent: Champion): AbilityWarning[] {
  const warnings: AbilityWarning[] = [];

  // Add warnings for high-impact abilities
  if (opponent.abilities?.ultimate) {
    warnings.push({
      championId: opponent.id,
      ability: 'Ultimate',
      warning: opponent.abilities.ultimate.description,
      counterplay: 'Track cooldown and play safe when available',
    });
  }

  // Add CC warnings
  if (opponent.ccScore > 6) {
    warnings.push({
      championId: opponent.id,
      ability: 'CC Abilities',
      warning: `${opponent.displayName} has strong CC - avoid getting caught`,
      counterplay: 'Position carefully and consider Mercury Treads or QSS',
    });
  }

  return warnings;
}

/**
 * Generate skill combo tips
 */
export function generateSkillCombos(champion: Champion): SkillCombo[] {
  // This would typically come from stored data
  // For now, generate basic combos based on champion type
  const combos: SkillCombo[] = [];

  if (champion.tags.includes('assassin')) {
    combos.push({
      name: 'Burst Combo',
      sequence: 'Gap closer > CC > Full rotation',
      description: 'Standard burst assassination combo',
      timing: 'When enemy is isolated',
      difficulty: 'medium',
      damage: 'lethal',
    });
  }

  if (champion.tags.includes('mage')) {
    combos.push({
      name: 'Poke Pattern',
      sequence: 'Long range ability > Auto attack if safe',
      description: 'Safe poke to whittle enemy down',
      timing: 'When abilities are available',
      difficulty: 'easy',
      damage: 'medium',
    });
  }

  if (champion.tags.includes('fighter')) {
    combos.push({
      name: 'Extended Trade',
      sequence: 'Engage > Full rotation > Auto weave > Disengage',
      description: 'Win extended trades with ability weaving',
      timing: 'When enemy key ability is down',
      difficulty: 'medium',
      damage: 'high',
    });
  }

  return combos;
}
