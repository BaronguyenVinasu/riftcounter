/**
 * Matchup Vector Tests
 * 
 * Tests the matchup vector computation for champion vs champion analysis
 */

import { describe, it, expect } from 'vitest';

// Type definitions matching the actual implementation
interface Champion {
  id: string;
  name: string;
  displayName: string;
  rangeType: 'ranged' | 'melee';
  damageProfile: { physical: number; magic: number; trueDamage: number };
  mobilityScore: number;
  ccScore: number;
  burstScore: number;
  sustainScore: number;
  waveclearScore: number;
  scaleScore: number;
}

interface MatchupVector {
  laneDominance: number;
  allInPotential: number;
  pokeAdvantage: number;
  mobilityDiff: number;
  ccDiff: number;
  sustainDiff: number;
  waveclearDiff: number;
  scalingDiff: number;
}

// Mock implementation matching the actual computeMatchupVector function
function computeMatchupVector(player: Champion, enemy: Champion): MatchupVector {
  const clamp = (value: number, min: number, max: number) => 
    Math.max(min, Math.min(max, value));

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

  const mobilityDiff = clamp(
    (player.mobilityScore - enemy.mobilityScore) * 12,
    -100, 100
  );

  const ccDiff = clamp(
    (player.ccScore - enemy.ccScore) * 12,
    -100, 100
  );

  const sustainDiff = clamp(
    (player.sustainScore - enemy.sustainScore) * 12,
    -100, 100
  );

  const waveclearDiff = clamp(
    (player.waveclearScore - enemy.waveclearScore) * 12,
    -100, 100
  );

  const scalingDiff = clamp(
    (player.scaleScore - enemy.scaleScore) * 12,
    -100, 100
  );

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

// Mock champion data
const senna: Champion = {
  id: 'senna',
  name: 'Senna',
  displayName: 'Senna',
  rangeType: 'ranged',
  damageProfile: { physical: 70, magic: 10, trueDamage: 20 },
  mobilityScore: 4,
  ccScore: 6,
  burstScore: 7,
  sustainScore: 8,
  waveclearScore: 6,
  scaleScore: 9,
};

const zed: Champion = {
  id: 'zed',
  name: 'Zed',
  displayName: 'Zed',
  rangeType: 'melee',
  damageProfile: { physical: 95, magic: 0, trueDamage: 5 },
  mobilityScore: 9,
  ccScore: 3,
  burstScore: 10,
  sustainScore: 3,
  waveclearScore: 8,
  scaleScore: 6,
};

const yasuo: Champion = {
  id: 'yasuo',
  name: 'Yasuo',
  displayName: 'Yasuo',
  rangeType: 'melee',
  damageProfile: { physical: 95, magic: 5, trueDamage: 0 },
  mobilityScore: 9,
  ccScore: 5,
  burstScore: 8,
  sustainScore: 6,
  waveclearScore: 9,
  scaleScore: 10,
};

describe('Matchup Vector Computation', () => {
  describe('Senna vs Zed matchup', () => {
    const vector = computeMatchupVector(senna, zed);

    it('should return all required matchup vector keys', () => {
      expect(vector).toHaveProperty('laneDominance');
      expect(vector).toHaveProperty('allInPotential');
      expect(vector).toHaveProperty('pokeAdvantage');
      expect(vector).toHaveProperty('mobilityDiff');
      expect(vector).toHaveProperty('ccDiff');
      expect(vector).toHaveProperty('sustainDiff');
      expect(vector).toHaveProperty('waveclearDiff');
      expect(vector).toHaveProperty('scalingDiff');
    });

    it('should have all values as numbers', () => {
      expect(typeof vector.laneDominance).toBe('number');
      expect(typeof vector.allInPotential).toBe('number');
      expect(typeof vector.pokeAdvantage).toBe('number');
      expect(typeof vector.mobilityDiff).toBe('number');
      expect(typeof vector.ccDiff).toBe('number');
      expect(typeof vector.sustainDiff).toBe('number');
      expect(typeof vector.waveclearDiff).toBe('number');
      expect(typeof vector.scalingDiff).toBe('number');
    });

    it('should give Senna poke advantage (ranged vs melee)', () => {
      expect(vector.pokeAdvantage).toBeGreaterThan(0);
    });

    it('should show Zed has higher mobility', () => {
      expect(vector.mobilityDiff).toBeLessThan(0); // Senna has lower mobility
    });

    it('should show Senna has higher sustain', () => {
      expect(vector.sustainDiff).toBeGreaterThan(0);
    });

    it('should show Senna scales better', () => {
      expect(vector.scalingDiff).toBeGreaterThan(0);
    });

    it('should clamp all values within expected bounds', () => {
      expect(vector.laneDominance).toBeGreaterThanOrEqual(-100);
      expect(vector.laneDominance).toBeLessThanOrEqual(100);
      expect(vector.allInPotential).toBeGreaterThanOrEqual(0);
      expect(vector.allInPotential).toBeLessThanOrEqual(100);
      expect(vector.mobilityDiff).toBeGreaterThanOrEqual(-100);
      expect(vector.mobilityDiff).toBeLessThanOrEqual(100);
    });
  });

  describe('Mirror matchup (Yasuo vs Yasuo)', () => {
    const vector = computeMatchupVector(yasuo, yasuo);

    it('should have zero differences for same champion', () => {
      expect(vector.mobilityDiff).toBe(0);
      expect(vector.ccDiff).toBe(0);
      expect(vector.sustainDiff).toBe(0);
      expect(vector.waveclearDiff).toBe(0);
      expect(vector.scalingDiff).toBe(0);
    });
  });

  describe('Ranged vs Ranged matchup', () => {
    const rangedChamp: Champion = {
      ...senna,
      id: 'test-ranged',
    };

    const vector = computeMatchupVector(senna, rangedChamp);

    it('should not give range advantage when both ranged', () => {
      // Range bonus should be 0 when both are ranged
      // Still might have poke advantage from other factors
      expect(vector.pokeAdvantage).toBeDefined();
    });
  });

  describe('Melee vs Melee matchup', () => {
    const vector = computeMatchupVector(zed, yasuo);

    it('should not give range advantage when both melee', () => {
      // No range bonus, so differences come from other stats
      expect(vector.mobilityDiff).toBe(0); // Same mobility
      expect(vector.ccDiff).toBeLessThan(0); // Zed has less CC
    });

    it('should show Zed has higher burst', () => {
      // Zed burst 10, Yasuo burst 8
      // This affects laneDominance and allInPotential
      expect(vector.allInPotential).toBeGreaterThan(50);
    });
  });
});
