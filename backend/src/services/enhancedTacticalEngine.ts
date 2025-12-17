/**
 * Enhanced Tactical Engine
 * 
 * Generates specific, actionable tactics based on:
 * - Ability cooldowns and windows
 * - Conditional game states
 * - Matchup-specific micro tips
 */

import { Champion } from '../shared';
import { MatchupVector } from './championScopedMatchup';

/**
 * Ability window tactic - exploits enemy cooldowns
 */
export interface AbilityWindowTactic {
  trigger: string;
  window: string;
  action: string;
  risk: 'low' | 'medium' | 'high';
  phase: 'early' | 'mid' | 'late' | 'all';
}

/**
 * Conditional tactic - game state dependent
 */
export interface ConditionalTactic {
  condition: string;
  action: string;
  priority: 'must' | 'should' | 'consider';
  phase: 'early' | 'mid' | 'late' | 'all';
  icon?: 'warning' | 'info' | 'tip';
}

/**
 * Micro tip - quick actionable advice
 */
export interface MicroTip {
  tip: string;
  timing?: string;
  category: 'trading' | 'farming' | 'positioning' | 'vision' | 'objective';
}

/**
 * Enhanced tactic output
 */
export interface EnhancedTacticalOutput {
  abilityWindows: AbilityWindowTactic[];
  conditionalTactics: ConditionalTactic[];
  microTips: MicroTip[];
  laneStrategy: {
    early: string[];
    mid: string[];
    late: string[];
  };
  winCondition: string;
  avoidCondition: string;
}

/**
 * Key abilities database - abilities worth tracking cooldowns
 */
