/**
 * Calculate stat bonus from stat value
 * GemStone IV uses a formula to convert stat values (0-100) to bonuses
 *
 * Formula: bonus = floor((stat - 50) / 2)
 * Examples:
 *   50 = 0 bonus
 *   60 = +5 bonus
 *   100 = +25 bonus
 *   40 = -5 bonus
 */
export function calculateStatBonus(statValue: number): number {
  return Math.floor((statValue - 50) / 2);
}

/**
 * Format stat display with bonus: "100 (25)"
 */
export function formatStatWithBonus(statValue: number): string {
  const bonus = calculateStatBonus(statValue);
  const bonusStr = bonus >= 0 ? `+${bonus}` : `${bonus}`;
  return `${statValue} (${bonusStr})`;
}
