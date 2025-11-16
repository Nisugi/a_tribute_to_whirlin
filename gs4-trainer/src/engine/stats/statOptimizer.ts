/**
 * Stat Optimizer
 * Calculates optimal base stat placement to reach 100 in all stats at level 100
 */

import { calculateStatProgression } from './statsCalculator';
import type { StatName, Stats } from '../../types';

const STAT_NAMES: StatName[] = ['STR', 'CON', 'DEX', 'AGL', 'DIS', 'AUR', 'LOG', 'INT', 'WIS', 'INF'];
const TOTAL_STAT_POINTS = 660;
const TARGET_LEVEL = 100;
const MAX_STAT = 100;

/**
 * Find the minimum base stat needed to reach target stat at target level
 */
function findMinimumBaseStat(
  growthRate: number,
  targetLevel: number = TARGET_LEVEL,
  targetStat: number = MAX_STAT
): number {
  // Binary search for the minimum base stat
  let low = 1;
  let high = MAX_STAT;
  let result = MAX_STAT;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const progression = calculateStatProgression(mid, growthRate, targetLevel);
    const finalStat = progression[targetLevel];

    if (finalStat >= targetStat) {
      result = mid;
      high = mid - 1; // Try lower
    } else {
      low = mid + 1; // Need higher
    }
  }

  return result;
}

/**
 * Calculate optimal base stats to reach 100 in all stats at level 100
 * Uses INF as dump stat for remaining points
 */
export function calculateOptimalStats(
  growthRates: Record<StatName, number>
): Stats {
  const optimizedStats: Partial<Stats> = {};
  let totalUsed = 0;

  // Calculate minimum needed for each stat except INF
  for (const stat of STAT_NAMES) {
    if (stat === 'INF') continue; // Save INF for last as dump stat

    const growthRate = growthRates[stat];
    const minStat = findMinimumBaseStat(growthRate);
    optimizedStats[stat] = minStat;
    totalUsed += minStat;
  }

  // Put remaining points in INF (dump stat)
  const remainingPoints = TOTAL_STAT_POINTS - totalUsed;
  optimizedStats['INF'] = Math.max(1, Math.min(MAX_STAT, remainingPoints));

  // Adjust if we somehow went over (shouldn't happen, but safety check)
  const actualTotal = Object.values(optimizedStats).reduce((sum, val) => sum + (val || 0), 0);
  if (actualTotal !== TOTAL_STAT_POINTS) {
    // If we're short or over, adjust INF
    optimizedStats['INF'] = TOTAL_STAT_POINTS - totalUsed;
  }

  return optimizedStats as Stats;
}

/**
 * Calculate how many "wasted" points a stat allocation has
 * (points that push stats over 100 at level 100)
 */
export function calculateWastedPoints(
  baseStats: Stats,
  growthRates: Record<StatName, number>,
  targetLevel: number = TARGET_LEVEL
): number {
  let wasted = 0;

  for (const stat of STAT_NAMES) {
    const progression = calculateStatProgression(
      baseStats[stat],
      growthRates[stat],
      targetLevel
    );
    const finalStat = progression[targetLevel];

    if (finalStat > MAX_STAT) {
      // Any points over 100 at final level are wasted
      wasted += (finalStat - MAX_STAT);
    }
  }

  return wasted;
}

/**
 * Validate that base stats sum to exactly 660
 */
export function validateStatTotal(stats: Stats): boolean {
  const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
  return total === TOTAL_STAT_POINTS;
}

/**
 * Get a breakdown of final stats at target level
 */
export function getStatProjection(
  baseStats: Stats,
  growthRates: Record<StatName, number>,
  targetLevel: number = TARGET_LEVEL
): { stat: StatName; base: number; final: number; growth: number; capped: boolean }[] {
  return STAT_NAMES.map(stat => {
    const progression = calculateStatProgression(
      baseStats[stat],
      growthRates[stat],
      targetLevel
    );
    const finalStat = progression[targetLevel];
    const growth = finalStat - baseStats[stat];
    const capped = finalStat >= MAX_STAT;

    return {
      stat,
      base: baseStats[stat],
      final: Math.min(finalStat, MAX_STAT),
      growth,
      capped,
    };
  });
}