const KEY_ABILITIES: Record<string, {
  ability: string;
  name: string;
  cooldown: number;
  isEscape: boolean;
  isEngageKey: boolean;
  description: string;
}[]> = {
  zed: [
    { ability: 'W', name: 'Living Shadow', cooldown: 20, isEscape: true, isEngageKey: true, description: 'shadow dash/swap' },
    { ability: 'R', name: 'Death Mark', cooldown: 80, isEscape: false, isEngageKey: true, description: 'assassination ultimate' },
  ],
  yasuo: [
    { ability: 'E', name: 'Sweeping Blade', cooldown: 0.5, isEscape: true, isEngageKey: false, description: 'dash through units' },
    { ability: 'W', name: 'Wind Wall', cooldown: 26, isEscape: false, isEngageKey: false, description: 'projectile block' },
    { ability: 'R', name: 'Last Breath', cooldown: 70, isEscape: false, isEngageKey: true, description: 'airborne follow-up' },
  ],
  fizz: [
    { ability: 'E', name: 'Playful/Trickster', cooldown: 16, isEscape: true, isEngageKey: true, description: 'invulnerable hop' },
    { ability: 'R', name: 'Chum the Waters', cooldown: 75, isEscape: false, isEngageKey: true, description: 'shark engage' },
  ],
  ahri: [
    { ability: 'E', name: 'Charm', cooldown: 12, isEscape: false, isEngageKey: true, description: 'CC skillshot' },
    { ability: 'R', name: 'Spirit Rush', cooldown: 80, isEscape: true, isEngageKey: true, description: '3-dash ultimate' },
  ],
  katarina: [
    { ability: 'E', name: 'Shunpo', cooldown: 14, isEscape: true, isEngageKey: true, description: 'blink to target/dagger' },
    { ability: 'R', name: 'Death Lotus', cooldown: 60, isEscape: false, isEngageKey: true, description: 'spinning blades' },
  ],
  lux: [
    { ability: 'Q', name: 'Light Binding', cooldown: 11, isEscape: false, isEngageKey: true, description: 'root skillshot' },
    { ability: 'E', name: 'Lucent Singularity', cooldown: 10, isEscape: false, isEngageKey: false, description: 'slow zone' },
    { ability: 'R', name: 'Final Spark', cooldown: 50, isEscape: false, isEngageKey: true, description: 'laser ultimate' },
  ],
  syndra: [
    { ability: 'E', name: 'Scatter the Weak', cooldown: 16, isEscape: false, isEngageKey: true, description: 'knockback/stun' },
    { ability: 'R', name: 'Unleashed Power', cooldown: 80, isEscape: false, isEngageKey: true, description: 'sphere burst' },
  ],
  orianna: [
    { ability: 'R', name: 'Command: Shockwave', cooldown: 80, isEscape: false, isEngageKey: true, description: 'ball pull ultimate' },
  ],
  talon: [
    { ability: 'E', name: 'Assassin\'s Path', cooldown: 2, isEscape: true, isEngageKey: false, description: 'wall jump' },
    { ability: 'R', name: 'Shadow Assault', cooldown: 75, isEscape: true, isEngageKey: true, description: 'stealth + blades' },
  ],
  akali: [
    { ability: 'W', name: 'Twilight Shroud', cooldown: 20, isEscape: true, isEngageKey: false, description: 'stealth zone' },
    { ability: 'E', name: 'Shuriken Flip', cooldown: 16, isEscape: true, isEngageKey: true, description: 'dash + recast' },
    { ability: 'R', name: 'Perfect Execution', cooldown: 80, isEscape: false, isEngageKey: true, description: 'two-part dash' },
  ],
  diana: [
    { ability: 'E', name: 'Lunar Rush', cooldown: 22, isEscape: false, isEngageKey: true, description: 'dash to target' },
    { ability: 'R', name: 'Moonfall', cooldown: 75, isEscape: false, isEngageKey: true, description: 'pull + damage' },
  ],
  ekko: [
    { ability: 'E', name: 'Phase Dive', cooldown: 11, isEscape: true, isEngageKey: true, description: 'dash + blink' },
    { ability: 'R', name: 'Chronobreak', cooldown: 80, isEscape: true, isEngageKey: false, description: 'rewind ultimate' },
  ],
  leblanc: [
    { ability: 'W', name: 'Distortion', cooldown: 14, isEscape: true, isEngageKey: true, description: 'dash + return' },
    { ability: 'E', name: 'Ethereal Chains', cooldown: 14, isEscape: false, isEngageKey: true, description: 'root after delay' },
  ],
  veigar: [
    { ability: 'E', name: 'Event Horizon', cooldown: 18, isEscape: false, isEngageKey: true, description: 'cage stun' },
    { ability: 'R', name: 'Primordial Burst', cooldown: 80, isEscape: false, isEngageKey: true, description: 'execute ultimate' },
  ],
  twisted_fate: [
    { ability: 'W', name: 'Pick a Card', cooldown: 8, isEscape: false, isEngageKey: true, description: 'gold card stun' },
    { ability: 'R', name: 'Destiny', cooldown: 120, isEscape: false, isEngageKey: true, description: 'global teleport' },
  ],
};

/**
 * Universal conditional tactics
 */
const UNIVERSAL_CONDITIONALS: ConditionalTactic[] = [
  // Vision & Safety
  {
    condition: 'Enemy jungler not visible for 30+ seconds',
    action: 'Ward river/tri-bush, hug tower side of lane',
    priority: 'must',
    phase: 'early',
    icon: 'warning',
  },
  {
    condition: 'Your jungler pings for gank',
    action: 'Slow push wave, bait enemy forward, save CC for gank',
    priority: 'should',
    phase: 'early',
    icon: 'tip',
  },
  {
    condition: 'Enemy mid is missing',
    action: 'Ping immediately, shove wave, follow or take plates',
    priority: 'must',
    phase: 'mid',
    icon: 'warning',
  },
  // Objectives
  {
    condition: 'Dragon spawns in 30 seconds',
    action: 'Shove wave, recall if needed, rotate early',
    priority: 'should',
    phase: 'mid',
    icon: 'info',
  },
  {
    condition: 'Herald is up and jungler is topside',
    action: 'Push wave, rotate for Herald if lane is winning',
    priority: 'consider',
    phase: 'mid',
    icon: 'tip',
  },
  {
    condition: 'Baron spawns soon and team is ahead',
    action: 'Group with team, maintain vision control',
    priority: 'must',
    phase: 'late',
    icon: 'warning',
  },
  // Lane State
  {
    condition: 'Wave is pushing towards you',
    action: 'Let it crash into tower, freeze if safe',
    priority: 'should',
    phase: 'all',
    icon: 'tip',
  },
  {
    condition: 'You have item advantage after recall',
    action: 'Look for aggressive trade when returning to lane',
    priority: 'should',
    phase: 'early',
    icon: 'tip',
  },
  {
    condition: 'You are behind 0/2 or more',
    action: 'Focus on safe CS, avoid fights, wait for team',
    priority: 'must',
    phase: 'all',
    icon: 'warning',
  },
];

