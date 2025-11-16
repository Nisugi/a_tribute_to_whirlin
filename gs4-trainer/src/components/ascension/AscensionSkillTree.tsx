/**
 * Ascension Skill Tree
 * Provides UI for browsing and purchasing ascension abilities
 */

import { useMemo, useState } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import {
  ALL_ABILITIES,
  calculateAbilityCost,
  calculateAbilityStatBonuses,
  calculateTotalAbilityCost,
  getAbilitiesByTier,
  type AbilityCategory,
  type AscensionAbility,
  type AscensionTier,
} from '../../data/ascensionAbilities';
import { calculateEarnedATPs, calculateTotalATPs } from '../../engine/ascension/atpCalculator';
import { calculateMilestoneATPs } from '../../engine/ascension/milestoneTracker';

const TIERS: AscensionTier[] = ['Common', 'Elite', 'Legendary'];
const CATEGORY_OPTIONS: AbilityCategory[] = Array.from(
  new Set(ALL_ABILITIES.map((ability) => ability.category))
) as AbilityCategory[];

const formatStatBonus = (ability: AscensionAbility) => {
  if (!ability.statBonus) return null;
  return Object.entries(ability.statBonus)
    .map(([stat, value]) => `+${value} ${stat}`)
    .join(', ');
};

export default function AscensionSkillTree() {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);
  const [activeTier, setActiveTier] = useState<AscensionTier>('Common');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AbilityCategory>('all');

  if (!currentCharacter?.ascension) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 text-sm">Select or create a character to manage ascension abilities.</p>
      </div>
    );
  }

  const { ascension } = currentCharacter;
  const selections = ascension.selectedAbilities ?? [];

  const abilityMap = useMemo(() => {
    const map = new Map<string, AscensionAbility>();
    for (const ability of ALL_ABILITIES) {
      map.set(ability.id, ability);
    }
    return map;
  }, []);

  const selectedRanks = useMemo(() => {
    const map = new Map<string, number>();
    for (const selection of selections) {
      map.set(selection.abilityId, selection.ranks);
    }
    return map;
  }, [selections]);

  const tierRankTotals = useMemo(() => {
    const totals: Record<AscensionTier, number> = {
      Common: 0,
      Elite: 0,
      Legendary: 0,
    };
    for (const selection of selections) {
      const ability = abilityMap.get(selection.abilityId);
      if (ability) {
        totals[ability.tier] += selection.ranks;
      }
    }
    return totals;
  }, [abilityMap, selections]);

  const tierCostTotals = useMemo(() => {
    const totals: Record<AscensionTier, number> = {
      Common: 0,
      Elite: 0,
      Legendary: 0,
    };
    for (const selection of selections) {
      const ability = abilityMap.get(selection.abilityId);
      if (ability) {
        totals[ability.tier] += calculateAbilityCost(ability, selection.ranks);
      }
    }
    return totals;
  }, [abilityMap, selections]);

  const ascensionXP = currentCharacter.ascensionXP ?? 0;
  const earnedATPs = calculateEarnedATPs(ascensionXP);
  const milestoneATPs = calculateMilestoneATPs(ascension.milestones);
  const totalATPs = calculateTotalATPs(earnedATPs, milestoneATPs);
  const spentATPs = useMemo(
    () => calculateTotalAbilityCost(selections),
    [selections]
  );
  const remainingATPs = totalATPs - spentATPs;

  const tierAbilities = useMemo(
    () => getAbilitiesByTier(activeTier),
    [activeTier]
  );

  const filteredAbilities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return tierAbilities.filter((ability) => {
      const matchesText =
        term.length === 0 ||
        ability.name.toLowerCase().includes(term) ||
        ability.description.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === 'all' || ability.category === categoryFilter;
      return matchesText && matchesCategory;
    });
  }, [categoryFilter, searchTerm, tierAbilities]);

  const getRequirementStatus = (ability: AscensionAbility) => {
    const statuses: Array<{ label: string; met: boolean }> = [];

    if (ability.requiresCommonRanks) {
      statuses.push({
        label: `${ability.requiresCommonRanks} Common ranks`,
        met: tierRankTotals.Common >= ability.requiresCommonRanks,
      });
    }
    if (ability.requiresEliteRanks) {
      statuses.push({
        label: `${ability.requiresEliteRanks} Elite ranks`,
        met: tierRankTotals.Elite >= ability.requiresEliteRanks,
      });
    }
    if (ability.requiredAbilities?.length) {
      const allMet = ability.requiredAbilities.every(
        (requiredId) => (selectedRanks.get(requiredId) ?? 0) > 0
      );
      statuses.push({
        label: `Requires: ${ability.requiredAbilities
          .map((reqId) => abilityMap.get(reqId)?.name ?? reqId)
          .join(', ')}`,
        met: allMet,
      });
    }
    if (ability.requiresAbilityRankTotal) {
      const totalRanks = ability.requiresAbilityRankTotal.abilityIds.reduce(
        (acc, abilityId) => acc + (selectedRanks.get(abilityId) ?? 0),
        0
      );
      statuses.push({
        label: ability.requiresAbilityRankTotal.label ??
          `${ability.requiresAbilityRankTotal.minTotalRanks} combined ranks required`,
        met: totalRanks >= ability.requiresAbilityRankTotal.minTotalRanks,
      });
    }
    if (ability.requiresTierCost) {
      const spent = tierCostTotals[ability.requiresTierCost.tier];
      statuses.push({
        label: `${ability.requiresTierCost.minCost} ATP spent in ${ability.requiresTierCost.tier}`,
        met: spent >= ability.requiresTierCost.minCost,
      });
    }
    if (ability.professionRestriction?.length) {
      statuses.push({
        label: `Profession: ${ability.professionRestriction.join(', ')}`,
        met: ability.professionRestriction.includes(currentCharacter.profession),
      });
    }

    return statuses;
  };

  const canActivateAbility = (ability: AscensionAbility) => {
    const statuses = getRequirementStatus(ability);
    return statuses.every((status) => status.met);
  };

  const handleRankChange = (ability: AscensionAbility, nextValue: number) => {
    if (!currentCharacter?.ascension) return;

    const currentRanks = selectedRanks.get(ability.id) ?? 0;
    const clamped = Math.max(0, Math.min(ability.maxRanks, Number.isNaN(nextValue) ? 0 : nextValue));

    const attemptingIncrease = clamped > currentRanks;
    if (attemptingIncrease && !canActivateAbility(ability)) {
      return;
    }

    const updatedSelections = selections
      .filter((selection) => selection.abilityId !== ability.id);

    if (clamped > 0) {
      updatedSelections.push({
        abilityId: ability.id,
        ranks: clamped,
      });
    }

    const updatedBonuses = calculateAbilityStatBonuses(updatedSelections);

    updateCharacter({
      ascension: {
        ...currentCharacter.ascension,
        selectedAbilities: updatedSelections,
        bonuses: updatedBonuses,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">Ascension Skill Tree</h3>
            <p className="text-sm text-gray-500 mt-1">
              Allocate Ascension Training Points (ATP) to unlock powerful abilities.
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              Earned ATPs: <span className="font-semibold text-purple-700">{earnedATPs}</span>
            </div>
            <div className="text-sm text-gray-600">
              Milestone ATPs: <span className="font-semibold text-purple-700">{milestoneATPs}</span>
            </div>
            <div className="text-sm font-semibold mt-1">
              Total ATPs: <span className="text-gray-900">{totalATPs}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Spent ATPs</span>
              <span>{spentATPs}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Remaining ATPs</span>
              <span className={remainingATPs < 0 ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>
                {remainingATPs}
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500 mb-1">
                Tier Rank Totals
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                {TIERS.map((tier) => (
                  <span key={tier} className="px-2 py-1 bg-white rounded border border-gray-200">
                    {tier}: <span className="font-semibold text-gray-900">{tierRankTotals[tier]}</span>
                  </span>
                ))}
              </div>
              <div className="text-xs text-gray-500 mb-1 mt-3">
                Tier ATP Spend
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                {TIERS.map((tier) => (
                  <span key={`${tier}-cost`} className="px-2 py-1 bg-white rounded border border-gray-200">
                    {tier}: <span className="font-semibold text-gray-900">{tierCostTotals[tier]}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search abilities..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-500 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value === 'all' ? 'all' : (event.target.value as AbilityCategory))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              >
                <option value="all">All Categories</option>
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {TIERS.map((tier) => (
            <button
              key={tier}
              onClick={() => setActiveTier(tier)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                activeTier === tier
                  ? 'bg-purple-600 text-white border-purple-600 shadow'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {filteredAbilities.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-6 border border-dashed border-gray-300 rounded-lg">
            No abilities match your current filters.
          </div>
        )}

        {filteredAbilities.map((ability) => {
          const currentRanks = selectedRanks.get(ability.id) ?? 0;
          const abilityCost = calculateAbilityCost(ability, currentRanks);
          const isUnlocked = canActivateAbility(ability) || currentRanks > 0;
          const statuses = getRequirementStatus(ability);
          const statBonusText = formatStatBonus(ability);
          const skillBonusText = ability.skillBonus
            ? Object.entries(ability.skillBonus)
                .map(([skill, bonus]) => `+${bonus} ${skill}`)
                .join(', ')
            : null;

          return (
            <div
              key={ability.id}
              className="border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow transition bg-white"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{ability.name}</h4>
                  <p className="text-sm text-gray-600">{ability.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                    {ability.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      isUnlocked
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}
                  >
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              </div>

              {statBonusText && (
                <div className="mt-2 text-xs uppercase tracking-wide text-purple-700 font-semibold">
                  {statBonusText} per rank
                </div>
              )}

              {skillBonusText && (
                <div className="mt-2 text-xs text-blue-700">
                  {skillBonusText} per rank
                </div>
              )}

              {statuses.length > 0 && (
                <div className="mt-4 space-y-1 text-sm">
                  {statuses.map((status) => (
                    <div
                      key={status.label}
                      className={`flex items-center gap-2 ${
                        status.met ? 'text-green-700' : 'text-yellow-700'
                      }`}
                    >
                      <span>{status.met ? '✓' : '!'}</span>
                      <span>{status.label}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs uppercase text-gray-500 mb-1">
                    Ranks (max {ability.maxRanks})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRankChange(ability, currentRanks - 1)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      max={ability.maxRanks}
                      value={currentRanks}
                      onChange={(event) => handleRankChange(ability, parseInt(event.target.value, 10) || 0)}
                      className="w-20 text-center border border-gray-300 rounded py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => handleRankChange(ability, currentRanks + 1)}
                      className={`px-2 py-1 text-sm border rounded ${
                        !canActivateAbility(ability) && currentRanks === 0
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      disabled={!canActivateAbility(ability) && currentRanks === 0}
                    >
                      +
                    </button>
                  </div>
                  {!isUnlocked && currentRanks === 0 && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Satisfy prerequisites before purchasing ranks.
                    </p>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs text-gray-500 uppercase">ATP Cost</div>
                  <div className="text-2xl font-semibold text-gray-900">{abilityCost}</div>
                  {ability.isProgressiveCost && (
                    <p className="text-xs text-gray-500 mt-1">
                      Cost increases every 5 ranks.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
