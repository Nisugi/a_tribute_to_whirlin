/**
 * Ascension Training Point (ATP) Calculator
 * Handles ATP calculations from ascension experience and milestones
 */

export const AEXP_PER_ATP = 50000;

/**
 * Calculate ATPs earned from ascension experience
 */
export function calculateEarnedATPs(ascensionXP: number): number {
  return Math.floor(ascensionXP / AEXP_PER_ATP);
}

/**
 * Calculate remaining AEXP needed for next ATP
 */
export function calculateRemainingAEXP(ascensionXP: number): number {
  return AEXP_PER_ATP - (ascensionXP % AEXP_PER_ATP);
}

/**
 * Calculate progress percentage toward next ATP
 */
export function calculateATPProgress(ascensionXP: number): number {
  const remainder = ascensionXP % AEXP_PER_ATP;
  return (remainder / AEXP_PER_ATP) * 100;
}

/**
 * Format AEXP with thousands separators
 */
export function formatAEXP(aexp: number): string {
  return aexp.toLocaleString();
}

/**
 * Calculate total ATPs from both earned and milestone sources
 */
export function calculateTotalATPs(earnedATPs: number, milestoneATPs: number): number {
  return earnedATPs + milestoneATPs;
}
