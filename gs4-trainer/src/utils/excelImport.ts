/**
 * Excel Import Parser
 * Extracts character data from Whirlin_Trainer.xlsm files using SheetJS
 *
 * This is 100% client-side - no server needed!
 */

import * as XLSX from 'xlsx';
import type {
  Character,
  ExcelImportResult,
  Stats,
  Profession,
  Race,
  TrainingPlan,
  AscensionData,
  StatGrowthRates,
} from '../types';
import { SKILLS } from '../data/skills';

/**
 * Cell reference helper
 */
function getCellValue(sheet: XLSX.WorkSheet, ref: string): any {
  const cell = sheet[ref];
  return cell ? cell.v : null;
}

/**
 * Extract stats from specific cells
 */
function extractStats(sheet: XLSX.WorkSheet, column: string, startRow: number): Stats {
  const stats: Stats = {
    STR: getCellValue(sheet, `${column}${startRow}`) ?? 0,
    CON: getCellValue(sheet, `${column}${startRow + 1}`) ?? 0,
    DEX: getCellValue(sheet, `${column}${startRow + 2}`) ?? 0,
    AGL: getCellValue(sheet, `${column}${startRow + 3}`) ?? 0,
    DIS: getCellValue(sheet, `${column}${startRow + 4}`) ?? 0,
    AUR: getCellValue(sheet, `${column}${startRow + 5}`) ?? 0,
    LOG: getCellValue(sheet, `${column}${startRow + 6}`) ?? 0,
    INT: getCellValue(sheet, `${column}${startRow + 7}`) ?? 0,
    WIS: getCellValue(sheet, `${column}${startRow + 8}`) ?? 0,
    INF: getCellValue(sheet, `${column}${startRow + 9}`) ?? 0,
  };
  return stats;
}

/**
 * Extract growth rates from cells
 */
function extractGrowthRates(sheet: XLSX.WorkSheet): StatGrowthRates {
  // Growth rates are in cells I27:I36
  const rates: StatGrowthRates = {
    STR: { rate: getCellValue(sheet, 'I27') ?? 4 },
    CON: { rate: getCellValue(sheet, 'I28') ?? 4 },
    DEX: { rate: getCellValue(sheet, 'I29') ?? 4 },
    AGL: { rate: getCellValue(sheet, 'I30') ?? 4 },
    DIS: { rate: getCellValue(sheet, 'I31') ?? 4 },
    AUR: { rate: getCellValue(sheet, 'I32') ?? 4 },
    LOG: { rate: getCellValue(sheet, 'I33') ?? 4 },
    INT: { rate: getCellValue(sheet, 'I34') ?? 4 },
    WIS: { rate: getCellValue(sheet, 'I35') ?? 4 },
    INF: { rate: getCellValue(sheet, 'I36') ?? 4 },
  };
  return rates;
}

/**
 * Extract training plan from the training area
 */
function extractTrainingPlan(sheet: XLSX.WorkSheet): TrainingPlan {
  const trainingPlan: TrainingPlan = {};

  // Skills are in rows 45-98
  // Column A: Skill name
  // Column I: Current ranks
  // Columns M-DJ: Ranks per level (0-100)

  const skillRows = [
    // Combat Skills (45-59)
    { row: 45, name: 'Armor Use' },
    { row: 46, name: 'Shield Use' },
    { row: 47, name: 'Edged Weapons' },
    { row: 48, name: 'Blunt Weapons' },
    { row: 49, name: 'Two-Handed Weapons' },
    { row: 50, name: 'Ranged Weapons' },
    { row: 51, name: 'Thrown Weapons' },
    { row: 52, name: 'Polearm Weapons' },
    { row: 53, name: 'Brawling' },
    { row: 54, name: 'Two Weapon Combat' },
    { row: 55, name: 'Combat Maneuvers' },
    { row: 56, name: 'Multi-Opponent Combat' },
    { row: 57, name: 'Ambush' },
    { row: 58, name: 'Physical Fitness' },
    { row: 59, name: 'Dodging' },

    // Magic Skills (60-66)
    { row: 60, name: 'Arcane Symbols' },
    { row: 61, name: 'Magic Item Use' },
    { row: 62, name: 'Spell Aiming' },
    { row: 63, name: 'Harness Power' },
    { row: 64, name: 'Elemental Mana Control' },
    { row: 65, name: 'Spirit Mana Control' },
    { row: 66, name: 'Mental Mana Control' },

    // Lore Skills (68-84)
    { row: 68, name: 'Elemental Lore, Air' },
    { row: 69, name: 'Elemental Lore, Earth' },
    { row: 70, name: 'Elemental Lore, Fire' },
    { row: 71, name: 'Elemental Lore, Water' },
    { row: 73, name: 'Spiritual Lore, Blessings' },
    { row: 74, name: 'Spiritual Lore, Religion' },
    { row: 75, name: 'Spiritual Lore, Summoning' },
    { row: 77, name: 'Sorcerous Lore, Demonology' },
    { row: 78, name: 'Sorcerous Lore, Necromancy' },
    { row: 80, name: 'Mental Lore, Divination' },
    { row: 81, name: 'Mental Lore, Manipulation' },
    { row: 82, name: 'Mental Lore, Telepathy' },
    { row: 83, name: 'Mental Lore, Transference' },
    { row: 84, name: 'Mental Lore, Transformation' },

    // General Skills (85-94)
    { row: 85, name: 'Climbing' },
    { row: 86, name: 'Swimming' },
    { row: 87, name: 'Disarm Traps' },
    { row: 88, name: 'Picking Locks' },
    { row: 89, name: 'Stalking and Hiding' },
    { row: 90, name: 'Perception' },
    { row: 91, name: 'First Aid' },
    { row: 92, name: 'Trading' },
    { row: 93, name: 'Pickpocketing' },
    { row: 94, name: 'Survival' },

    // Spell Research (95-97)
    { row: 95, name: 'Spell Research' },
    { row: 96, name: 'Spell Circle (Primary)' },
    { row: 97, name: 'Spell Circle (Secondary)' },
  ];

  for (const { row, name } of skillRows) {
    const currentRanks = getCellValue(sheet, `I${row}`) ?? 0;
    const targetRanks = getCellValue(sheet, `J${row}`) ?? 0;

    // Find skill index by name
    const skillIndex = SKILLS.findIndex(skill => skill.name === name);
    if (skillIndex === -1) {
      continue; // Skip if skill not found
    }

    // Extract ranks by level (columns M=level 0, N=level 1, etc.)
    const ranksByLevel: number[] = [];
    for (let level = 0; level <= 100; level++) {
      // Column M is the 13th column (0-indexed = 12)
      // Convert level to column letter
      const colIndex = 12 + level; // M=12, N=13, O=14, etc.
      const colLetter = XLSX.utils.encode_col(colIndex);
      const value = getCellValue(sheet, `${colLetter}${row}`);
      ranksByLevel.push(value ?? 0);
    }

    trainingPlan[skillIndex] = {
      currentRanks,
      targetRanks,
      frequency: 0, // Will be calculated from target ranks
      ranksByLevel,
    };
  }

  return trainingPlan;
}

