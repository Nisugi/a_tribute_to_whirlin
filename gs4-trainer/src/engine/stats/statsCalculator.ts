import type { Profession, Race, Stats, StatName } from '../../types';
import { LOOKUP_TABLES } from '../../data/lookupTables';
import { ExcelFunctions } from '../lookups/ExcelFunctions';

const STAT_NAMES: StatName[] = ['STR', 'CON', 'DEX', 'AGL', 'DIS', 'AUR', 'LOG', 'INT', 'WIS', 'INF'];

const RACE_LOOKUP_OVERRIDES: Partial<Record<Race, string>> = {
  'Dark Elf': 'Dark-Elf',
  Sylvankind: 'Sylvan',
};

const normalizeLabel = (label: string | null | undefined): string =>
  (label ?? '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

function findLookupIndex(
  value: string,
  lookupValues: readonly string[],
  overrides?: Partial<Record<string, string>>
): number | null {
  const candidates: string[] = [];

  if (value) {
    const overrideValue = overrides?.[value];
    if (overrideValue) {
      candidates.push(overrideValue);
    }
    candidates.push(value);
  }

  for (const candidate of candidates) {
    const match = ExcelFunctions.MATCH(candidate, lookupValues as any[], 0);
    if (match !== null) {
      return match;
    }
  }

  if (value) {
    const normalized = normalizeLabel(value);
    const fallbackIndex = lookupValues.findIndex(
      (entry) => normalizeLabel(entry) === normalized
    );

    if (fallbackIndex >= 0) {
      return fallbackIndex + 1;
    }
  }

  return null;
}

/**
 * Calculate growth rate for a single stat based on profession and race.
 * Formula: INDEX(TBL_GI_PROF, row, professionCol) + INDEX(TBL_GI_RACE, row, raceCol)
 */
export function calculateStatGrowthRate(stat: StatName, profession: Profession, race: Race): number {
  const TBL_GI_PROF = LOOKUP_TABLES.TBL_GI_PROF;
  const TBL_GI_RACE = LOOKUP_TABLES.TBL_GI_RACE;
  const TBL_Professions = LOOKUP_TABLES.TBL_Professions.flat();
  const TBL_Races = LOOKUP_TABLES.TBL_Races.flat();

  // Find the row index for this stat (STR=row 2, CON=row 3, etc.)
  const statRowIndex = STAT_NAMES.indexOf(stat) + 2; // +2 because row 1 is headers, row 2 is STR

  // Find column index for profession and race
  const professionCol = findLookupIndex(profession, TBL_Professions);
  const raceCol = findLookupIndex(race, TBL_Races, RACE_LOOKUP_OVERRIDES);

  if (professionCol === null || raceCol === null) {
    throw new Error(`Invalid profession "${profession}" or race "${race}"`);
  }

  // INDEX is 1-based, so we need to add 1 to the column match result
  const profGI = ExcelFunctions.INDEX(TBL_GI_PROF, statRowIndex, professionCol + 1);
  const raceGI = ExcelFunctions.INDEX(TBL_GI_RACE, statRowIndex, raceCol + 1);

  return profGI + raceGI;
}

/**
 * Calculate all stat growth rates for a character.
 */
export function calculateAllStatGrowthRates(profession: Profession, race: Race): Record<StatName, number> {
  const growthRates: Partial<Record<StatName, number>> = {};

  for (const stat of STAT_NAMES) {
    growthRates[stat] = calculateStatGrowthRate(stat, profession, race);
  }

  return growthRates as Record<StatName, number>;
}

/**
 * Calculate stat progression from level 0 to targetLevel.
 * Formula: =MIN(prevStat + IF(MOD(level, MAX(INT(prevStat/growthRate), 1))=0, 1, 0), 100)
 *
 * @param baseStat Starting stat value at level 0
 * @param growthRate Growth increment value (e.g., 25 means stat grows based on stat/25)
 * @param targetLevel Level to calculate up to
 * @returns Array of stat values from level 0 to targetLevel
 */
export function calculateStatProgression(
  baseStat: number,
  growthRate: number,
  targetLevel: number = 100
): number[] {
  const progression: number[] = [baseStat];

  for (let level = 1; level <= targetLevel; level++) {
    const prevStat = progression[level - 1];

    // Calculate growth increment
    // MOD(level, MAX(INT(prevStat/growthRate), 1)) == 0 ? 1 : 0
    const divisor = Math.max(Math.floor(prevStat / growthRate), 1);
    const shouldGrow = ExcelFunctions.MOD(level, divisor) === 0;
    const increment = shouldGrow ? 1 : 0;

    // Add increment and cap at 100
    const newStat = Math.min(prevStat + increment, 100);
    progression.push(newStat);
  }

  return progression;
}

/**
 * Calculate progression for all stats.
 */
export function calculateAllStatsProgression(
  baseStats: Stats,
  growthRates: Record<StatName, number>,
  targetLevel: number = 100
): Record<StatName, number[]> {
  const progressions: Partial<Record<StatName, number[]>> = {};

  for (const stat of STAT_NAMES) {
    progressions[stat] = calculateStatProgression(
      baseStats[stat],
      growthRates[stat],
      targetLevel
    );
  }

  return progressions as Record<StatName, number[]>;
}

/**
 * Get stats at a specific level.
 */
export function getStatsAtLevel(
  baseStats: Stats,
  growthRates: Record<StatName, number>,
  level: number
): Stats {
  const statsAtLevel: Partial<Stats> = {};

  for (const stat of STAT_NAMES) {
    const progression = calculateStatProgression(baseStats[stat], growthRates[stat], level);
    statsAtLevel[stat] = progression[level];
  }

  return statsAtLevel as Stats;
}
