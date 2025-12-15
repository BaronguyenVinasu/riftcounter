/**
 * Unit tests for matchup analysis engine
 */

import { describe, it, expect } from 'vitest';
import {
  computeMatchupMetrics,
  generateTactics,
  generatePowerSpikes,
  generateAbilityWarnings,
} from '../src/services/matchup';
import { Champion, Lane } from '@riftcounter/shared';

// Mock champion data for testing
const mockYasuo: Champion = {
  id: 'yasuo',
  name: 'Yasuo',
  displayName: 'Yasuo',
  aliases: ['yas'],
  roles: ['mid', 'baron'],
  tags: ['fighter', 'assassin'],
  rangeType: 'melee',
  baseStats: {
    health: 570,
    mana: 0,
    armor: 35,
    magicResist: 32,
    attackDamage: 60,
    attackSpeed: 0.67,
    moveSpeed: 345,
  },
  mobilityScore: 8,
  ccScore: 3,
  burstScore: 8,
  sustainScore: 4,
  waveclearScore: 7,
  roamScore: 6,
  scaleScore: 9,
  damageProfile: { physical: 0.95, magic: 0.05, true_damage: 0 },
  powerSpikes: [
    { type: 'level', value: 2, power: 0.7, notes: 'Strong trade with E + Q combo' },
  ],
  abilities: {
    passive: { name: 'Way of the Wanderer', description: 'Double crit', cooldown: [0] },
    q: { name: 'Steel Tempest', description: 'Thrust', cooldown: [4] },
    w: { name: 'Wind Wall', description: 'Block projectiles', cooldown: [26] },
    e: { name: 'Sweeping Blade', description: 'Dash', cooldown: [0.5] },
    ultimate: { name: 'Last Breath', description: 'Blink to airborne', cooldown: [70] },
  },
  sources: [],
  lastUpdated: new Date().toISOString(),
};

const mockLux: Champion = {
  id: 'lux',
  name: 'Lux',
  displayName: 'Lux',
  aliases: [],
  roles: ['mid', 'support'],
  tags: ['mage', 'support'],
  rangeType: 'ranged',
  baseStats: {
    health: 510,
    mana: 460,
    armor: 25,
    magicResist: 30,
    attackDamage: 54,
    attackSpeed: 0.63,
    moveSpeed: 330,
  },
  mobilityScore: 2,
  ccScore: 7,
  burstScore: 8,
  sustainScore: 3,
  waveclearScore: 8,
  roamScore: 4,
  scaleScore: 7,
  damageProfile: { physical: 0.05, magic: 0.95, true_damage: 0 },
  powerSpikes: [
    { type: 'level', value: 6, power: 0.8, notes: 'One-shot potential' },
  ],
  abilities: {
    passive: { name: 'Illumination', description: 'Mark for damage', cooldown: [0] },
    q: { name: 'Light Binding', description: 'Root', cooldown: [10] },
    w: { name: 'Prismatic Barrier', description: 'Shield', cooldown: [14] },
    e: { name: 'Lucent Singularity', description: 'AOE slow', cooldown: [10] },
    ultimate: { name: 'Final Spark', description: 'Laser beam', cooldown: [50] },
  },
  sources: [],
  lastUpdated: new Date().toISOString(),
};

describe('Matchup Analysis', () => {
  describe('computeMatchupMetrics', () => {
    it('should compute metrics for melee vs ranged matchup', () => {
      const metrics = computeMatchupMetrics(mockYasuo, mockLux, 'mid');
      
      // Yasuo (melee) vs Lux (ranged) should have range disadvantage
      expect(metrics.pokeAdvantage).toBeLessThan(0);
      
      // Yasuo has higher mobility
      expect(metrics.roamAdvantage).toBeGreaterThan(-50);
    });

    it('should compute lane dominance within valid range', () => {
      const metrics = computeMatchupMetrics(mockYasuo, mockLux, 'mid');
      
      expect(metrics.laneDominance).toBeGreaterThanOrEqual(-100);
      expect(metrics.laneDominance).toBeLessThanOrEqual(100);
    });

    it('should compute kill potential within valid range', () => {
      const metrics = computeMatchupMetrics(mockYasuo, mockLux, 'mid');
      
      expect(metrics.killPotential).toBeGreaterThanOrEqual(0);
      expect(metrics.killPotential).toBeLessThanOrEqual(100);
    });

    it('should factor in scaling comparison', () => {
      const metrics = computeMatchupMetrics(mockYasuo, mockLux, 'mid');
      
      // Yasuo has higher scale score (9 vs 7)
      expect(metrics.scaleComparison).toBeGreaterThan(0);
    });
  });

  describe('generateTactics', () => {
    it('should generate tactics based on matchup', () => {
      const metrics = computeMatchupMetrics(mockYasuo, mockLux, 'mid');
      const tactics = generateTactics(mockYasuo, mockLux, metrics);
      
      expect(tactics.length).toBeGreaterThan(0);
    });

    it('should include early lane tactics', () => {
      const metrics = computeMatchupMetrics(mockYasuo, mockLux, 'mid');
      const tactics = generateTactics(mockYasuo, mockLux, metrics);
      
      const earlyTactic = tactics.find(t => t.phase === 'early');
      expect(earlyTactic).toBeDefined();
    });

    it('should include reasoning for tactics', () => {
      const metrics = computeMatchupMetrics(mockYasuo, mockLux, 'mid');
      const tactics = generateTactics(mockYasuo, mockLux, metrics);
      
      tactics.forEach(tactic => {
        expect(tactic.reasoning).toBeTruthy();
        expect(tactic.steps.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generatePowerSpikes', () => {
    it('should combine power spikes from both champions', () => {
      const spikes = generatePowerSpikes(mockYasuo, mockLux);
      
      expect(spikes.length).toBeGreaterThan(0);
      
      const yourSpikes = spikes.filter(s => s.champion === 'you');
      const enemySpikes = spikes.filter(s => s.champion === 'enemy');
      
      expect(yourSpikes.length).toBeGreaterThan(0);
      expect(enemySpikes.length).toBeGreaterThan(0);
    });

    it('should mark advantage correctly', () => {
      const spikes = generatePowerSpikes(mockYasuo, mockLux);
      
      spikes.forEach(spike => {
        expect(['you', 'enemy', 'neutral']).toContain(spike.advantage);
      });
    });
  });

  describe('generateAbilityWarnings', () => {
    it('should generate warnings for high CC champions', () => {
      const warnings = generateAbilityWarnings(mockLux);
      
      // Lux has high CC score, should have warnings
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('should include counterplay suggestions', () => {
      const warnings = generateAbilityWarnings(mockLux);
      
      warnings.forEach(warning => {
        expect(warning.counterplay).toBeTruthy();
      });
    });
  });
});
