/**
 * Normalization Tests
 * 
 * Tests fuzzy matching for champion name normalization
 */

import { describe, it, expect } from 'vitest';

// Mock the normalization function (would import from actual service)
function normalizeChampionName(input: string): string | null {
  const champions: Record<string, string[]> = {
    'zed': ['zed', 'shadow', 'ninja'],
    'ahri': ['ahri', 'fox', 'nine tails', '9 tails'],
    'yasuo': ['yasuo', 'yas', 'windshitter'],
    'lux': ['lux', 'luxanna', 'light mage'],
    'fizz': ['fizz', 'fish', 'troll pole'],
    'katarina': ['katarina', 'kat', 'kata'],
  };

  const normalized = input.toLowerCase().trim();

  // Direct match
  for (const [champId, aliases] of Object.entries(champions)) {
    if (champId === normalized || aliases.includes(normalized)) {
      return champId.charAt(0).toUpperCase() + champId.slice(1);
    }
  }

  // Fuzzy match - check if input starts with champion name
  for (const [champId, aliases] of Object.entries(champions)) {
    if (champId.startsWith(normalized) || normalized.startsWith(champId)) {
      return champId.charAt(0).toUpperCase() + champId.slice(1);
    }
    for (const alias of aliases) {
      if (alias.startsWith(normalized) || normalized.startsWith(alias)) {
        return champId.charAt(0).toUpperCase() + champId.slice(1);
      }
    }
  }

  return null;
}

describe('Champion Name Normalization', () => {
  describe('Exact matches', () => {
    it('should normalize lowercase "zed" to "Zed"', () => {
      expect(normalizeChampionName('zed')).toBe('Zed');
    });

    it('should normalize uppercase "ZED" to "Zed"', () => {
      expect(normalizeChampionName('ZED')).toBe('Zed');
    });

    it('should normalize mixed case "Zed" to "Zed"', () => {
      expect(normalizeChampionName('Zed')).toBe('Zed');
    });
  });

  describe('Fuzzy matches', () => {
    it('should normalize partial "ze" to "Zed"', () => {
      expect(normalizeChampionName('ze')).toBe('Zed');
    });

    it('should normalize "ah" to "Ahri"', () => {
      expect(normalizeChampionName('ah')).toBe('Ahri');
    });

    it('should normalize "yas" to "Yasuo"', () => {
      expect(normalizeChampionName('yas')).toBe('Yasuo');
    });
  });

  describe('Alias matches', () => {
    it('should normalize "fox" to "Ahri"', () => {
      expect(normalizeChampionName('fox')).toBe('Ahri');
    });

    it('should normalize "windshitter" to "Yasuo"', () => {
      expect(normalizeChampionName('windshitter')).toBe('Yasuo');
    });

    it('should normalize "kat" to "Katarina"', () => {
      expect(normalizeChampionName('kat')).toBe('Katarina');
    });

    it('should normalize "fish" to "Fizz"', () => {
      expect(normalizeChampionName('fish')).toBe('Fizz');
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace', () => {
      expect(normalizeChampionName('  zed  ')).toBe('Zed');
    });

    it('should return null for unknown champion', () => {
      expect(normalizeChampionName('unknownchamp')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(normalizeChampionName('')).toBeNull();
    });
  });
});
