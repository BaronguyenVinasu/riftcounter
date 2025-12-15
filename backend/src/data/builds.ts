/**
 * Build Data
 * 
 * Seed data for champion builds
 */

import { Build } from './shared';

export const buildsData: Build[] = [
  // Yasuo builds
  {
    id: 'yasuo-crit-default',
    championId: 'yasuo',
    name: 'Standard Crit',
    type: 'default',
    playstyle: 'aggressive',
    items: ['infinity-edge', 'bloodthirster', 'deaths-dance', 'guardian-angel'],
    boots: 'berserkers-greaves',
    emblems: {
      keystone: 'conqueror',
      primary: ['triumph', 'legend-alacrity'],
      secondary: ['bone-plating', 'overgrowth'],
    },
    situationalSwaps: [
      {
        originalItem: 'guardian-angel',
        swapItem: 'randuins-omen',
        trigger: 'heavyCrit',
        reason: 'Enemy has heavy crit damage',
      },
      {
        originalItem: 'bloodthirster',
        swapItem: 'mortal-reminder',
        trigger: 'heavyHeal',
        reason: 'Apply grievous wounds to healers',
      },
    ],
    skillOrder: 'Q > E > W',
    notes: 'Standard Yasuo build. Focus on hitting Q knockups for R.',
    confidence: 88,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/yasuo', fetched: new Date().toISOString(), reliability: 85 },
      { name: 'WR-META', url: 'https://wr-meta.com/yasuo', fetched: new Date().toISOString(), reliability: 80 },
    ],
    metaWeight: 0.9,
  },
  
  // Jinx builds
  {
    id: 'jinx-crit-default',
    championId: 'jinx',
    name: 'Standard ADC',
    type: 'default',
    playstyle: 'farming',
    items: ['infinity-edge', 'rapid-firecannon', 'bloodthirster', 'guardian-angel'],
    boots: 'berserkers-greaves',
    emblems: {
      keystone: 'lethal-tempo',
      primary: ['triumph', 'legend-alacrity'],
      secondary: ['gathering-storm', 'nimbus-cloak'],
    },
    situationalSwaps: [
      {
        originalItem: 'guardian-angel',
        swapItem: 'deaths-dance',
        trigger: 'heavyAD',
        reason: 'Survive AD burst',
      },
      {
        originalItem: 'bloodthirster',
        swapItem: 'mortal-reminder',
        trigger: 'heavyHeal',
        reason: 'Cut enemy healing',
      },
    ],
    skillOrder: 'Q > W > E',
    notes: 'Scale to late game. Use rockets in teamfights for AOE.',
    confidence: 90,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/jinx', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.95,
  },
  
  // Lee Sin builds
  {
    id: 'leesin-bruiser-default',
    championId: 'leesin',
    name: 'Bruiser Jungle',
    type: 'default',
    playstyle: 'aggressive',
    items: ['black-cleaver', 'deaths-dance', 'guardian-angel', 'spirit-visage'],
    boots: 'mercury-treads',
    emblems: {
      keystone: 'conqueror',
      primary: ['triumph', 'legend-tenacity'],
      secondary: ['bone-plating', 'unflinching'],
    },
    situationalSwaps: [
      {
        originalItem: 'spirit-visage',
        swapItem: 'force-of-nature',
        trigger: 'heavyAP',
        reason: 'More magic resist needed',
      },
    ],
    skillOrder: 'Q > W > E',
    notes: 'Early game dominant. Look for insec kicks.',
    confidence: 85,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/lee-sin', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.85,
  },
  
  // Lux builds
  {
    id: 'lux-burst-default',
    championId: 'lux',
    name: 'Burst Mage',
    type: 'default',
    playstyle: 'aggressive',
    items: ['ludens-echo', 'rabadons-deathcap', 'void-staff', 'zhonyas-hourglass'],
    boots: 'ionian-boots',
    emblems: {
      keystone: 'electrocute',
      primary: ['sudden-impact', 'eyeball-collection'],
      secondary: ['manaflow-band', 'gathering-storm'],
    },
    situationalSwaps: [
      {
        originalItem: 'void-staff',
        swapItem: 'morellos',
        trigger: 'heavyHeal',
        reason: 'Apply anti-heal',
      },
    ],
    skillOrder: 'E > Q > W',
    notes: 'Land Q for full combo. E for poke.',
    confidence: 87,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/lux', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.88,
  },
  
  // Nautilus builds
  {
    id: 'nautilus-tank-default',
    championId: 'nautilus',
    name: 'Full Tank Support',
    type: 'default',
    playstyle: 'aggressive',
    items: ['zekes-convergence', 'spirit-visage', 'randuins-omen', 'force-of-nature'],
    boots: 'mercury-treads',
    emblems: {
      keystone: 'aftershock',
      primary: ['font-of-life', 'conditioning'],
      secondary: ['revitalize', 'unflinching'],
    },
    situationalSwaps: [
      {
        originalItem: 'randuins-omen',
        swapItem: 'thornmail',
        trigger: 'heavyHeal',
        reason: 'Anti-heal + armor',
      },
    ],
    skillOrder: 'Q > E > W',
    notes: 'Hook to engage. R for guaranteed CC.',
    confidence: 84,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/nautilus', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.82,
  },
  
  // Draven builds
  {
    id: 'draven-damage-default',
    championId: 'draven',
    name: 'Lifesteal AD',
    type: 'default',
    playstyle: 'aggressive',
    items: ['bloodthirster', 'infinity-edge', 'rapid-firecannon', 'deaths-dance'],
    boots: 'berserkers-greaves',
    emblems: {
      keystone: 'conqueror',
      primary: ['triumph', 'legend-bloodline'],
      secondary: ['taste-of-blood', 'ravenous-hunter'],
    },
    situationalSwaps: [
      {
        originalItem: 'deaths-dance',
        swapItem: 'guardian-angel',
        trigger: 'burstThreat',
        reason: 'Survive burst combos',
      },
    ],
    skillOrder: 'Q > W > E',
    notes: 'Catch axes for damage. Cash in passive stacks.',
    confidence: 86,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/draven', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.87,
  },
  
  // Ekko builds
  {
    id: 'ekko-burst-default',
    championId: 'ekko',
    name: 'AP Assassin',
    type: 'default',
    playstyle: 'aggressive',
    items: ['hextech-rocketbelt', 'lichbane', 'rabadons-deathcap', 'zhonyas-hourglass'],
    boots: 'ionian-boots',
    emblems: {
      keystone: 'electrocute',
      primary: ['sudden-impact', 'eyeball-collection'],
      secondary: ['nimbus-cloak', 'gathering-storm'],
    },
    situationalSwaps: [
      {
        originalItem: 'zhonyas-hourglass',
        swapItem: 'banshees-veil',
        trigger: 'heavyAP',
        reason: 'Spell shield vs AP threats',
      },
    ],
    skillOrder: 'Q > E > W',
    notes: 'E-Q for quick trade. R to survive or deal damage.',
    confidence: 89,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/ekko', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.91,
  },
  
  // Zed builds
  {
    id: 'zed-lethality-default',
    championId: 'zed',
    name: 'Lethality Assassin',
    type: 'default',
    playstyle: 'aggressive',
    items: ['youmuus-ghostblade', 'duskblade', 'black-cleaver', 'guardian-angel'],
    boots: 'ionian-boots',
    emblems: {
      keystone: 'electrocute',
      primary: ['sudden-impact', 'eyeball-collection'],
      secondary: ['nimbus-cloak', 'transcendence'],
    },
    situationalSwaps: [
      {
        originalItem: 'guardian-angel',
        swapItem: 'deaths-dance',
        trigger: 'heavyAD',
        reason: 'Survive AD burst',
      },
    ],
    skillOrder: 'Q > E > W',
    notes: 'R > E > Q combo. Use shadows to escape.',
    confidence: 88,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/zed', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.89,
  },
  
  // Ezreal builds
  {
    id: 'ezreal-triforce-default',
    championId: 'ezreal',
    name: 'Trinity Poke',
    type: 'default',
    playstyle: 'farming',
    items: ['trinity-force', 'manamune', 'infinity-edge', 'bloodthirster'],
    boots: 'ionian-boots',
    emblems: {
      keystone: 'conqueror',
      primary: ['presence-of-mind', 'legend-alacrity'],
      secondary: ['manaflow-band', 'gathering-storm'],
    },
    situationalSwaps: [
      {
        originalItem: 'bloodthirster',
        swapItem: 'mortal-reminder',
        trigger: 'heavyHeal',
        reason: 'Cut enemy healing',
      },
    ],
    skillOrder: 'Q > E > W',
    notes: 'Poke with Q. Use E defensively.',
    confidence: 87,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/ezreal', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.86,
  },
  
  // Senna builds
  {
    id: 'senna-support-default',
    championId: 'senna',
    name: 'AD Support',
    type: 'default',
    playstyle: 'farming',
    items: ['umbral-glaive', 'rapid-firecannon', 'infinity-edge', 'guardian-angel'],
    boots: 'boots-of-swiftness',
    emblems: {
      keystone: 'fleet-footwork',
      primary: ['presence-of-mind', 'legend-alacrity'],
      secondary: ['bone-plating', 'revitalize'],
    },
    situationalSwaps: [
      {
        originalItem: 'infinity-edge',
        swapItem: 'mortal-reminder',
        trigger: 'heavyHeal',
        reason: 'Anti-heal is priority',
      },
    ],
    skillOrder: 'Q > W > E',
    notes: 'Collect souls. Heal allies with Q.',
    confidence: 85,
    sources: [
      { name: 'WildRiftFire', url: 'https://wildriftfire.com/champion/senna', fetched: new Date().toISOString(), reliability: 85 },
    ],
    metaWeight: 0.84,
  },
];