/**
 * Extract ascension data from Ascension sheet
 */
function extractAscensionData(workbook: XLSX.WorkBook): AscensionData {
  const sheet = workbook.Sheets['Ascension'];

  if (!sheet) {
    return {
      totalExperience: 0,
      milestones: {
        firstAscension: false,
        secondAscension: false,
        thirdAscension: false,
      },
      bonuses: {
        STR: 0, CON: 0, DEX: 0, AGL: 0, DIS: 0,
        AUR: 0, LOG: 0, INT: 0, WIS: 0, INF: 0,
      },
    };
  }

  // Extract ascension bonuses from column B (rows 6-15)
  const bonuses = extractStats(sheet, 'B', 6);

  return {
    totalExperience: getCellValue(sheet, 'B3') ?? 0,
    milestones: {
      firstAscension: getCellValue(sheet, 'L4') === 'True',
      secondAscension: getCellValue(sheet, 'O4') === 'True',
      thirdAscension: getCellValue(sheet, 'R4') === 'True',
    },
    bonuses,
  };
}

/**
 * Main import function
 * Reads a .xlsm file and extracts all character data
 */
export async function importFromExcel(file: File): Promise<ExcelImportResult> {
  const errors: string[] = [];

  try {
    // Read the file
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Get the Trainer sheet
    const trainerSheet = workbook.Sheets['Trainer'];
    if (!trainerSheet) {
      errors.push('Could not find "Trainer" sheet in workbook');
      return {
        character: null as any,
        success: false,
        errors,
      };
    }

    // Extract basic character info
    const profession = getCellValue(trainerSheet, 'B3') as Profession;
    const race = getCellValue(trainerSheet, 'B5') as Race;
    const currentXP = getCellValue(trainerSheet, 'B11') ?? 0;
    const targetLevel = getCellValue(trainerSheet, 'B8') ?? 0;

    // Validate required fields
    if (!profession) {
      errors.push('Missing profession (cell B3)');
    }
    if (!race) {
      errors.push('Missing race (cell B5)');
    }

    // Extract base stats (column I, rows 5-14)
    const baseStats = extractStats(trainerSheet, 'I', 5);

    // Extract growth rates
    const statGrowthRates = extractGrowthRates(trainerSheet);

    // Extract training plan
    const training = extractTrainingPlan(trainerSheet);

    // Extract ascension data
    const ascension = extractAscensionData(workbook);

    // Extract active enhancive set
    const enhanciveSetId = getCellValue(trainerSheet, 'E40') ?? null;

    // Build character object
    const character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'> = {
      name: `${profession} (${race})`, // Default name, user can change
      profession,
      race,
      currentXP,
      ascensionXP: 0, // Default to 0, will be calculated from total XP if needed
      currentLevel: targetLevel, // Using target level as current for now
      targetXP: 0, // Default to 0, user can update for post-100 calculations
      targetLevel,
      baseStats,
      statGrowthRates,
      training,
      ascension,
      enhanciveSetId,
    };

    return {
      character,
      success: errors.length === 0,
      errors,
    };
  } catch (error) {
    errors.push(`Failed to parse Excel file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      character: null as any,
      success: false,
      errors,
    };
  }
}

/**
 * Helper: Download JSON file
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export character to Excel format (future feature)
 */
export function exportToExcel(character: Character): void {
  // TODO: Create Excel file with character data
  // For now, just export as JSON
  downloadJSON(character, `${character.name.replace(/\s+/g, '_')}.json`);
}
