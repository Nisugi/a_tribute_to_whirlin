/**
 * Convert skill ranks to the GemStone diminishing returns bonus.
 * Ranks 1-10 @ +5, 11-20 @ +4, 21-30 @ +3, 31-40 @ +2, 41+ @ +1.
 */
export function calculateSkillBonusFromRanks(ranks: number): number {
  let remaining = Math.max(0, Math.floor(ranks));
  let bonus = 0;

  const bands: Array<{ count: number; per: number }> = [
    { count: 10, per: 5 },
    { count: 10, per: 4 },
    { count: 10, per: 3 },
    { count: 10, per: 2 },
    { count: Infinity, per: 1 },
  ];

  for (const band of bands) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, band.count);
    bonus += take * band.per;
    remaining -= take;
  }

  return bonus;
}

/**
 * Convert a skill bonus back into the minimum number of ranks that would
 * generate it. This is useful when clamping rank-based enhancives to the
 * +50 bonus ceiling.
 */
export function calculateRanksForBonus(targetBonus: number): number {
  let remaining = Math.max(0, targetBonus);
  let ranks = 0;

  const bands: Array<{ per: number; count: number }> = [
    { count: 10, per: 5 },
    { count: 10, per: 4 },
    { count: 10, per: 3 },
    { count: 10, per: 2 },
    { count: Infinity, per: 1 },
  ];

  for (const band of bands) {
    if (remaining <= 0) break;
    const bonusFromBand = band.count * band.per;
    if (remaining >= bonusFromBand) {
      ranks += band.count;
      remaining -= bonusFromBand;
    } else {
      const needed = remaining / band.per;
      ranks += needed;
      remaining = 0;
    }
  }

  return Math.ceil(ranks);
}
