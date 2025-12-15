/**
 * Unit tests for champion service
 */

import { describe, it, expect } from 'vitest';
import {
  normalizeChampionInput,
  normalizeChampionInputs,
  normalizeLane,
  searchChampions,
  getChampionsByRole,
} from '../src/services/champion';

describe('Champion Normalization', () => {
  describe('normalizeChampionInput', () => {
    it('should normalize exact ID match', () => {
      expect(normalizeChampionInput('yasuo')).toBe('yasuo');
      expect(normalizeChampionInput('Yasuo')).toBe('yasuo');
      expect(normalizeChampionInput('YASUO')).toBe('yasuo');
    });

    it('should normalize champion names', () => {
      expect(normalizeChampionInput('Lee Sin')).toBe('leesin');
      expect(normalizeChampionInput('lee sin')).toBe('leesin');
    });

    it('should handle aliases', () => {
      expect(normalizeChampionInput('yas')).toBe('yasuo');
      expect(normalizeChampionInput('lee')).toBe('leesin');
    });

    it('should handle fuzzy matching', () => {
      expect(normalizeChampionInput('yasu')).toBe('yasuo');
      expect(normalizeChampionInput('jinxe')).toBe('jinx');
    });

    it('should return null for unknown champions', () => {
      expect(normalizeChampionInput('notachampion')).toBeNull();
      expect(normalizeChampionInput('')).toBeNull();
    });
  });

  describe('normalizeChampionInputs', () => {
    it('should normalize multiple inputs', () => {
      const results = normalizeChampionInputs(['Yasuo', 'Jinx', 'Lee Sin']);
      
      expect(results).toHaveLength(3);
      expect(results[0].normalized).toBe('yasuo');
      expect(results[1].normalized).toBe('jinx');
      expect(results[2].normalized).toBe('leesin');
    });

    it('should handle mixed valid and invalid inputs', () => {
      const results = normalizeChampionInputs(['Yasuo', 'notreal', 'Jinx']);
      
      expect(results[0].normalized).toBe('yasuo');
      expect(results[1].normalized).toBeNull();
      expect(results[2].normalized).toBe('jinx');
    });
  });
});

describe('Lane Normalization', () => {
  describe('normalizeLane', () => {
    it('should normalize standard lane names', () => {
      expect(normalizeLane('mid')).toBe('mid');
      expect(normalizeLane('Mid')).toBe('mid');
      expect(normalizeLane('MID')).toBe('mid');
    });

    it('should handle lane aliases', () => {
      expect(normalizeLane('top')).toBe('baron');
      expect(normalizeLane('baron')).toBe('baron');
      expect(normalizeLane('bot')).toBe('adc');
      expect(normalizeLane('adc')).toBe('adc');
      expect(normalizeLane('sup')).toBe('support');
      expect(normalizeLane('supp')).toBe('support');
      expect(normalizeLane('jg')).toBe('jungle');
    });

    it('should return null for invalid lanes', () => {
      expect(normalizeLane('notlane')).toBeNull();
      expect(normalizeLane('')).toBeNull();
    });
  });
});

describe('Champion Search', () => {
  describe('searchChampions', () => {
    it('should return results for partial matches', () => {
      const results = searchChampions('yas');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('yasuo');
    });

    it('should respect limit parameter', () => {
      const results = searchChampions('a', 3);
      expect(results.length).toBeLessThanOrEqual(3);
    });

    it('should return all champions for short query', () => {
      const results = searchChampions('', 10);
      expect(results.length).toBe(10);
    });
  });

  describe('getChampionsByRole', () => {
    it('should return champions for specific roles', () => {
      const midChamps = getChampionsByRole('mid');
      expect(midChamps.length).toBeGreaterThan(0);
      expect(midChamps.every(c => c.roles.includes('mid'))).toBe(true);
    });

    it('should return ADC champions', () => {
      const adcChamps = getChampionsByRole('adc');
      expect(adcChamps.length).toBeGreaterThan(0);
    });
  });
});