/**
 * Generate ability window tactics for a specific matchup
 */
export function generateAbilityWindowTactics(
  player: Champion,
  enemy: Champion
): AbilityWindowTactic[] {
  const tactics: AbilityWindowTactic[] = [];
  const enemyAbilities = KEY_ABILITIES[enemy.id] || [];

  for (const ability of enemyAbilities) {
    // Escape ability used - punish window
    if (ability.isEscape && ability.cooldown >= 10) {
      tactics.push({
        trigger: `${enemy.displayName} uses ${ability.name} (${ability.ability}) aggressively`,
        window: `${Math.floor(ability.cooldown * 0.7)}-${ability.cooldown}s trade window`,
        action: ability.isEngageKey 
          ? 'All-in immediately - no escape available' 
          : 'Trade aggressively - escape on cooldown',
        risk: 'low',
        phase: 'all',
      });
    }

    // Key engage ability on cooldown
    if (ability.isEngageKey && !ability.isEscape && ability.cooldown >= 8) {
      tactics.push({
        trigger: `${enemy.displayName} misses or wastes ${ability.name} (${ability.ability})`,
        window: `${Math.floor(ability.cooldown * 0.6)}-${ability.cooldown}s`,
        action: 'Step forward for trades - key ability unavailable',
        risk: 'medium',
        phase: 'all',
      });
    }

    // Ultimate tracking
    if (ability.ability === 'R') {
      tactics.push({
        trigger: `${enemy.displayName} just used ultimate`,
        window: `${ability.cooldown}s until available again`,
        action: 'Play more aggressive - ultimate on cooldown',
        risk: 'medium',
        phase: 'mid',
      });
    }
  }

  // Player-specific windows
  const playerAbilities = KEY_ABILITIES[player.id] || [];
  for (const ability of playerAbilities) {
    if (ability.isEngageKey && ability.ability === 'R') {
      tactics.push({
        trigger: `Your ${ability.name} is available`,
        window: 'Look for engage opportunity',
        action: `Use ${ability.ability} when enemy key abilities are down`,
        risk: 'medium',
        phase: 'mid',
      });
    }
  }

  return tactics;
}

/**
 * Generate conditional tactics for a matchup
 */
export function generateConditionalTactics(
  player: Champion,
  enemy: Champion,
  vector: MatchupVector
): ConditionalTactic[] {
  const tactics: ConditionalTactic[] = [...UNIVERSAL_CONDITIONALS];

  // Matchup-specific conditionals
  if (vector.laneDominance < -20) {
    tactics.push({
      condition: 'Enemy is zoning you from CS',
      action: 'Give up some CS, stay in XP range, wait for jungler',
      priority: 'should',
      phase: 'early',
      icon: 'tip',
    });
  }

  if (vector.laneDominance > 20) {
    tactics.push({
      condition: 'You hit level 2 first',
      action: 'Look for immediate trade - level advantage is huge',
      priority: 'should',
      phase: 'early',
      icon: 'tip',
    });
  }

  if (enemy.tags.includes('assassin')) {
    tactics.push({
      condition: 'Enemy assassin hits 6 before you',
      action: 'Play far back, respect kill threat, ping for assistance',
      priority: 'must',
      phase: 'early',
      icon: 'warning',
    });
  }

  if (vector.scalingDiff > 25) {
    tactics.push({
      condition: 'Game reaches 15+ minutes',
      action: 'You outscale - look for teamfights, avoid 1v1s',
      priority: 'should',
      phase: 'late',
      icon: 'info',
    });
  }

  if (vector.scalingDiff < -25) {
    tactics.push({
      condition: 'Game reaches 15+ minutes',
      action: 'Enemy outscales - force objectives, end early',
      priority: 'must',
      phase: 'late',
      icon: 'warning',
    });
  }

  if (player.roamScore && player.roamScore >= 7) {
    tactics.push({
      condition: 'Wave is pushed and enemy is low',
      action: 'Roam to help jungler or side lanes',
      priority: 'consider',
      phase: 'mid',
      icon: 'tip',
    });
  }

  return tactics;
}

