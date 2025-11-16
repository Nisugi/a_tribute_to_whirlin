/**
 * Core TypeScript types for GS4 Trainer
 * Based on Whirlin_Trainer_2025.1.VBA.xlsm structure
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const PROFESSIONS = [
  'Warrior',
  'Rogue',
  'Wizard',
  'Cleric',
  'Empath',
  'Sorcerer',
  'Ranger',
  'Bard',
  'Monk',
  'Paladin',
] as const;

export type Profession = typeof PROFESSIONS[number];

export const RACES = [
  'Aelotoi',
  'Burghal Gnome',
  'Dark Elf',
  'Dwarf',
  'Elf',
  'Erithian',
  'Forest Gnome',
  'Giantman',
  'Half-Elf',
  'Half-Krolvin',
  'Halfling',
  'Human',
  'Sylvankind',
] as const;

export type Race = typeof RACES[number];

export const STATS = ['STR', 'CON', 'DEX', 'AGL', 'DIS', 'AUR', 'LOG', 'INT', 'WIS', 'INF'] as const;
export type StatName = typeof STATS[number];

export type Stats = Record<StatName, number>;

// ============================================================================
// CHARACTER DATA STRUCTURES
// ============================================================================

export interface GrowthRate {
  rate: number; // e.g., 4 means "1 per 4 levels"
}

export type StatGrowthRates = Record<StatName, GrowthRate>;

export interface Character {
  id: string;
  name: string;
  profession: Profession;
  race: Race;
  currentXP: number;
  ascensionXP: number;  // Ascension experience (adds to total)
  currentLevel: number;
  targetXP: number;  // Target experience (for post-100 TP calculations)
  targetLevel: number;

  // Base stats (must sum to 660)
  baseStats: Stats;

  // Growth rates for each stat (1 per X levels)
  statGrowthRates: StatGrowthRates;

  // Training plan
  training: TrainingPlan;

  // Ascension data
  ascension: AscensionData;

  // Active enhancive set ID
  enhanciveSetId: string | null;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TRAINING DATA STRUCTURES
// ============================================================================

export interface SkillCategory {
  id: string;
  name: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: 'combat',
    name: 'Combat Skills',
    skills: [
      'Armor Use',
      'Shield Use',
      'Edged Weapons',
      'Blunt Weapons',
      'Two-Handed Weapons',
      'Ranged Weapons',
      'Thrown Weapons',
      'Polearm Weapons',
      'Brawling',
      'Two Weapon Combat',
      'Combat Maneuvers',
      'Multi-Opponent Combat',
      'Ambush',
      'Physical Fitness',
      'Dodging',
    ],
  },
  {
    id: 'magic',
    name: 'Magic Skills',
    skills: [
      'Arcane Symbols',
      'Magic Item Use',
      'Spell Aiming',
      'Harness Power',
      'Elemental Mana Control',
      'Spirit Mana Control',
      'Mental Mana Control',
    ],
  },
  {
    id: 'lore',
    name: 'Lore Skills',
    skills: [
      'Elemental Lore, Air',
      'Elemental Lore, Earth',
      'Elemental Lore, Fire',
      'Elemental Lore, Water',
      'Spiritual Lore, Blessings',
      'Spiritual Lore, Religion',
      'Spiritual Lore, Summoning',
      'Sorcerous Lore, Demonology',
      'Sorcerous Lore, Necromancy',
      'Mental Lore, Divination',
      'Mental Lore, Manipulation',
      'Mental Lore, Telepathy',
      'Mental Lore, Transference',
      'Mental Lore, Transformation',
    ],
  },
  {
    id: 'general',
    name: 'General Skills',
    skills: [
      'Climbing',
      'Swimming',
      'Disarm Traps',
      'Picking Locks',
      'Stalking and Hiding',
      'Perception',
      'First Aid',
      'Trading',
      'Pickpocketing',
      'Survival',
    ],
  },
  {
    id: 'spells',
    name: 'Spell Research',
    skills: [
      'Spell Research',
    ],
  },
];

export interface SkillRanks {
  currentRanks: number;     // Current ranks at current level
  targetRanks: number;      // Target ranks at target level
  frequency: number;        // Training frequency (1 = once/level, 2 = twice/level, 0.5 = once/2 levels, etc.)
  ranksByLevel?: number[];  // Actual ranks at each level (populated by auto-train)
}

// Training plan maps skill index (0-36) to skill ranks
export type TrainingPlan = Record<number, SkillRanks>;

// ============================================================================
// ASCENSION DATA STRUCTURES
// ============================================================================

export interface AscensionData {
  totalExperience: number;
  milestones: {
    firstAscension: boolean;
    secondAscension: boolean;
    thirdAscension: boolean;
  };
  bonuses: Stats;
}

// ============================================================================
// ENHANCIVE DATA STRUCTURES
// ============================================================================

export interface EnhanciveItem {
  id: string;
  name: string;
  slot: string;
  bonuses: Partial<Stats>;
  cost?: number;
  notes?: string;
}

export interface EnhanciveSet {
  id: string;
  name: string;
  items: EnhanciveItem[];
  totalBonuses: Stats;
}

// ============================================================================
// LOOKUP TABLES
// ============================================================================

export interface XPChartEntry {
  level: number;
  xpRequired: number;
}

export interface TrainingCostTable {
  skill: string;
  profession: Profession;
  ptp: number; // Physical Training Points
  mtp: number; // Mental Training Points
}

export interface RacialStatBonus {
  race: Race;
  bonuses: Stats;
}

export interface ProfessionStatBonus {
  profession: Profession;
  bonuses: Stats;
}

// ============================================================================
// GAME DATA (Static Reference Data)
// ============================================================================

export interface GameData {
  xpChart: XPChartEntry[];
  trainingCosts: TrainingCostTable[];
  racialBonuses: RacialStatBonus[];
  professionBonuses: ProfessionStatBonus[];

  // Named ranges from Excel
  namedRanges: {
    GI_Autofill: any[][];
    TBL_Skill_PTP: any[][];
    TBL_Skill_MTP: any[][];
    TBL_EXP_Chart: any[][];
    TBL_GI_PROF: any[][];
    TBL_GI_RACE: any[][];
    [key: string]: any[][];
  };
}

// ============================================================================
// CALCULATION RESULTS
// ============================================================================

export interface CombatStats {
  defensiveStrength: number;
  attackStrength: number;
  aimingBonus: number;
  healthPoints: number;
  targetDefense: number;
}

export interface StatProgression {
  level: number;
  stats: Stats;
}

// ============================================================================
// UI STATE
// ============================================================================

export interface UIState {
  currentView: 'character' | 'stats' | 'training' | 'enhancives' | 'ascension' | 'calculators' | 'tables';
  isBeginnerMode: boolean;
  sidebarCollapsed: boolean;
}

// ============================================================================
// EXCEL IMPORT/EXPORT
// ============================================================================

export interface ExcelImportResult {
  character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;
  success: boolean;
  errors: string[];
}
