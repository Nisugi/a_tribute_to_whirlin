/**
 * Ascension Abilities Data
 * Defines Common, Elite, and Legendary tier abilities
 */

import type { Stats, Profession } from '../types';

export type AscensionTier = 'Common' | 'Elite' | 'Legendary';

export type AbilityCategory =
  | 'Stats'           // Stat bonuses
  | 'Skills'          // Skill bonuses
  | 'Resistances'     // Elemental/status resistances
  | 'Combat'          // Combat abilities
  | 'Magic'           // Magic abilities
  | 'Utility'         // Utility abilities
  | 'Profession';     // Profession-specific

export interface AscensionAbility {
  id: string;
  name: string;
  tier: AscensionTier;
  category: AbilityCategory;
  description: string;
  maxRanks: number;

  // Prerequisites
  requiresCommonRanks?: number;    // Total Common ranks needed
  requiresEliteRanks?: number;     // Total Elite ranks needed
  requiredAbilities?: string[];    // Specific abilities needed
  professionRestriction?: Profession[];  // null = all professions

  // Benefits per rank
  statBonus?: Partial<Stats>;      // Stat increase per rank
  skillBonus?: Record<string, number>;  // Skill bonuses per rank

  // Cost calculation (for Common tier with progressive costs)
  isProgressiveCost?: boolean;     // If true, cost increases every 5 ranks
}

/**
 * Calculate ATP cost for an ability based on current ranks
 * Common abilities: 1 ATP for ranks 1-5, 2 ATP for 6-10, 3 ATP for 11-15, etc.
 * Elite/Legendary: Flat cost per rank
 */
export function calculateAbilityCost(ability: AscensionAbility, targetRanks: number): number {
  if (!ability.isProgressiveCost) {
    // Elite/Legendary: flat cost
    return targetRanks;
  }

  // Common tier: progressive cost
  let totalCost = 0;
  let costPerRank = 1;

  for (let rank = 1; rank <= targetRanks; rank++) {
    totalCost += costPerRank;

    // Increase cost every 5 ranks
    if (rank % 5 === 0) {
      costPerRank++;
    }
  }

  return totalCost;
}

/**
 * Common Tier Abilities
 * First 5 ranks: 1 ATP each
 * Ranks 6-10: 2 ATP each
 * Ranks 11-15: 3 ATP each
 * etc.
 */
export const COMMON_ABILITIES: AscensionAbility[] = [
  // Stat Bonuses
  {
    id: 'common_str',
    name: 'Strength',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Strength stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { STR: 1 },
  },
  {
    id: 'common_con',
    name: 'Constitution',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Constitution stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { CON: 1 },
  },
  {
    id: 'common_dex',
    name: 'Dexterity',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Dexterity stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { DEX: 1 },
  },
  {
    id: 'common_agl',
    name: 'Agility',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Agility stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { AGL: 1 },
  },
  {
    id: 'common_dis',
    name: 'Discipline',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Discipline stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { DIS: 1 },
  },
  {
    id: 'common_aur',
    name: 'Aura',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Aura stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { AUR: 1 },
  },
  {
    id: 'common_log',
    name: 'Logic',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Logic stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { LOG: 1 },
  },
  {
    id: 'common_int',
    name: 'Intuition',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Intuition stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { INT: 1 },
  },
  {
    id: 'common_wis',
    name: 'Wisdom',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Wisdom stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { WIS: 1 },
  },
  {
    id: 'common_inf',
    name: 'Influence',
    tier: 'Common',
    category: 'Stats',
    description: 'Increases Influence stat',
    maxRanks: 20,
    isProgressiveCost: true,
    statBonus: { INF: 1 },
  },

  // Combat Abilities
  {
    id: 'common_as_bonus',
    name: 'Attack Strength',
    tier: 'Common',
    category: 'Combat',
    description: 'Increases attack strength in combat',
    maxRanks: 10,
    isProgressiveCost: true,
  },
  {
    id: 'common_ds_bonus',
    name: 'Defense Strength',
    tier: 'Common',
    category: 'Combat',
    description: 'Increases defensive capabilities',
    maxRanks: 10,
    isProgressiveCost: true,
  },
  {
    id: 'common_hp_bonus',
    name: 'Health',
    tier: 'Common',
    category: 'Combat',
    description: 'Increases maximum health points',
    maxRanks: 15,
    isProgressiveCost: true,
  },

  // Resistances
  {
    id: 'common_fire_resist',
    name: 'Fire Resistance',
    tier: 'Common',
    category: 'Resistances',
    description: 'Increases resistance to fire damage',
    maxRanks: 10,
    isProgressiveCost: true,
  },
  {
    id: 'common_cold_resist',
    name: 'Cold Resistance',
    tier: 'Common',
    category: 'Resistances',
    description: 'Increases resistance to cold damage',
    maxRanks: 10,
    isProgressiveCost: true,
  },
  {
    id: 'common_lightning_resist',
    name: 'Lightning Resistance',
    tier: 'Common',
    category: 'Resistances',
    description: 'Increases resistance to lightning damage',
    maxRanks: 10,
    isProgressiveCost: true,
  },
  {
    id: 'common_poison_resist',
    name: 'Poison Resistance',
    tier: 'Common',
    category: 'Resistances',
    description: 'Increases resistance to poison damage',
    maxRanks: 10,
    isProgressiveCost: true,
  },

  // Magic Abilities
  {
    id: 'common_mana_bonus',
    name: 'Mana Pool',
    tier: 'Common',
    category: 'Magic',
    description: 'Increases maximum mana points',
    maxRanks: 15,
    isProgressiveCost: true,
  },
  {
    id: 'common_spell_duration',
    name: 'Spell Duration',
    tier: 'Common',
    category: 'Magic',
    description: 'Increases duration of beneficial spells',
    maxRanks: 10,
    isProgressiveCost: true,
  },
];