/**
 * Generate micro tips for quick reference
 */
export function generateMicroTips(
  player: Champion,
  enemy: Champion,
  vector: MatchupVector
): MicroTip[] {
  const tips: MicroTip[] = [];

  // Trading tips
  if (vector.pokeAdvantage > 15) {
    tips.push({
      tip: `Poke ${enemy.displayName} when they go for CS`,
      timing: 'When enemy last-hits',
      category: 'trading',
    });
  }

  if (enemy.burstScore >= 8) {
    tips.push({
      tip: `Don't stand still - ${enemy.displayName} has high burst`,
      category: 'positioning',
    });
  }

  // Farming tips
  if (vector.waveclearDiff < -20) {
    tips.push({
      tip: 'Save abilities for wave management, not poke',
      category: 'farming',
    });
  }

  // Vision tips
  tips.push({
    tip: 'Ward pixel brush at 2:30 - standard jungle timing',
    timing: '2:30 game time',
    category: 'vision',
  });

  if (enemy.roamScore && enemy.roamScore >= 7) {
    tips.push({
      tip: `${enemy.displayName} roams well - keep river warded`,
      category: 'vision',
    });
  }

  // Champion-specific tips
  const championTips: Record<string, MicroTip[]> = {
    zed: [
      { tip: 'Track his W shadow position - it lasts 5 seconds', category: 'positioning' },
      { tip: 'Stand behind minions to avoid double Q damage', category: 'positioning' },
    ],
    yasuo: [
      { tip: 'His Wind Wall has 26s cooldown - bait it then engage', category: 'trading' },
      { tip: 'Fight when he has no minions to dash through', category: 'trading' },
    ],
    fizz: [
      { tip: 'Punish him hard levels 1-2, he is weak early', timing: 'Levels 1-2', category: 'trading' },
      { tip: 'Flash or dash sideways when he Rs', category: 'positioning' },
    ],
    katarina: [
      { tip: 'Stand away from her daggers on the ground', category: 'positioning' },
      { tip: 'Save CC to interrupt her ultimate', category: 'trading' },
    ],
    leblanc: [
      { tip: 'She returns to W pad - put damage there', category: 'trading' },
      { tip: 'Silence or root stops her combo', category: 'trading' },
    ],
    akali: [
      { tip: 'Pink ward her shroud - it reveals her', category: 'vision' },
      { tip: 'Trade when shroud is down (20s CD)', category: 'trading' },
    ],
  };

  if (championTips[enemy.id]) {
    tips.push(...championTips[enemy.id]);
  }

  return tips;
}

/**
 * Generate lane strategy breakdown
 */
