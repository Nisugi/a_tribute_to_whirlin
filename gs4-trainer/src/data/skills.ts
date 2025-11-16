/**
 * Skills Data
 * All trainable skills in GemStone IV, categorized by type
 * Includes 37 base skills plus lore sub-types and spell circles
 */

export type SkillCategory =
  | 'armor'
  | 'weapon'
  | 'combat'
  | 'magic'
  | 'elemental-lore'
  | 'spiritual-lore'
  | 'sorcerous-lore'
  | 'mental-lore'
  | 'general'
  | 'spell';

export interface SkillDefinition {
  id: string;
  name: string;
  category: SkillCategory;
  index: number; // Index in lookup tables
  description: string;
  parentIndex?: number; // For sub-skills that share a parent's lookup index
  isSubSkill?: boolean; // True if this is a sub-skill of a parent category
  professions?: string[]; // For spell circles: which professions can train this
}

export const SKILL_CATEGORIES: Record<SkillCategory, string> = {
  armor: 'Armor Skills',
  weapon: 'Weapon Skills',
  combat: 'Combat Skills',
  general: 'General Skills',
  magic: 'Magic Skills',
  spell: 'Spell Research',
  'elemental-lore': 'Elemental Lore',
  'spiritual-lore': 'Spiritual Lore',
  'sorcerous-lore': 'Sorcerous Lore',
  'mental-lore': 'Mental Lore',
};

