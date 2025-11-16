/**
 * Training Point Calculator
 * Calculates TP costs and validates training plans
 */

import { LOOKUP_TABLES } from '../../data/lookupTables';
import { SKILLS } from '../../data/skills';
import type { Profession } from '../../types';

// Profession index mapping for lookup tables
const PROFESSION_INDEX: Record<Profession, number> = {
  'Warrior': 0,
  'Rogue': 1,
  'Wizard': 2,
  'Cleric': 3,
  'Empath': 4,
  'Sorcerer': 5,
  'Ranger': 6,
  'Bard': 7,
  'Paladin': 8,
  'Monk': 9,
};

export interface SkillCost {
  ptp: number;  // Physical Training Points cost per rank
  mtp: number;  // Mental Training Points cost per rank
  maxPerLevel: number;  // Maximum times trainable per level (1x, 2x, or 3x)
}

export interface TrainingCost {
  totalPTP: number;
  totalMTP: number;
  totalTP: number;
}

/**
 * Get the lookup table index for a skill
 * Sub-skills use their parentIndex for cost lookups
 */
function getLookupIndex(skillIndex: number): number {
  const skill = SKILLS.find(s => s.index === skillIndex);
  return skill?.parentIndex ?? skillIndex;
}

/**
 * Get the TP costs and training limits for a specific skill and profession
 */
export function getSkillCost(
  skillIndex: number,
  profession: Profession
): SkillCost {
  const lookupIndex = getLookupIndex(skillIndex);
  const profIndex = PROFESSION_INDEX[profession];

  const ptp = LOOKUP_TABLES.TBL_Skill_PTP[lookupIndex]?.[profIndex] ?? 0;
  const mtp = LOOKUP_TABLES.TBL_Skill_MTP[lookupIndex]?.[profIndex] ?? 0;
  const maxPerLevel = LOOKUP_TABLES.TBL_Skill_Count[lookupIndex]?.[profIndex] ?? 1;

  return {
    ptp,
    mtp,
    maxPerLevel,
  };
}

/**
 * Calculate the total TP cost for training a skill to a specific rank
 *
 * Training costs increase based on frequency:
 * - 1x ranks (first per level): 1x base cost
 * - 2x ranks (second per level): 2x base cost (double)
 * - 3x ranks (third per level): 4x base cost (double the double)
 *
 * For example, if base cost is 5/2 and level 10 with 25 ranks:
 * - Ranks 1-11 (1x): 11 ranks at 5/2 = 55/22
 * - Ranks 12-22 (2x): 11 ranks at 10/4 = 110/44
 * - Ranks 23-25 (3x): 3 ranks at 20/8 = 60/24
 * - Total: 225/90
 */
export function calculateSkillCost(
  skillIndex: number,
  profession: Profession,
  ranks: number,
  currentLevel: number = 100
): TrainingCost {
  const cost = getSkillCost(skillIndex, profession);

  let totalPTP = 0;
  let totalMTP = 0;

  // Calculate how many training opportunities exist at each multiplier level
  const ranksPerLevel = currentLevel + 1; // Includes level 0

  // 1x ranks: 1x base cost
  const ranksAt1x = Math.min(ranks, ranksPerLevel);
  totalPTP += ranksAt1x * cost.ptp * 1;
  totalMTP += ranksAt1x * cost.mtp * 1;

  // 2x ranks: 2x base cost (double)
  if (ranks > ranksPerLevel) {
    const ranksAt2x = Math.min(ranks - ranksPerLevel, ranksPerLevel);
    totalPTP += ranksAt2x * cost.ptp * 2;
    totalMTP += ranksAt2x * cost.mtp * 2;
  }

  // 3x ranks: 4x base cost (double the double)
  if (ranks > ranksPerLevel * 2) {
    const ranksAt3x = Math.min(ranks - (ranksPerLevel * 2), ranksPerLevel);
    totalPTP += ranksAt3x * cost.ptp * 4;
    totalMTP += ranksAt3x * cost.mtp * 4;
  }

  const totalTP = totalPTP + totalMTP;

  return {
    totalPTP,
    totalMTP,
    totalTP,
  };
}

/**
 * Get the maximum ranks allowed for a skill at a given level
 * Note: Accounts for training at level 0 through current level (level + 1 opportunities)
 */
export function getMaxRanks(
  skillIndex: number,
  profession: Profession,
  level: number
): number {
  const cost = getSkillCost(skillIndex, profession);
  return (level + 1) * cost.maxPerLevel;
}

/**
 * Get the maximum combined ranks for all sub-skills sharing a parent index
 * For example, all Elemental Lore sub-skills (Air, Earth, Fire, Water) share the same pool
 */
export function getMaxRanksForParent(
  parentIndex: number,
  profession: Profession,
  level: number
): number {
  return getMaxRanks(parentIndex, profession, level);
}

/**
 * Calculate total TP costs for all skills in a training plan
 */
export function calculateTotalTrainingCost(
  skillRanks: Record<number, number>,
  profession: Profession,
  level: number = 100
): TrainingCost {
  let totalPTP = 0;
  let totalMTP = 0;

  for (const [skillIndexStr, ranks] of Object.entries(skillRanks)) {
    const skillIndex = parseInt(skillIndexStr);
    if (ranks > 0) {
      const cost = calculateSkillCost(skillIndex, profession, ranks, level);
      totalPTP += cost.totalPTP;
      totalMTP += cost.totalMTP;
    }
  }

  return {
    totalPTP,
    totalMTP,
    totalTP: totalPTP + totalMTP,
  };
}

/**
 * Validate that a training plan doesn't exceed maximum ranks for any skill
 */
export function validateTrainingPlan(
  skillRanks: Record<number, number>,
  profession: Profession,
  level: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [skillIndexStr, ranks] of Object.entries(skillRanks)) {
    const skillIndex = parseInt(skillIndexStr);
    if (ranks > 0) {
      const maxRanks = getMaxRanks(skillIndex, profession, level);
      if (ranks > maxRanks) {
        errors.push(
          `Skill index ${skillIndex}: ${ranks} ranks exceeds maximum of ${maxRanks} at level ${level}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get skill cost efficiency tier
 * Useful for UI to show if a skill is expensive or cheap for the profession
 */
export function getSkillCostTier(skillIndex: number, profession: Profession):
  | 'very-cheap'   // 1-2 TP
  | 'cheap'        // 3-5 TP
  | 'moderate'     // 6-10 TP
  | 'expensive'    // 11-15 TP
  | 'very-expensive' // 16+ TP
{
  const cost = getSkillCost(skillIndex, profession);
  const totalCost = cost.ptp + cost.mtp;

  if (totalCost <= 2) return 'very-cheap';
  if (totalCost <= 5) return 'cheap';
  if (totalCost <= 10) return 'moderate';
  if (totalCost <= 15) return 'expensive';
  return 'very-expensive';
}

/**
 * Determine if a skill is pure physical, pure mental, or hybrid
 */
export function getSkillType(skillIndex: number, profession: Profession):
  | 'physical'  // Only PTP
  | 'mental'    // Only MTP
  | 'hybrid'    // Both PTP and MTP
{
  const cost = getSkillCost(skillIndex, profession);

  if (cost.ptp > 0 && cost.mtp === 0) return 'physical';
  if (cost.ptp === 0 && cost.mtp > 0) return 'mental';
  return 'hybrid';
}
