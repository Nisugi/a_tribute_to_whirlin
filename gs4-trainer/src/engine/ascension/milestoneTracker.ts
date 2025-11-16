/**
 * Ascension Milestone Tracker
 * Defines and calculates milestone ATPs
 */

import type { AscensionMilestones } from '../../types';

export interface MilestoneDefinition {
  id: keyof AscensionMilestones;
  label: string;
  description: string;
  atpReward: number;
  category: 'level' | 'achievement';
}

/**
 * All available ascension milestones
 */
export const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  // Level Milestones
  {
    id: 'level20',
    label: 'Level 20',
    description: 'Reach level 20 (Ascension eligibility)',
    atpReward: 1,
    category: 'level',
  },
  {
    id: 'level40',
    label: 'Level 40',
    description: 'Reach level 40',
    atpReward: 1,
    category: 'level',
  },
  {
    id: 'level60',
    label: 'Level 60',
    description: 'Reach level 60',
    atpReward: 1,
    category: 'level',
  },
  {
    id: 'level80',
    label: 'Level 80',
    description: 'Reach level 80',
    atpReward: 1,
    category: 'level',
  },
  {
    id: 'level100',
    label: 'Level 100',
    description: 'Reach level 100 (cap)',
    atpReward: 1,
    category: 'level',
  },

  // Achievement Milestones
  {
    id: 'bountyPoints',
    label: 'Bounty Master',
    description: 'Earn 1,000,000 Bounty Points',
    atpReward: 1,
    category: 'achievement',
  },
  {
    id: 'artisanGuild',
    label: 'Artisan Guild Master',
    description: 'Master all artisan guild skills',
    atpReward: 1,
    category: 'achievement',
  },
  {
    id: 'classSpecific1',
    label: 'Class Achievement I',
    description: 'Complete profession-specific achievement I',
    atpReward: 1,
    category: 'achievement',
  },
  {
    id: 'classSpecific2',
    label: 'Class Achievement II',
    description: 'Complete profession-specific achievement II',
    atpReward: 1,
    category: 'achievement',
  },
  {
    id: 'classSpecific3',
    label: 'Class Achievement III',
    description: 'Complete profession-specific achievement III',
    atpReward: 1,
    category: 'achievement',
  },
];

/**
 * Calculate total milestone ATPs earned
 */
export function calculateMilestoneATPs(milestones: AscensionMilestones): number {
  let total = 0;

  for (const milestone of MILESTONE_DEFINITIONS) {
    if (milestones[milestone.id]) {
      total += milestone.atpReward;
    }
  }

  return total;
}

/**
 * Get milestones grouped by category
 */
export function getMilestonesByCategory() {
  const levelMilestones = MILESTONE_DEFINITIONS.filter((m) => m.category === 'level');
  const achievementMilestones = MILESTONE_DEFINITIONS.filter((m) => m.category === 'achievement');

  return {
    level: levelMilestones,
    achievement: achievementMilestones,
  };
}

/**
 * Create default milestones object (all false)
 */
export function createDefaultMilestones(): AscensionMilestones {
  return {
    level20: false,
    level40: false,
    level60: false,
    level80: false,
    level100: false,
    bountyPoints: false,
    artisanGuild: false,
    classSpecific1: false,
    classSpecific2: false,
    classSpecific3: false,
  };
}

/**
 * Auto-set level milestones based on current character level
 */
export function autoSetLevelMilestones(
  currentLevel: number,
  existingMilestones: AscensionMilestones
): AscensionMilestones {
  return {
    ...existingMilestones,
    level20: currentLevel >= 20,
    level40: currentLevel >= 40,
    level60: currentLevel >= 60,
    level80: currentLevel >= 80,
    level100: currentLevel >= 100,
  };
}