/**
 * Elite Tier Abilities
 * Requires 150 Common ranks
 * Flat cost: 1 ATP per rank
 */
export const ELITE_ABILITIES: AscensionAbility[] = [
  // Square Archetype (Warriors, Rogues, Monks)
  {
    id: 'elite_combat_mastery',
    name: 'Combat Mastery',
    tier: 'Elite',
    category: 'Combat',
    description: 'Significantly improves combat effectiveness',
    maxRanks: 10,
    requiresCommonRanks: 150,
    professionRestriction: ['Warrior', 'Rogue', 'Monk', 'Paladin', 'Ranger'],
  },
  {
    id: 'elite_weapon_specialization',
    name: 'Weapon Specialization',
    tier: 'Elite',
    category: 'Combat',
    description: 'Grants bonus with specific weapon types',
    maxRanks: 5,
    requiresCommonRanks: 150,
    professionRestriction: ['Warrior', 'Rogue', 'Monk', 'Paladin', 'Ranger'],
  },

  // Semi Archetype (Bards, Paladins, Rangers)
  {
    id: 'elite_versatility',
    name: 'Versatility',
    tier: 'Elite',
    category: 'Utility',
    description: 'Improves both physical and magical abilities',
    maxRanks: 10,
    requiresCommonRanks: 150,
    professionRestriction: ['Bard', 'Paladin', 'Ranger'],
  },

  // Pure Archetype (Wizards, Clerics, Sorcerers, Empaths)
  {
    id: 'elite_arcane_power',
    name: 'Arcane Power',
    tier: 'Elite',
    category: 'Magic',
    description: 'Greatly enhances magical capabilities',
    maxRanks: 10,
    requiresCommonRanks: 150,
    professionRestriction: ['Wizard', 'Cleric', 'Sorcerer', 'Empath'],
  },
  {
    id: 'elite_spell_mastery',
    name: 'Spell Mastery',
    tier: 'Elite',
    category: 'Magic',
    description: 'Reduces mana cost and improves spell effectiveness',
    maxRanks: 5,
    requiresCommonRanks: 150,
    professionRestriction: ['Wizard', 'Cleric', 'Sorcerer', 'Empath'],
  },
];

/**
 * Legendary Tier Abilities
 * Profession-specific ultimate abilities
 * Requires significant Elite investment
 */
