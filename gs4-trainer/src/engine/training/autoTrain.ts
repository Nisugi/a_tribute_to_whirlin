/**
 * Auto-Train Algorithm
 * Distributes skill training across levels based on frequency and TP budget
 */

import type { Profession, TrainingPlan } from '../../types';
import { getSkillCost, getMaxRanks } from './tpCalculator';
import type { TPEarnings } from './tpEarnings';

export interface LevelTraining {
  level: number;
  skillRanks: Record<number, number>; // skillIndex -> ranks gained this level
  tpSpent: {
    physical: number;
    mental: number;
    total: number;
  };
  tpAvailable: TPEarnings;
  tpRemaining: {
    physical: number;
    mental: number;
    total: number;
  };
  overBudget: boolean;
}

export interface AutoTrainResult {
  trainingByLevel: Record<number, LevelTraining>;
  totalTPsSpent: {
    physical: number;
    mental: number;
    total: number;
  };
  warnings: string[];
  errors: string[];
}

/**
 * Calculate which levels to train a skill based on frequency
 *
 * Examples:
 * - frequency = 1: train every level [0, 1, 2, 3, 4, ...]
 * - frequency = 2: train twice every level [0, 0, 1, 1, 2, 2, ...]
 * - frequency = 0.5: train once every 2 levels [1, 3, 5, 7, ...]
 * - frequency = 0.25: train once every 4 levels [3, 7, 11, 15, ...]
 * - frequency = 1.5: train 3 times every 2 levels [0, 1, 1, 2, 3, 3, ...]
 */
function calculateTrainingSchedule(
  frequency: number,
  startLevel: number,
  endLevel: number
): Record<number, number> {
  const schedule: Record<number, number> = {};

  if (frequency <= 0) return schedule;

  let accumulatedTraining = 0;

  // Include startLevel in the training schedule (accounts for level 0)
  for (let level = startLevel; level <= endLevel; level++) {
    accumulatedTraining += frequency;
    const ranksThisLevel = Math.floor(accumulatedTraining);

    if (ranksThisLevel > 0) {
      schedule[level] = ranksThisLevel;
      accumulatedTraining -= ranksThisLevel;
    }
  }

  return schedule;
}

/**
 * Auto-train algorithm
 * Distributes skill training across levels based on frequencies and TP budgets
 */
