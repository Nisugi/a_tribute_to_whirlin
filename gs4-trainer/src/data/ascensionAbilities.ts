/**
 * Ascension Abilities Data
 * Reflects the in-game Common and Elite ascension abilities list.
 */

import type { Stats, StatName, Profession } from '../types';

export type AscensionTier = 'Common' | 'Elite' | 'Legendary';

export type AbilityCategory = 'Stat' | 'Skill' | 'Resist' | 'Regen' | 'Other';

export interface AscensionAbility {
  id: string;
  mnemonic?: string;
  name: string;
  tier: AscensionTier;
  category: AbilityCategory;
  description: string;
  maxRanks: number;

  requiresCommonRanks?: number;
  requiresEliteRanks?: number;
  requiredAbilities?: string[];
  professionRestriction?: Profession[];
  requiresAbilityRankTotal?: {
    abilityIds: string[];
    minTotalRanks: number;
    label?: string;
  };
  requiresTierCost?: {
    tier: AscensionTier;
    minCost: number;
  };

  statBonus?: Partial<Stats>;
  skillBonus?: Record<string, number>;

  isProgressiveCost?: boolean;
  rankCostOverrides?: number[];
}

export const normalizeAbilityId = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

const createStatAbility = (id: string, stat: StatName, name: string): AscensionAbility => ({
  id,
  mnemonic: id,
  name,
  tier: 'Common',
  category: 'Stat',
  description: `+1 ${name} per rank`,
  maxRanks: 40,
  isProgressiveCost: true,
  statBonus: { [stat]: 1 },
});

const createSkillAbility = (name: string): AscensionAbility => {
  const id = normalizeAbilityId(name);
  return {
    id,
    mnemonic: id,
    name,
    tier: 'Common',
    category: 'Skill',
    description: `${name} training`,
    maxRanks: 50,
    isProgressiveCost: true,
  };
};

const createResistAbility = (name: string): AscensionAbility => {
  const id = normalizeAbilityId(name);
  return {
    id,
    mnemonic: id,
    name,
    tier: 'Common',
    category: 'Resist',
    description: `${name} provides cumulative elemental/physical resistance`,
    maxRanks: 40,
    isProgressiveCost: true,
  };
};

const createRegenAbility = (name: string): AscensionAbility => {
  const id = normalizeAbilityId(name);
  return {
    id,
    mnemonic: id,
    name,
    tier: 'Common',
    category: 'Regen',
    description: `${name} improves recovery rates`,
    maxRanks: 50,
    isProgressiveCost: true,
  };
};

const STAT_ABILITIES: AscensionAbility[] = [
  createStatAbility('strength', 'STR', 'Strength'),
  createStatAbility('constitution', 'CON', 'Constitution'),
  createStatAbility('dexterity', 'DEX', 'Dexterity'),
  createStatAbility('agility', 'AGL', 'Agility'),
  createStatAbility('discipline', 'DIS', 'Discipline'),
  createStatAbility('aura', 'AUR', 'Aura'),
  createStatAbility('wisdom', 'WIS', 'Wisdom'),
  createStatAbility('logic', 'LOG', 'Logic'),
  createStatAbility('intuition', 'INT', 'Intuition'),
  createStatAbility('influence', 'INF', 'Influence'),
];

const COMMON_SKILL_NAMES = [
  'Ambush',
  'Arcane Symbols',
  'Armor Use',
  'Blunt Weapons',
  'Brawling',
  'Climbing',
  'Combat Maneuvers',
  'Disarming Traps',
  'Dodging',
  'Edged Weapons',
  'Elemental Lore - Air',
  'Elemental Lore - Earth',
  'Elemental Lore - Fire',
  'Elemental Lore - Water',
  'Elemental Mana Control',
  'First Aid',
  'Harness Power',
  'Magic Item Use',
  'Mental Lore - Divination',
  'Mental Lore - Manipulation',
  'Mental Lore - Telepathy',
  'Mental Lore - Transference',
  'Mental Lore - Transformation',
  'Mental Mana Control',
  'Multi Opponent Combat',
  'Perception',
  'Physical Fitness',
  'Picking Locks',
  'Picking Pockets',
  'Polearm Weapons',
  'Ranged Weapons',
  'Shield Use',
  'Sorcerous Lore - Demonology',
  'Sorcerous Lore - Necromancy',
  'Spell Aiming',
  'Spirit Mana Control',
  'Spiritual Lore - Blessings',
  'Spiritual Lore - Religion',
  'Spiritual Lore - Summoning',
  'Stalking and Hiding',
  'Survival',
  'Swimming',
  'Thrown Weapons',
  'Trading',
  'Two Weapon Combat',
  'Two-Handed Weapons',
];

