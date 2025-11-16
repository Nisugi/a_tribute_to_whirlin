/**
 * Training Point Earnings Calculator
 * Calculates Physical and Mental TPs earned per level based on stats
 */

import type { Profession, Stats, StatName } from '../../types';

// Prime requisite stats for each profession (count double in TP calculations)
const PRIME_REQUISITES: Record<Profession, [StatName, StatName]> = {
  'Warrior': ['STR', 'CON'],
  'Rogue': ['DEX', 'AGL'],
  'Wizard': ['AUR', 'LOG'],
  'Cleric': ['INT', 'WIS'],
  'Empath': ['INF', 'WIS'],
  'Sorcerer': ['AUR', 'WIS'],
  'Ranger': ['DEX', 'INT'],
  'Bard': ['AUR', 'INF'],
  'Monk': ['STR', 'AGL'],
  'Paladin': ['STR', 'WIS'],
};

// Physical stats (used in PTP calculation)
const PHYSICAL_STATS: StatName[] = ['STR', 'CON', 'DEX', 'AGL'];

// Mental stats (used in MTP calculation)
const MENTAL_STATS: StatName[] = ['LOG', 'INT', 'WIS', 'INF'];

export interface TPEarnings {
  physicalTPs: number;
  mentalTPs: number;
  totalTPs: number;
}

/**
 * Calculate Training Points earned per level
 *
 * Formula:
 * PTPs = 25 + [(STR + CON + DEX + AGI + ((AUR + DIS) ÷ 2)) ÷ 20]
 * MTPs = 25 + [(LOG + INT + WIS + INF + ((AUR + DIS) ÷ 2)) ÷ 20]
 *
 * Prime requisite stats count DOUBLE in the calculation
 */
export function calculateTPsPerLevel(
  stats: Stats,
  profession: Profession
): TPEarnings {
  const primes = PRIME_REQUISITES[profession];

  // Physical TPs calculation
  let physicalStatTotal = 0;

  // Add physical stats (with prime doubling)
  for (const stat of PHYSICAL_STATS) {
    const statValue = stats[stat];
    const multiplier = primes.includes(stat) ? 2 : 1;
    physicalStatTotal += statValue * multiplier;
  }

  // Add hybrid stats (AUR and DIS are doubled if prime, THEN averaged)
  const aurValue = stats['AUR'] * (primes.includes('AUR') ? 2 : 1);
  const disValue = stats['DIS'] * (primes.includes('DIS') ? 2 : 1);
  const hybridValue = (aurValue + disValue) / 2;
  physicalStatTotal += hybridValue;

  const physicalTPs = 25 + Math.floor(physicalStatTotal / 20);

  // Mental TPs calculation
  let mentalStatTotal = 0;

  // Add mental stats (with prime doubling)
  for (const stat of MENTAL_STATS) {
    const statValue = stats[stat];
    const multiplier = primes.includes(stat) ? 2 : 1;
    mentalStatTotal += statValue * multiplier;
  }

  // Add hybrid stats (same calculation as physical)
  mentalStatTotal += hybridValue;

  const mentalTPs = 25 + Math.floor(mentalStatTotal / 20);

  return {
    physicalTPs,
    mentalTPs,
    totalTPs: physicalTPs + mentalTPs,
  };
}

/**
 * Calculate TPs earned across a level range with stat progression
 */
export function calculateTPsAcrossLevels(
  baseStats: Stats,
  statProgression: Record<number, Stats>, // Stats at each level
  profession: Profession,
  startLevel: number = 0,
  endLevel: number = 100
): Record<number, TPEarnings> {
  const tpsByLevel: Record<number, TPEarnings> = {};

  for (let level = startLevel; level <= endLevel; level++) {
    const statsAtLevel = statProgression[level] || baseStats;
    tpsByLevel[level] = calculateTPsPerLevel(statsAtLevel, profession);
  }

  return tpsByLevel;
}

/**
 * Calculate total TPs available from start to target (level or experience)
 * After level 100, TPs are earned every 2500 experience
 */
export function calculateTotalTPsAvailable(
  tpsByLevel: Record<number, TPEarnings>,
  startLevel: number,
  targetLevel: number,
  startXP: number = 0,
  targetXP: number = 0
): TPEarnings {
  let totalPhysical = 0;
  let totalMental = 0;

  // TPs earned from leveling (up to level 100)
  // Note: Characters start at level 0 and earn TPs at level 0
  const maxLevel = Math.min(targetLevel, 100);
  for (let level = startLevel; level <= maxLevel; level++) {
    const tps = tpsByLevel[level];
    if (tps) {
      totalPhysical += tps.physicalTPs;
      totalMental += tps.mentalTPs;
    }
  }

  // TPs earned from post-100 experience
  // After level 100, every 2500 XP grants 1 PTP + 1 MTP
  if (targetLevel >= 100 && targetXP > 0) {
    // XP for level 100 is 7,572,500 (from GemStone Wiki)
    const XP_AT_LEVEL_100 = 7572500;
    const XP_PER_TP = 2500;

    // Calculate starting post-100 XP
    const startPost100XP = startLevel >= 100 ? Math.max(0, startXP - XP_AT_LEVEL_100) : 0;
    const targetPost100XP = Math.max(0, targetXP - XP_AT_LEVEL_100);

    // TPs from post-100 experience
    const post100TPsEarned = Math.floor((targetPost100XP - startPost100XP) / XP_PER_TP);

    totalPhysical += post100TPsEarned;
    totalMental += post100TPsEarned;
  }

  return {
    physicalTPs: totalPhysical,
    mentalTPs: totalMental,
    totalTPs: totalPhysical + totalMental,
  };
}
