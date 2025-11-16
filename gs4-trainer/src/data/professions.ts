/**
 * Profession Data
 * Descriptions and details for all GemStone IV professions
 */

import type { Profession } from '../types';

export interface ProfessionInfo {
  id: Profession;
  name: string;
  description: string;
  primeStats: string[];
  strengths: string[];
  trainingCosts: 'Square' | 'Semi' | 'Profession-specific';
}

export const PROFESSION_DATA: Record<Profession, ProfessionInfo> = {
  Warrior: {
    id: 'Warrior',
    name: 'Warrior',
    description: 'Masters of physical combat with unparalleled weapon skills and armor training.',
    primeStats: ['STR', 'CON', 'DEX'],
    strengths: ['Physical combat', 'High HP', 'All weapons', 'Heavy armor'],
    trainingCosts: 'Square',
  },
  Rogue: {
    id: 'Rogue',
    name: 'Rogue',
    description: 'Stealthy specialists in ambush, lockpicking, and cunning combat techniques.',
    primeStats: ['DEX', 'AGL', 'INT'],
    strengths: ['Ambush', 'Stealth', 'Lockpicking', 'Disarming traps'],
    trainingCosts: 'Square',
  },
  Wizard: {
    id: 'Wizard',
    name: 'Wizard',
    description: 'Pure arcane spellcasters wielding elemental magic and powerful enchantments.',
    primeStats: ['LOG', 'INT', 'AUR'],
    strengths: ['Elemental magic', 'Spell research', 'Mana control', 'Arcane lore'],
    trainingCosts: 'Square',
  },
  Cleric: {
    id: 'Cleric',
    name: 'Cleric',
    description: 'Divine spellcasters channeling spiritual power for healing and protection.',
    primeStats: ['WIS', 'AUR', 'INT'],
    strengths: ['Healing', 'Spiritual magic', 'Undead turning', 'Defensive spells'],
    trainingCosts: 'Square',
  },
  Empath: {
    id: 'Empath',
    name: 'Empath',
    description: 'Healers who transfer wounds to themselves to cure others.',
    primeStats: ['WIS', 'INF', 'AUR'],
    strengths: ['Wound transfer', 'Empathic healing', 'Mental magic', 'Support'],
    trainingCosts: 'Square',
  },
  Sorcerer: {
    id: 'Sorcerer',
    name: 'Sorcerer',
    description: 'Dark magic practitioners wielding necromancy and demon summoning.',
    primeStats: ['AUR', 'LOG', 'WIS'],
    strengths: ['Necromancy', 'Demon summoning', 'Curses', 'Dark magic'],
    trainingCosts: 'Square',
  },
  Ranger: {
    id: 'Ranger',
    name: 'Ranger',
    description: 'Wilderness warriors combining nature magic with archery and tracking.',
    primeStats: ['DEX', 'INT', 'CON'],
    strengths: ['Archery', 'Nature magic', 'Tracking', 'Survival'],
    trainingCosts: 'Semi',
  },
  Bard: {
    id: 'Bard',
    name: 'Bard',
    description: 'Musical spellcasters using songs to enchant, inspire, and control.',
    primeStats: ['AUR', 'INF', 'DEX'],
    strengths: ['Song magic', 'Lore', 'Influence', 'Versatility'],
    trainingCosts: 'Semi',
  },
  Monk: {
    id: 'Monk',
    name: 'Monk',
    description: 'Martial artists channeling ki energy for unarmed combat and spiritual power.',
    primeStats: ['STR', 'AGL', 'WIS'],
    strengths: ['Unarmed combat', 'Ki powers', 'Dodge', 'Spiritual training'],
    trainingCosts: 'Semi',
  },
  Paladin: {
    id: 'Paladin',
    name: 'Paladin',
    description: 'Holy warriors combining martial prowess with divine magic.',
    primeStats: ['STR', 'WIS', 'AUR'],
    strengths: ['Combat', 'Divine magic', 'Smiting', 'Protection'],
    trainingCosts: 'Semi',
  },
  Savant: {
    id: 'Savant',
    name: 'Savant',
    description: 'Versatile hybrids balancing mental and physical disciplines.',
    primeStats: ['WIS', 'INT', 'DIS'],
    strengths: ['Versatility', 'Mental magic', 'Skill variety', 'Adaptation'],
    trainingCosts: 'Profession-specific',
  },
};

export const PROFESSIONS_LIST = Object.values(PROFESSION_DATA);
