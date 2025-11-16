/**
 * Race Data
 * Descriptions and stat bonuses for all GemStone IV races
 */

import type { Race, Stats } from '../types';

export interface RaceInfo {
  id: Race;
  name: string;
  description: string;
  statBonuses: Stats;
  features: string[];
}

export const RACE_DATA: Record<Race, RaceInfo> = {
  Human: {
    id: 'Human',
    name: 'Human',
    description: 'Versatile and adaptable, humans excel in any profession.',
    statBonuses: { STR: 0, CON: 0, DEX: 0, AGL: 0, DIS: 0, AUR: 0, LOG: 0, INT: 0, WIS: 0, INF: 0 },
    features: ['No stat penalties', 'Balanced growth', 'Profession flexibility'],
  },
  Giantman: {
    id: 'Giantman',
    name: 'Giantman',
    description: 'Towering and powerful, giantmen dominate in physical prowess.',
    statBonuses: { STR: 15, CON: 10, DEX: -5, AGL: -5, DIS: 5, AUR: 0, LOG: -5, INT: 0, WIS: 5, INF: -10 },
    features: ['High strength', 'Excellent HP', 'Strong warriors'],
  },
  Halfling: {
    id: 'Halfling',
    name: 'Halfling',
    description: 'Small but agile, halflings make excellent rogues and rangers.',
    statBonuses: { STR: -15, CON: 10, DEX: 5, AGL: 15, DIS: 5, AUR: 0, LOG: 0, INT: -5, WIS: 0, INF: -5 },
    features: ['High agility', 'Good reflexes', 'Small size advantage'],
  },
  Dwarf: {
    id: 'Dwarf',
    name: 'Dwarf',
    description: 'Hardy and resilient, dwarves are natural warriors and clerics.',
    statBonuses: { STR: 10, CON: 15, DEX: -5, AGL: -5, DIS: 5, AUR: 0, LOG: 0, INT: -10, WIS: 10, INF: -10 },
    features: ['High constitution', 'Disease resistance', 'Mining expertise'],
  },
  Elf: {
    id: 'Elf',
    name: 'Elf',
    description: 'Graceful and intelligent, elves excel as wizards and rangers.',
    statBonuses: { STR: -5, CON: -10, DEX: 5, AGL: 10, DIS: 0, AUR: 10, LOG: 10, INT: 0, WIS: -5, INF: -5 },
    features: ['High logic', 'Natural magic', 'Keen senses'],
  },
  'Dark Elf': {
    id: 'Dark Elf',
    name: 'Dark Elf',
    description: 'Mystical and cunning, dark elves master sorcery and stealth.',
    statBonuses: { STR: -5, CON: -10, DEX: 10, AGL: 5, DIS: 5, AUR: 10, LOG: 0, INT: 5, WIS: -10, INF: 0 },
    features: ['Dark vision', 'Sorcery affinity', 'Stealth bonus'],
  },
  Sylvankind: {
    id: 'Sylvankind',
    name: 'Sylvankind',
    description: 'Forest-dwelling cousins of elves, attuned to nature.',
    statBonuses: { STR: -5, CON: -5, DEX: 10, AGL: 10, DIS: 5, AUR: 5, LOG: 0, INT: -5, WIS: 5, INF: -10 },
    features: ['Forest movement', 'Nature affinity', 'Archery bonus'],
  },
  'Half-Elf': {
    id: 'Half-Elf',
    name: 'Half-Elf',
    description: 'Balanced between human and elf, versatile in most roles.',
    statBonuses: { STR: -5, CON: -5, DEX: 5, AGL: 5, DIS: 0, AUR: 5, LOG: 5, INT: 0, WIS: -5, INF: 0 },
    features: ['Balanced stats', 'Versatile', 'Good for hybrids'],
  },
  'Half-Krolvin': {
    id: 'Half-Krolvin',
    name: 'Half-Krolvin',
    description: 'Strong and intimidating, born of human and krolvin bloodlines.',
    statBonuses: { STR: 10, CON: 5, DEX: -5, AGL: 0, DIS: 10, AUR: 0, LOG: -5, INT: -5, WIS: 0, INF: -5 },
    features: ['High strength', 'Intimidation', 'Swimming bonus'],
  },
  'Burghal Gnome': {
    id: 'Burghal Gnome',
    name: 'Burghal Gnome',
    description: 'Clever and dexterous, urban gnomes make skilled rogues.',
    statBonuses: { STR: -15, CON: 5, DEX: 10, AGL: 10, DIS: 0, AUR: 5, LOG: 10, INT: 0, WIS: -10, INF: -5 },
    features: ['High logic', 'Mechanical aptitude', 'Small size'],
  },
  'Forest Gnome': {
    id: 'Forest Gnome',
    name: 'Forest Gnome',
    description: 'Nature-loving gnomes with affinity for the wilderness.',
    statBonuses: { STR: -15, CON: 10, DEX: 5, AGL: 10, DIS: 5, AUR: 5, LOG: 0, INT: -5, WIS: 0, INF: -5 },
    features: ['Nature magic', 'Forest stealth', 'Small size'],
  },
  Aelotoi: {
    id: 'Aelotoi',
    name: 'Aelotoi',
    description: 'Winged humanoids with mental and spiritual gifts.',
    statBonuses: { STR: -5, CON: -5, DEX: 5, AGL: 5, DIS: 0, AUR: 5, LOG: 0, INT: 5, WIS: 5, INF: -5 },
    features: ['Winged flight', 'Elemental attunement', 'Mental resistance'],
  },
  Erithian: {
    id: 'Erithian',
    name: 'Erithian',
    description: 'Mystical beings from another plane with psychic abilities.',
    statBonuses: { STR: 0, CON: -5, DEX: 0, AGL: 0, DIS: 0, AUR: 5, LOG: 5, INT: 5, WIS: 5, INF: -5 },
    features: ['Psychic abilities', 'Elemental resistance', 'Mental powers'],
  },
};

export const RACES_LIST = Object.values(RACE_DATA);