export const SKILLS: SkillDefinition[] = [
  // Armor & Defense (0-1)
  {
    id: 'armor-use',
    name: 'Armor Use',
    category: 'armor',
    index: 0,
    description: 'Reduces hindrance from armor and improves damage absorption',
  },
  {
    id: 'shield-use',
    name: 'Shield Use',
    category: 'armor',
    index: 1,
    description: 'Improves defense and allows blocking attacks',
  },

  // Weapon Skills (2-9)
  {
    id: 'edged-weapons',
    name: 'Edged Weapons',
    category: 'weapon',
    index: 2,
    description: 'Training with swords, daggers, and other edged weapons',
  },
  {
    id: 'blunt-weapons',
    name: 'Blunt Weapons',
    category: 'weapon',
    index: 3,
    description: 'Training with hammers, maces, and other blunt weapons',
  },
  {
    id: 'two-handed-weapons',
    name: 'Two-Handed Weapons',
    category: 'weapon',
    index: 4,
    description: 'Training with claidhmores, mauls, and other two-handed weapons',
  },
  {
    id: 'ranged-weapons',
    name: 'Ranged Weapons',
    category: 'weapon',
    index: 5,
    description: 'Training with bows, crossbows, and other ranged weapons',
  },
  {
    id: 'thrown-weapons',
    name: 'Thrown Weapons',
    category: 'weapon',
    index: 6,
    description: 'Training with throwing daggers, axes, and other thrown weapons',
  },
  {
    id: 'polearm-weapons',
    name: 'Pole Arm Weapons',
    category: 'weapon',
    index: 7,
    description: 'Training with spears, halberds, and other polearm weapons',
  },
  {
    id: 'brawling',
    name: 'Brawling',
    category: 'weapon',
    index: 8,
    description: 'Training in unarmed combat and martial arts',
  },

  // Combat Skills (9-12)
  {
    id: 'two-weapon-combat',
    name: 'Two Weapon Combat',
    category: 'combat',
    index: 9,
    description: 'Ability to fight with a weapon in each hand',
  },
  {
    id: 'combat-maneuvers',
    name: 'Combat Maneuvers',
    category: 'combat',
    index: 10,
    description: 'Special combat abilities like disarm, feint, and trip',
  },
  {
    id: 'multi-opponent-combat',
    name: 'Multi-Opponent Combat',
    category: 'combat',
    index: 11,
    description: 'Reduces penalties when fighting multiple opponents',
  },
  {
    id: 'ambush',
    name: 'Ambush',
    category: 'combat',
    index: 12,
    description: 'Ability to strike at vital areas for increased damage',
  },

  // Combat Skills (continued - 13-14)
  {
    id: 'physical-fitness',
    name: 'Physical Fitness',
    category: 'combat',
    index: 13,
    description: 'Increases hit points and reduces encumbrance penalties',
  },
  {
    id: 'dodging',
    name: 'Dodging',
    category: 'combat',
    index: 14,
    description: 'Ability to avoid attacks through agility',
  },

  // General Skills (15-24)
  {
    id: 'climbing',
    name: 'Climbing',
    category: 'general',
    index: 15,
    description: 'Ability to climb obstacles and terrain',
  },
  {
    id: 'swimming',
    name: 'Swimming',
    category: 'general',
    index: 16,
    description: 'Ability to swim in water',
  },
  {
    id: 'disarm-traps',
    name: 'Disarming Traps',
    category: 'general',
    index: 17,
    description: 'Ability to disarm traps on boxes and doors',
  },
  {
    id: 'picking-locks',
    name: 'Picking Locks',
    category: 'general',
    index: 18,
    description: 'Ability to pick locks on boxes and doors',
  },
  {
    id: 'stalking-and-hiding',
    name: 'Stalking & Hiding',
    category: 'general',
    index: 19,
    description: 'Ability to move stealthily and remain hidden',
  },
  {
    id: 'perception',
    name: 'Perception',
    category: 'general',
    index: 20,
    description: 'Improves ability to notice hidden objects and creatures',
  },
  {
    id: 'first-aid',
    name: 'First Aid',
    category: 'general',
    index: 21,
    description: 'Ability to treat wounds, scars, and bleeding',
  },
  {
    id: 'trading',
    name: 'Trading',
    category: 'general',
    index: 22,
    description: 'Improves buying and selling prices with NPCs',
  },
  {
    id: 'pickpocketing',
    name: 'Picking Pockets',
    category: 'general',
    index: 23,
    description: 'Ability to steal from other characters',
  },
  {
    id: 'survival',
    name: 'Survival',
    category: 'general',
    index: 24,
    description: 'Ability to forage, skin, and survive in wilderness',
  },

  // Magic Skills (25-31)
  {
    id: 'arcane-symbols',
    name: 'Arcane Symbols',
    category: 'magic',
    index: 25,
    description: 'Ability to use magical scrolls and parchments',
  },
  {
    id: 'magic-item-use',
    name: 'Magic Item Use',
    category: 'magic',
    index: 26,
    description: 'Ability to use wands, rods, and other magical items',
  },
  {
    id: 'harness-power',
    name: 'Harness Power',
    category: 'magic',
    index: 27,
    description: 'Increases mana points and mana regeneration',
  },
  {
    id: 'spell-aiming',
    name: 'Spell Aiming',
    category: 'magic',
    index: 28,
    description: 'Improves accuracy with targeted spells',
  },
  {
    id: 'elemental-mana-control',
    name: 'Mana Control: Elemental',
    category: 'magic',
    index: 29,
    description: 'Ability to cast Elemental spells',
  },
  {
    id: 'spirit-mana-control',
    name: 'Mana Control: Spiritual',
    category: 'magic',
    index: 30,
    description: 'Ability to cast Spirit spells',
  },
  {
    id: 'mental-mana-control',
    name: 'Mana Control: Mental',
    category: 'magic',
    index: 31,
    description: 'Ability to cast Mental spells',
  },

  // Elemental Lore (parent index 33) - Sub-types
  // Note: These skills share a combined max ranks pool
  // Each has a unique index for training, but shares parentIndex for TP costs
  {
    id: 'air-lore',
    name: 'Elemental Lore: Air',
    category: 'elemental-lore',
    index: 1000,
    description: 'Knowledge of air, wind, and lightning',
    parentIndex: 33,
    isSubSkill: true,
  },
  {
    id: 'earth-lore',
    name: 'Elemental Lore: Earth',
    category: 'elemental-lore',
    index: 1001,
    description: 'Knowledge of earth, stone, and gems',
    parentIndex: 33,
    isSubSkill: true,
  },
  {
    id: 'fire-lore',
    name: 'Elemental Lore: Fire',
    category: 'elemental-lore',
    index: 1002,
    description: 'Knowledge of fire and heat',
    parentIndex: 33,
    isSubSkill: true,
  },
  {
    id: 'water-lore',
    name: 'Elemental Lore: Water',
    category: 'elemental-lore',
    index: 1003,
    description: 'Knowledge of water and ice',
    parentIndex: 33,
    isSubSkill: true,
  },

  // Spiritual Lore (parent index 34) - Sub-types
  // Note: These skills share a combined max ranks pool
  // Each has a unique index for training, but shares parentIndex for TP costs
  {
    id: 'blessings-lore',
    name: 'Spiritual Lore: Blessings',
    category: 'spiritual-lore',
    index: 1004,
    description: 'Knowledge of divine blessings and consecration',
    parentIndex: 34,
    isSubSkill: true,
  },
  {
    id: 'religion-lore',
    name: 'Spiritual Lore: Religion',
    category: 'spiritual-lore',
    index: 1005,
    description: 'Knowledge of deities and religious practices',
    parentIndex: 34,
    isSubSkill: true,
  },
  {
    id: 'summoning-lore',
    name: 'Spiritual Lore: Summoning',
    category: 'spiritual-lore',
    index: 1006,
    description: 'Knowledge of summoning and familiar spirits',
    parentIndex: 34,
    isSubSkill: true,
  },

  // Sorcerous Lore (parent index 35) - Sub-types
  // Note: These skills share a combined max ranks pool
  // Each has a unique index for training, but shares parentIndex for TP costs
  {
    id: 'demonology-lore',
    name: 'Sorcerous Lore: Demonology',
    category: 'sorcerous-lore',
    index: 1007,
    description: 'Knowledge of demons and dark pacts',
    parentIndex: 35,
    isSubSkill: true,
  },
  {
    id: 'necromancy-lore',
    name: 'Sorcerous Lore: Necromancy',
    category: 'sorcerous-lore',
    index: 1008,
    description: 'Knowledge of death magic and undead',
    parentIndex: 35,
    isSubSkill: true,
  },

  // Mental Lore (parent index 36) - Sub-types
  // Note: These skills share a combined max ranks pool
  // Each has a unique index for training, but shares parentIndex for TP costs
  {
    id: 'divination-lore',
    name: 'Mental Lore: Divination',
    category: 'mental-lore',
    index: 1009,
    description: 'Knowledge of seeing and prophecy',
    parentIndex: 36,
    isSubSkill: true,
  },
  {
    id: 'manipulation-lore',
    name: 'Mental Lore: Manipulation',
    category: 'mental-lore',
    index: 1010,
    description: 'Knowledge of controlling minds and objects',
    parentIndex: 36,
    isSubSkill: true,
  },
  {
    id: 'telepathy-lore',
    name: 'Mental Lore: Telepathy',
    category: 'mental-lore',
    index: 1011,
    description: 'Knowledge of mind-reading and mental communication',
    parentIndex: 36,
    isSubSkill: true,
  },
  {
    id: 'transference-lore',
    name: 'Mental Lore: Transference',
    category: 'mental-lore',
    index: 1012,
    description: 'Knowledge of transferring energy and life force',
    parentIndex: 36,
    isSubSkill: true,
  },
  {
    id: 'transformation-lore',
    name: 'Mental Lore: Transformation',
    category: 'mental-lore',
    index: 1013,
    description: 'Knowledge of shapeshifting and alteration',
    parentIndex: 36,
    isSubSkill: true,
  },

  // Spell Research (parent index 32)
  // Note: All spell circles use Spell Research (index 32) for TP costs and training limits
  // Training limits apply across all spell circles combined
  // Only spell circles available to the character's profession are shown
  // Each has a unique index for training, but shares parentIndex for TP costs

  // Minor Spell Circles
  {
    id: 'minor-spiritual',
    name: 'Minor Spiritual Spell Research',
    category: 'spell',
    index: 1014,
    description: 'Basic spiritual magic spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Warrior', 'Rogue', 'Monk', 'Cleric', 'Empath', 'Ranger', 'Paladin'],
  },
  {
    id: 'minor-elemental',
    name: 'Minor Elemental Spell Research',
    category: 'spell',
    index: 1015,
    description: 'Basic elemental magic spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Warrior', 'Rogue', 'Wizard', 'Sorcerer', 'Bard'],
  },
  {
    id: 'minor-mental',
    name: 'Minor Mental Spell Research',
    category: 'spell',
    index: 1016,
    description: 'Basic mental magic spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Monk'],
  },

  // Major Spell Circles
  {
    id: 'major-elemental',
    name: 'Major Elemental Spell Research',
    category: 'spell',
    index: 1017,
    description: 'Advanced elemental magic spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Wizard'],
  },
  {
    id: 'major-spiritual',
    name: 'Major Spiritual Spell Research',
    category: 'spell',
    index: 1018,
    description: 'Advanced spiritual magic spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Cleric', 'Empath'],
  },

  // Profession Base Spell Circles
  {
    id: 'wizard-base',
    name: 'Wizard Base Spell Research',
    category: 'spell',
    index: 1019,
    description: 'Wizard profession spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Wizard'],
  },
  {
    id: 'sorcerer-base',
    name: 'Sorcerer Base Spell Research',
    category: 'spell',
    index: 1020,
    description: 'Sorcerer profession spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Sorcerer'],
  },
  {
    id: 'cleric-base',
    name: 'Cleric Base Spell Research',
    category: 'spell',
    index: 1021,
    description: 'Cleric profession spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Cleric'],
  },
  {
    id: 'empath-base',
    name: 'Empath Base Spell Research',
    category: 'spell',
    index: 1022,
    description: 'Empath profession spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Empath'],
  },
  {
    id: 'ranger-base',
    name: 'Ranger Base Spell Research',
    category: 'spell',
    index: 1023,
    description: 'Ranger profession spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Ranger'],
  },
  {
    id: 'bard-base',
    name: 'Bard Base Spell Research',
    category: 'spell',
    index: 1024,
    description: 'Bard profession spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Bard'],
  },
  {
    id: 'paladin-base',
    name: 'Paladin Base Spell Research',
    category: 'spell',
    index: 1025,
    description: 'Paladin profession spells',
    parentIndex: 32,
    isSubSkill: true,
    professions: ['Paladin'],
  },
];

// Map skill ID to skill definition for easy lookup
export const SKILL_BY_ID: Record<string, SkillDefinition> = SKILLS.reduce(
  (acc, skill) => {
    acc[skill.id] = skill;
    return acc;
  },
  {} as Record<string, SkillDefinition>
);

// Map skill index to skill definition for table lookups
export const SKILL_BY_INDEX: Record<number, SkillDefinition> = SKILLS.reduce(
  (acc, skill) => {
    acc[skill.index] = skill;
    return acc;
  },
  {} as Record<number, SkillDefinition>
);

// Group skills by category
export const SKILLS_BY_CATEGORY: Record<SkillCategory, SkillDefinition[]> =
  SKILLS.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<SkillCategory, SkillDefinition[]>);