const COMMON_SKILL_ABILITIES = COMMON_SKILL_NAMES.map(createSkillAbility);

const COMMON_RESIST_NAMES = [
  'Acid Resistance',
  'Cold Resistance',
  'Crush Resistance',
  'Disintegration Resistance',
  'Disruption Resistance',
  'Electric Resistance',
  'Grapple Resistance',
  'Heat Resistance',
  'Impact Resistance',
  'Plasma Resistance',
  'Puncture Resistance',
  'Slash Resistance',
  'Steam Resistance',
  'Unbalance Resistance',
  'Vacuum Resistance',
];

const COMMON_RESIST_ABILITIES = COMMON_RESIST_NAMES.map(createResistAbility);

const COMMON_REGEN_ABILITIES = [
  createRegenAbility('Health Regeneration'),
  createRegenAbility('Mana Regeneration'),
  createRegenAbility('Stamina Regeneration'),
];

const COMMON_OTHER_ABILITIES: AscensionAbility[] = [
  {
    id: 'porter',
    mnemonic: 'porter',
    name: 'Porter',
    tier: 'Common',
    category: 'Other',
    description: 'Decreases encumbrance by 2 pounds per rank.',
    maxRanks: 50,
    isProgressiveCost: true,
    requiresAbilityRankTotal: {
      abilityIds: ['strength', 'physicalfitness'],
      minTotalRanks: 10,
      label: '10 combined ranks in Strength and Physical Fitness',
    },
  },
];

const COMMON_ABILITIES: AscensionAbility[] = [
  ...STAT_ABILITIES,
  ...COMMON_SKILL_ABILITIES,
  ...COMMON_RESIST_ABILITIES,
  ...COMMON_REGEN_ABILITIES,
  ...COMMON_OTHER_ABILITIES,
];

const ELITE_ABILITIES: AscensionAbility[] = [
  {
    id: 'transcenddestiny',
    mnemonic: 'trandest',
    name: 'Transcend Destiny',
    tier: 'Elite',
    category: 'Other',
    description: 'Raises effective level for many offensive and defensive calculations.',
    maxRanks: 10,
    rankCostOverrides: [10, 20, 30, 40, 50, 50, 50, 50, 50, 50],
    requiresTierCost: {
      tier: 'Common',
      minCost: 150,
    },
  },
];

export const ALL_ABILITIES: AscensionAbility[] = [...COMMON_ABILITIES, ...ELITE_ABILITIES];

export function getAbilitiesByTier(tier: AscensionTier): AscensionAbility[] {
  return ALL_ABILITIES.filter((ability) => ability.tier === tier);
}

export function getAbilitiesByCategory(category: AbilityCategory): AscensionAbility[] {
  return ALL_ABILITIES.filter((ability) => ability.category === category);
}

export function calculateAbilityCost(ability: AscensionAbility, targetRanks: number): number {
  const safeRanks = Math.max(0, Math.min(targetRanks, ability.maxRanks));

  if (ability.rankCostOverrides?.length) {
    let total = 0;
    for (let index = 0; index < safeRanks; index++) {
      total += ability.rankCostOverrides[index] ?? ability.rankCostOverrides[ability.rankCostOverrides.length - 1];
    }
    return total;
  }

  if (!ability.isProgressiveCost) {
    return safeRanks;
  }

  let totalCost = 0;
  let costPerRank = 1;

  for (let rank = 1; rank <= safeRanks; rank++) {
    totalCost += costPerRank;
    if (rank % 5 === 0) {
      costPerRank++;
    }
  }

  return totalCost;
}

export function calculateTotalAbilityCost(
  selections: Array<{ abilityId: string; ranks: number }>
): number {
  let totalCost = 0;

  for (const selection of selections) {
    const ability = ALL_ABILITIES.find((entry) => entry.id === selection.abilityId);
    if (ability) {
      totalCost += calculateAbilityCost(ability, selection.ranks);
    }
  }

  return totalCost;
}

export function calculateAbilityStatBonuses(
  selections: Array<{ abilityId: string; ranks: number }>
): Stats {
  const bonuses: Stats = {
    STR: 0,
    CON: 0,
    DEX: 0,
    AGL: 0,
    DIS: 0,
    AUR: 0,
    LOG: 0,
    INT: 0,
    WIS: 0,
    INF: 0,
  };

  for (const selection of selections) {
    const ability = ALL_ABILITIES.find((entry) => entry.id === selection.abilityId);
    if (ability?.statBonus) {
      for (const [stat, value] of Object.entries(ability.statBonus)) {
        bonuses[stat as StatName] += (value ?? 0) * selection.ranks;
      }
    }
  }

  return bonuses;
}