export function autoTrain(
  trainingPlan: TrainingPlan,
  profession: Profession,
  tpsByLevel: Record<number, TPEarnings>,
  startLevel: number,
  targetLevel: number
): AutoTrainResult {
  const trainingByLevel: Record<number, LevelTraining> = {};
  const warnings: string[] = [];
  const errors: string[] = [];

  let totalPhysicalSpent = 0;
  let totalMentalSpent = 0;

  // Initialize each level (including startLevel to account for level 0)
  for (let level = startLevel; level <= targetLevel; level++) {
    trainingByLevel[level] = {
      level,
      skillRanks: {},
      tpSpent: { physical: 0, mental: 0, total: 0 },
      tpAvailable: tpsByLevel[level] || { physicalTPs: 0, mentalTPs: 0, totalTPs: 0 },
      tpRemaining: {
        physical: tpsByLevel[level]?.physicalTPs || 0,
        mental: tpsByLevel[level]?.mentalTPs || 0,
        total: tpsByLevel[level]?.totalTPs || 0,
      },
      overBudget: false,
    };
  }

  // Track which skills exceeded max ranks (for condensed warnings)
  const cappedSkills = new Set<number>();

  // Process each skill's training schedule
  for (const [skillIndexStr, skillData] of Object.entries(trainingPlan)) {
    const skillIndex = parseInt(skillIndexStr);
    const { frequency } = skillData;

    if (!frequency || frequency <= 0) continue;

    // Calculate when this skill trains
    const schedule = calculateTrainingSchedule(frequency, startLevel, targetLevel);

    // Accumulate ranks and calculate costs
    let cumulativeRanks = skillData.currentRanks || 0;

    for (const [levelStr, ranksGained] of Object.entries(schedule)) {
      const level = parseInt(levelStr);

      if (!trainingByLevel[level]) continue;

      // Check if we exceed max ranks
      const maxRanks = getMaxRanks(skillIndex, profession, level);
      const newRanks = cumulativeRanks + ranksGained;

      if (newRanks > maxRanks) {
        cappedSkills.add(skillIndex);
        // Cap at max
        const actualRanks = Math.min(ranksGained, maxRanks - cumulativeRanks);
        if (actualRanks <= 0) continue;

        trainingByLevel[level].skillRanks[skillIndex] = actualRanks;
        cumulativeRanks += actualRanks;
      } else {
        trainingByLevel[level].skillRanks[skillIndex] = ranksGained;
        cumulativeRanks += ranksGained;
      }

      // Calculate TP cost
      const cost = getSkillCost(skillIndex, profession);
      const ranksAdded = trainingByLevel[level].skillRanks[skillIndex];

      const physicalCost = cost.ptp * ranksAdded;
      const mentalCost = cost.mtp * ranksAdded;

      trainingByLevel[level].tpSpent.physical += physicalCost;
      trainingByLevel[level].tpSpent.mental += mentalCost;
      trainingByLevel[level].tpSpent.total += (physicalCost + mentalCost);

      totalPhysicalSpent += physicalCost;
      totalMentalSpent += mentalCost;
    }
  }

  // Add condensed warning for capped skills
  if (cappedSkills.size > 0) {
    warnings.push(`${cappedSkills.size} skill(s) exceeded max ranks and were capped`);
  }

  // Check budget and calculate remaining TPs for each level
  let levelsOverPTP = 0;
  let levelsOverMTP = 0;
  let totalPTPOverage = 0;
  let totalMTPOverage = 0;

  for (let level = startLevel + 1; level <= targetLevel; level++) {
    const levelData = trainingByLevel[level];

    levelData.tpRemaining.physical = levelData.tpAvailable.physicalTPs - levelData.tpSpent.physical;
    levelData.tpRemaining.mental = levelData.tpAvailable.mentalTPs - levelData.tpSpent.mental;
    levelData.tpRemaining.total = levelData.tpRemaining.physical + levelData.tpRemaining.mental;

    // Check if over budget
    if (levelData.tpSpent.physical > levelData.tpAvailable.physicalTPs) {
      levelData.overBudget = true;
      levelsOverPTP++;
      totalPTPOverage += (levelData.tpSpent.physical - levelData.tpAvailable.physicalTPs);
    }

    if (levelData.tpSpent.mental > levelData.tpAvailable.mentalTPs) {
      levelData.overBudget = true;
      levelsOverMTP++;
      totalMTPOverage += (levelData.tpSpent.mental - levelData.tpAvailable.mentalTPs);
    }
  }

  // Add condensed error messages
  if (levelsOverPTP > 0) {
    errors.push(`${levelsOverPTP} level(s) over Physical TP budget (total overage: ${totalPTPOverage} PTPs)`);
  }
  if (levelsOverMTP > 0) {
    errors.push(`${levelsOverMTP} level(s) over Mental TP budget (total overage: ${totalMTPOverage} MTPs)`);
  }

  return {
    trainingByLevel,
    totalTPsSpent: {
      physical: totalPhysicalSpent,
      mental: totalMentalSpent,
      total: totalPhysicalSpent + totalMentalSpent,
    },
    warnings,
    errors,
  };
}

/**
 * Calculate target ranks based on frequency
 * Target ranks = frequency × (current level + 1)
 * Note: Accounts for training at level 0 through current level
 * Example: Level 50, frequency 2x → (50+1) * 2 = 102 total ranks
 */
export function calculateTargetRanksFromFrequency(
  frequency: number,
  currentLevel: number
): number {
  return Math.floor(frequency * (currentLevel + 1));
}