export function generateLaneStrategy(
  player: Champion,
  enemy: Champion,
  vector: MatchupVector
): { early: string[]; mid: string[]; late: string[] } {
  const strategy = {
    early: [] as string[],
    mid: [] as string[],
    late: [] as string[],
  };

  // Early game (1-5)
  if (vector.laneDominance > 20) {
    strategy.early.push('Trade aggressively at levels 1-2');
    strategy.early.push('Push for level 2 first - 7th minion kills');
    strategy.early.push(`Zone ${enemy.displayName} from CS when possible`);
  } else if (vector.laneDominance < -20) {
    strategy.early.push('Focus on safe CS under tower');
    strategy.early.push('Give up minions rather than HP');
    strategy.early.push('Wait for jungle help or level 6 power spike');
  } else {
    strategy.early.push('Trade when enemy uses abilities on wave');
    strategy.early.push('Match enemy push to prevent roams');
    strategy.early.push('Look for favorable trades when abilities are up');
  }

  // Ward timing
  strategy.early.push('Ward river at 2:30 for first gank timing');

  // Mid game (6-10)
  if (vector.scalingDiff < -15) {
    strategy.mid.push('Force fights - you need to snowball');
    strategy.mid.push('Roam aggressively after shoving wave');
    strategy.mid.push('Contest every dragon and herald');
  } else if (vector.scalingDiff > 15) {
    strategy.mid.push('Farm safely - you outscale');
    strategy.mid.push('Group only for guaranteed objectives');
    strategy.mid.push('Avoid risky solo plays');
  } else {
    strategy.mid.push('Look for roams when lane is pushed');
    strategy.mid.push('Contest objectives with team');
    strategy.mid.push('Build according to game state');
  }

  // Late game (11+)
  if (player.tags.includes('assassin')) {
    strategy.late.push('Flank in teamfights for backline access');
    strategy.late.push('Pick off isolated enemies before objectives');
    strategy.late.push('Wait for key enemy cooldowns before engaging');
  } else if (player.tags.includes('mage')) {
    strategy.late.push('Stay with team - you are high priority target');
    strategy.late.push('Use abilities to zone enemies from objectives');
    strategy.late.push('Position behind frontline in fights');
  } else {
    strategy.late.push('Group with team for objectives');
    strategy.late.push('Play around your win condition');
  }

  return strategy;
}

/**
 * Generate win and avoid conditions
 */
export function generateWinConditions(
  player: Champion,
  enemy: Champion,
  vector: MatchupVector
): { win: string; avoid: string } {
  let win = '';
  let avoid = '';

  if (vector.scalingDiff > 20) {
    win = `Scale to late game - you outscale ${enemy.displayName}. Farm safely, avoid unnecessary fights, and group for objectives after 2-3 items.`;
    avoid = 'Feeding early kills, taking risky 1v1s, or letting enemy snowball other lanes.';
  } else if (vector.scalingDiff < -20) {
    win = `Snowball early - ${enemy.displayName} outscales you. Get kills in lane, roam aggressively, and force early objectives.`;
    avoid = 'Passive farming, letting game go late, or taking even trades.';
  } else if (vector.laneDominance > 25) {
    win = `Dominate lane and spread your lead. Punish ${enemy.displayName} early, deny CS, and roam with priority.`;
    avoid = 'Overextending without vision, or letting enemy farm back into the game.';
  } else if (vector.laneDominance < -25) {
    win = `Survive laning phase without falling too far behind. Call for jungle help, farm safely, and look for outplay opportunities.`;
    avoid = `Taking fights without a clear advantage, or standing in ${enemy.displayName}'s kill range.`;
  } else {
    win = 'Win through superior mechanics and macro. Trade efficiently, roam at good timings, and play around your power spikes.';
    avoid = 'Coinflip fights, wasting summoner spells, or ignoring map plays.';
  }

  return { win, avoid };
}

/**
 * Main function - generate full tactical output
 */
export function generateEnhancedTactics(
  player: Champion,
  enemy: Champion,
  vector: MatchupVector
): EnhancedTacticalOutput {
  const abilityWindows = generateAbilityWindowTactics(player, enemy);
  const conditionalTactics = generateConditionalTactics(player, enemy, vector);
  const microTips = generateMicroTips(player, enemy, vector);
  const laneStrategy = generateLaneStrategy(player, enemy, vector);
  const { win, avoid } = generateWinConditions(player, enemy, vector);

  return {
    abilityWindows,
    conditionalTactics,
    microTips,
    laneStrategy,
    winCondition: win,
    avoidCondition: avoid,
  };
}
