/**
 * Build Confidence Tests
 * 
 * Tests the confidence calculation formula for builds:
 * confidence = clamp(round(40*sourceAgreement + 30*recencyWeight + 30*sourceWeightAvg), 0, 100)
 */

import { describe, it, expect } from 'vitest';

/**
 * Calculate build confidence using the specified formula
 */
function calculateBuildConfidence(
  sourceAgreement: number, // 0-1 (how many sources agree)
  recencyWeight: number,   // 0-1 (how recent the data is)
  sourceWeightAvg: number  // 0-1 (average reliability of sources)
): number {
  const confidence = Math.round(
    40 * sourceAgreement +
    30 * recencyWeight +
    30 * sourceWeightAvg
  );
  return Math.max(0, Math.min(100, confidence));
}

/**
 * Get recency weight based on data age
 */
function getRecencyWeight(lastUpdated: Date): number {
  const now = new Date();
  const ageInDays = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
  
  if (ageInDays < 7) return 1.0;    // Less than a week
  if (ageInDays < 14) return 0.9;   // 1-2 weeks
  if (ageInDays < 30) return 0.7;   // 2-4 weeks
  if (ageInDays < 60) return 0.5;   // 1-2 months
  return 0.3;                        // Older than 2 months
}

describe('Build Confidence Calculation', () => {
  describe('Formula: 40*agreement + 30*recency + 30*sourceWeight', () => {
    it('should return 100 for perfect scores', () => {
      const confidence = calculateBuildConfidence(1.0, 1.0, 1.0);
      expect(confidence).toBe(100);
    });

    it('should return 0 for zero scores', () => {
      const confidence = calculateBuildConfidence(0, 0, 0);
      expect(confidence).toBe(0);
    });

    it('should weight source agreement at 40%', () => {
      // Only source agreement at 1.0
      const confidence = calculateBuildConfidence(1.0, 0, 0);
      expect(confidence).toBe(40);
    });

    it('should weight recency at 30%', () => {
      // Only recency at 1.0
      const confidence = calculateBuildConfidence(0, 1.0, 0);
      expect(confidence).toBe(30);
    });

    it('should weight source reliability at 30%', () => {
      // Only source weight at 1.0
      const confidence = calculateBuildConfidence(0, 0, 1.0);
      expect(confidence).toBe(30);
    });

    it('should calculate intermediate values correctly', () => {
      // 40*0.5 + 30*0.5 + 30*0.5 = 20 + 15 + 15 = 50
      const confidence = calculateBuildConfidence(0.5, 0.5, 0.5);
      expect(confidence).toBe(50);
    });

    it('should round to nearest integer', () => {
      // 40*0.33 + 30*0.33 + 30*0.33 = 13.2 + 9.9 + 9.9 = 33
      const confidence = calculateBuildConfidence(0.33, 0.33, 0.33);
      expect(confidence).toBe(33);
    });

    it('should clamp values above 100', () => {
      // Even if somehow inputs > 1, should clamp to 100
      const confidence = calculateBuildConfidence(1.5, 1.5, 1.5);
      expect(confidence).toBe(100);
    });

    it('should clamp negative values to 0', () => {
      const confidence = calculateBuildConfidence(-0.5, -0.5, -0.5);
      expect(confidence).toBe(0);
    });
  });

  describe('Realistic scenarios', () => {
    it('should give high confidence for agreed, recent, reliable data', () => {
      // Multiple sources agree, data is recent, sources are reliable
      const confidence = calculateBuildConfidence(0.9, 0.95, 0.85);
      // 40*0.9 + 30*0.95 + 30*0.85 = 36 + 28.5 + 25.5 = 90
      expect(confidence).toBe(90);
    });

    it('should give medium confidence for partially agreed, older data', () => {
      // Some agreement, data is a few weeks old, decent sources
      const confidence = calculateBuildConfidence(0.6, 0.7, 0.7);
      // 40*0.6 + 30*0.7 + 30*0.7 = 24 + 21 + 21 = 66
      expect(confidence).toBe(66);
    });

    it('should give low confidence for disagreed, old, unreliable data', () => {
      // Little agreement, old data, low reliability sources
      const confidence = calculateBuildConfidence(0.2, 0.3, 0.4);
      // 40*0.2 + 30*0.3 + 30*0.4 = 8 + 9 + 12 = 29
      expect(confidence).toBe(29);
    });
  });
});

describe('Recency Weight Buckets', () => {
  const now = new Date();

  it('should return 1.0 for data less than 7 days old', () => {
    const recent = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    expect(getRecencyWeight(recent)).toBe(1.0);
  });

  it('should return 0.9 for data 7-14 days old', () => {
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(tenDaysAgo)).toBe(0.9);
  });

  it('should return 0.7 for data 14-30 days old', () => {
    const threeWeeksAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(threeWeeksAgo)).toBe(0.7);
  });

  it('should return 0.5 for data 30-60 days old', () => {
    const sixWeeksAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(sixWeeksAgo)).toBe(0.5);
  });

  it('should return 0.3 for data older than 60 days', () => {
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(threeMonthsAgo)).toBe(0.3);
  });

  it('should handle edge case at exactly 7 days', () => {
    const exactlySevenDays = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // >= 7 days means bucket 2
    expect(getRecencyWeight(exactlySevenDays)).toBe(0.9);
  });

  it('should return 1.0 for future dates (edge case)', () => {
    const future = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    expect(getRecencyWeight(future)).toBe(1.0);
  });
});

describe('Integration: Confidence with Recency', () => {
  it('should calculate realistic confidence with fresh data', () => {
    const now = new Date();
    const recency = getRecencyWeight(now);
    const confidence = calculateBuildConfidence(0.8, recency, 0.75);
    
    // 40*0.8 + 30*1.0 + 30*0.75 = 32 + 30 + 22.5 = 84.5 ≈ 85
    expect(confidence).toBe(85);
  });

  it('should calculate realistic confidence with stale data', () => {
    const twoMonthsAgo = new Date(Date.now() - 70 * 24 * 60 * 60 * 1000);
    const recency = getRecencyWeight(twoMonthsAgo);
    const confidence = calculateBuildConfidence(0.8, recency, 0.75);
    
    // 40*0.8 + 30*0.3 + 30*0.75 = 32 + 9 + 22.5 = 63.5 ≈ 64
    expect(confidence).toBe(64);
  });
});