export const LEGENDARY_ABILITIES: AscensionAbility[] = [
  {
    id: 'legendary_warrior_prowess',
    name: 'Warrior Prowess',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate combat ability for Warriors',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Warrior'],
  },
  {
    id: 'legendary_rogue_mastery',
    name: 'Shadow Mastery',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate stealth and ambush ability for Rogues',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Rogue'],
  },
  {
    id: 'legendary_wizard_power',
    name: 'Archmage Power',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate magical power for Wizards',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Wizard'],
  },
  {
    id: 'legendary_cleric_blessing',
    name: 'Divine Blessing',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate divine power for Clerics',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Cleric'],
  },
  {
    id: 'legendary_empath_healing',
    name: 'Master Healer',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate healing ability for Empaths',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Empath'],
  },
  {
    id: 'legendary_sorcerer_power',
    name: 'Demon Mastery',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate demonic power for Sorcerers',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Sorcerer'],
  },
  {
    id: 'legendary_ranger_expertise',
    name: 'Nature Mastery',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate nature ability for Rangers',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Ranger'],
  },
  {
    id: 'legendary_bard_performance',
    name: 'Masterful Performance',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate performance ability for Bards',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Bard'],
  },
  {
    id: 'legendary_paladin_devotion',
    name: 'Holy Devotion',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate holy power for Paladins',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Paladin'],
  },
  {
    id: 'legendary_monk_discipline',
    name: 'Perfect Discipline',
    tier: 'Legendary',
    category: 'Profession',
    description: 'Ultimate martial arts ability for Monks',
    maxRanks: 3,
    requiresCommonRanks: 150,
    requiresEliteRanks: 20,
    professionRestriction: ['Monk'],
  },
];

/**
 * All abilities combined
 */
export const ALL_ABILITIES = [
  ...COMMON_ABILITIES,
  ...ELITE_ABILITIES,
  ...LEGENDARY_ABILITIES,
];

/**
 * Get abilities by tier
 */
export function getAbilitiesByTier(tier: AscensionTier): AscensionAbility[] {
  return ALL_ABILITIES.filter(a => a.tier === tier);
}

/**
 * Get abilities by category
 */
export function getAbilitiesByCategory(category: AbilityCategory): AscensionAbility[] {
  return ALL_ABILITIES.filter(a => a.category === category);
}

/**
 * Get abilities available for a profession
 */
export function getAvailableAbilities(
  profession: Profession,
  totalCommonRanks: number,
  totalEliteRanks: number
): AscensionAbility[] {
  return ALL_ABILITIES.filter(ability => {
    // Check profession restriction
    if (ability.professionRestriction && !ability.professionRestriction.includes(profession)) {
      return false;
    }

    // Check Common ranks requirement
    if (ability.requiresCommonRanks && totalCommonRanks < ability.requiresCommonRanks) {
      return false;
    }

    // Check Elite ranks requirement
    if (ability.requiresEliteRanks && totalEliteRanks < ability.requiresEliteRanks) {
      return false;
    }

    return true;
  });
}

/**
 * Calculate total ATP cost for selected abilities
 */
export function calculateTotalAbilityCost(
  selections: Array<{ abilityId: string; ranks: number }>
): number {
  let totalCost = 0;

  for (const selection of selections) {
    const ability = ALL_ABILITIES.find(a => a.id === selection.abilityId);
    if (ability) {
      totalCost += calculateAbilityCost(ability, selection.ranks);
    }
  }

  return totalCost;
}

/**
 * Calculate total stat bonuses from selected abilities
 */
export function calculateAbilityStatBonuses(
  selections: Array<{ abilityId: string; ranks: number }>
): Stats {
  const bonuses: Stats = {
    STR: 0, CON: 0, DEX: 0, AGL: 0, DIS: 0,
    AUR: 0, LOG: 0, INT: 0, WIS: 0, INF: 0,
  };

  for (const selection of selections) {
    const ability = ALL_ABILITIES.find(a => a.id === selection.abilityId);
    if (ability?.statBonus) {
      for (const [stat, bonus] of Object.entries(ability.statBonus)) {
        bonuses[stat as keyof Stats] += (bonus || 0) * selection.ranks;
      }
    }
  }

  return bonuses;
}
