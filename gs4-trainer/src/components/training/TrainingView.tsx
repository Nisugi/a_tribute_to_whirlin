/**
 * Training View - Training planner with auto-train
 */

import { useState, useMemo } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { SKILLS, SKILL_CATEGORIES, type SkillCategory } from '../../data/skills';
import {
  getSkillCost,
  getMaxRanks,
  getMaxRanksForParent,
  getSkillCostTier,
  getSkillType,
  calculateSkillCost,
} from '../../engine/training/tpCalculator';
import { calculateTPsAcrossLevels, calculateTotalTPsAvailable } from '../../engine/training/tpEarnings';
import { autoTrain, calculateTargetRanksFromFrequency, type AutoTrainResult } from '../../engine/training/autoTrain';
import { getStatsAtLevel, calculateAllStatGrowthRates } from '../../engine/stats/statsCalculator';
import type { TrainingPlan, Stats } from '../../types';
import TrainingBreakdown from './TrainingBreakdown';

export default function TrainingView() {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('weapon');
  const [autoTrainResult, setAutoTrainResult] = useState<AutoTrainResult | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Calculate stat progression across all levels
  const statProgression = useMemo(() => {
    if (!currentCharacter) return {};

    const growthRates = calculateAllStatGrowthRates(currentCharacter.profession, currentCharacter.race);
    console.log('[TrainingView] Growth rates:', growthRates);

    const progression: Record<number, Stats> = {};

    for (let level = 0; level <= currentCharacter.targetLevel; level++) {
      progression[level] = getStatsAtLevel(currentCharacter.baseStats, growthRates, level);
    }

    // Debug: show stats at key levels
    console.log('[TrainingView] Stats at level 0:', progression[0]);
    console.log('[TrainingView] Stats at level 10:', progression[10]);
    console.log('[TrainingView] Stats at level 50:', progression[50]);
    console.log('[TrainingView] Stats at level 100:', progression[100]);

    return progression;
  }, [currentCharacter?.baseStats, currentCharacter?.profession, currentCharacter?.race, currentCharacter?.targetLevel]);

  // Calculate TPs earned per level
  const tpsByLevel = useMemo(() => {
    if (!currentCharacter) return {};

    const tps = calculateTPsAcrossLevels(
      currentCharacter.baseStats,
      statProgression,
      currentCharacter.profession,
      0,
      currentCharacter.targetLevel
    );

    // Debug: show TPs at key levels
    console.log('[TrainingView] TPs at level 1:', tps[1]);
    console.log('[TrainingView] TPs at level 10:', tps[10]);
    console.log('[TrainingView] TPs at level 50:', tps[50]);
    console.log('[TrainingView] TPs at level 100:', tps[100]);

    return tps;
  }, [currentCharacter?.baseStats, statProgression, currentCharacter?.profession, currentCharacter?.targetLevel]);

  // Calculate total TPs available (from level 0 to current - this is the budget)
  const totalTPsAvailable = useMemo(() => {
    if (!currentCharacter) return { physicalTPs: 0, mentalTPs: 0, totalTPs: 0 };

    const result = calculateTotalTPsAvailable(
      tpsByLevel,
      0,  // Start from level 0
      currentCharacter.currentLevel,  // End at current level
      0,  // Start XP is 0
      currentCharacter.currentXP  // End at current XP
    );

    console.log('[TrainingView] TP Calculation:', {
      currentLevel: currentCharacter.currentLevel,
      currentXP: currentCharacter.currentXP,
      baseStats: currentCharacter.baseStats,
      profession: currentCharacter.profession,
      race: currentCharacter.race,
      result
    });

    return result;
  }, [tpsByLevel, currentCharacter?.currentLevel, currentCharacter?.currentXP]);

  // Calculate TPs spent based on training plan
  const spentTPs = useMemo(() => {
    if (!currentCharacter) return { physicalTPs: 0, mentalTPs: 0, totalTPs: 0 };

    const training = currentCharacter.training || {};
    let totalPhysical = 0;
    let totalMental = 0;

    // Group skills by their parentIndex (or their own index if no parent)
    // Sub-skills sharing a parentIndex must have progressive costs calculated on combined ranks
    const skillGroups = new Map<number, Array<{ index: number; currentRanks: number; targetRanks: number }>>();

    for (const [skillIndexStr, skillData] of Object.entries(training)) {
      const skillIndex = parseInt(skillIndexStr);
      const { currentRanks = 0, targetRanks = 0 } = skillData;

      if (targetRanks <= currentRanks) continue;

      // Find the skill definition to get its parentIndex
      const skill = SKILLS.find(s => s.index === skillIndex);
      const groupKey = skill?.parentIndex ?? skillIndex;

      if (!skillGroups.has(groupKey)) {
        skillGroups.set(groupKey, []);
      }
      skillGroups.get(groupKey)!.push({ index: skillIndex, currentRanks, targetRanks });
    }

    // Calculate costs for each group
    for (const [groupKey, skills] of skillGroups.entries()) {
      // Sum total ranks across all sub-skills in this group
      const totalTargetRanks = skills.reduce((sum, s) => sum + s.targetRanks, 0);
      const totalCurrentRanks = skills.reduce((sum, s) => sum + s.currentRanks, 0);

      // Calculate cost using the group's lookup index (parentIndex)
      const targetCost = calculateSkillCost(
        groupKey,
        currentCharacter.profession,
        totalTargetRanks,
        currentCharacter.currentLevel
      );

      const currentCost = totalCurrentRanks > 0 ? calculateSkillCost(
        groupKey,
        currentCharacter.profession,
        totalCurrentRanks,
        currentCharacter.currentLevel
      ) : { totalPTP: 0, totalMTP: 0 };

      totalPhysical += (targetCost.totalPTP - currentCost.totalPTP);
      totalMental += (targetCost.totalMTP - currentCost.totalMTP);
    }

    return {
      physicalTPs: totalPhysical,
      mentalTPs: totalMental,
      totalTPs: totalPhysical + totalMental,
    };
  }, [currentCharacter?.training, currentCharacter?.profession, currentCharacter?.currentLevel]);

  // Calculate remaining TPs
  const remainingTPs = useMemo(() => {
    return {
      physicalTPs: totalTPsAvailable.physicalTPs - spentTPs.physicalTPs,
      mentalTPs: totalTPsAvailable.mentalTPs - spentTPs.mentalTPs,
      totalTPs: totalTPsAvailable.totalTPs - spentTPs.totalTPs,
    };
  }, [totalTPsAvailable, spentTPs]);

  if (!currentCharacter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No character selected</p>
      </div>
    );
  }

  const training = currentCharacter.training || {};

  // Get skills for selected category, filtered by profession for spell circles
  const categorySkills = SKILLS.filter(skill => {
    if (skill.category !== selectedCategory) return false;

    // Filter spell circles by profession
    if (skill.category === 'spell' && skill.professions) {
      return skill.professions.includes(currentCharacter.profession);
    }

    return true;
  });

  // For categories with sub-skills, calculate combined ranks info
  const hasSharedPool = categorySkills.length > 0 && categorySkills[0].parentIndex !== undefined;
  const parentIndex = hasSharedPool ? categorySkills[0].parentIndex : null;

  const combinedRanksInfo = useMemo(() => {
    if (!hasSharedPool || parentIndex === null) return null;

    // Calculate total target ranks across all sub-skills
    const totalTargetRanks = categorySkills.reduce((sum, skill) => {
      const skillData = training[skill.index] || { targetRanks: 0 };
      return sum + (skillData.targetRanks || 0);
    }, 0);

    // Get max ranks for the parent
    const maxCombined = getMaxRanksForParent(parentIndex, currentCharacter.profession, currentCharacter.targetLevel);

    return {
      totalTargetRanks,
      maxCombined,
      remaining: maxCombined - totalTargetRanks,
      isExceeding: totalTargetRanks > maxCombined,
    };
  }, [hasSharedPool, parentIndex, categorySkills, training, currentCharacter.profession, currentCharacter.targetLevel]);

  const handleFrequencyChange = (skillIndex: number, frequency: number) => {
    const targetRanks = calculateTargetRanksFromFrequency(
      frequency,
      currentCharacter.currentLevel
    );

    const updatedTraining: TrainingPlan = {
      ...training,
      [skillIndex]: {
        currentRanks: training[skillIndex]?.currentRanks || 0,
        targetRanks,
        frequency: Math.max(0, frequency),
      },
    };

    updateCharacter({ training: updatedTraining });
  };

  const handleTargetRanksChange = (skillIndex: number, targetRanks: number) => {
    // Calculate frequency from target ranks: frequency = targetRanks / (currentLevel + 1)
    // Note: +1 accounts for training at level 0 through currentLevel
    const frequency = targetRanks / (currentCharacter.currentLevel + 1);

    const updatedTraining: TrainingPlan = {
      ...training,
      [skillIndex]: {
        currentRanks: training[skillIndex]?.currentRanks || 0,
        targetRanks: Math.max(0, targetRanks),
        frequency: Math.max(0, frequency),
      },
    };

    updateCharacter({ training: updatedTraining });
  };

  const handleClearAllTraining = () => {
    if (confirm('Clear all training data? This cannot be undone.')) {
      updateCharacter({ training: {} });
      setAutoTrainResult(null);
      setShowBreakdown(false);
    }
  };

  const handleAutoTrain = () => {
    const result = autoTrain(
      training,
      currentCharacter.profession,
      tpsByLevel,
      currentCharacter.currentLevel,
      currentCharacter.targetLevel
    );

    setAutoTrainResult(result);
    setShowBreakdown(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Training Planner</h2>
              <p className="text-sm text-gray-600 mt-1">
                Plan your skill training with frequency-based auto-training
              </p>
            </div>
          </div>

          {/* Future Planning Parameters (for Auto-Train breakdown) */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Future Target Level (Optional)
              </label>
              <input
                type="number"
                min={currentCharacter.currentLevel}
                max="100"
                value={Math.max(currentCharacter.currentLevel, currentCharacter.targetLevel)}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    updateCharacter({ targetLevel: Math.max(currentCharacter.currentLevel, value) });
                  }
                }}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent text-lg font-semibold"
              />
              <p className="text-xs text-gray-500 mt-1">For level-by-level planning: {currentCharacter.currentLevel} → {Math.max(currentCharacter.currentLevel, currentCharacter.targetLevel)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Future Target Experience (Optional)
              </label>
              <input
                type="number"
                min={currentCharacter.currentXP}
                value={Math.max(currentCharacter.currentXP, currentCharacter.targetXP)}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    updateCharacter({ targetXP: Math.max(currentCharacter.currentXP, value) });
                  }
                }}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">For AutoTrain breakdown only (not used in budget above)</p>
            </div>
          </div>
        </div>

        {/* TP Budget Tracker */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Point Budget</h3>

          <div className="grid grid-cols-3 gap-6">
            {/* Physical TPs */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Physical TPs</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Available:</span>
                  <span className="text-lg font-bold text-blue-600">{totalTPsAvailable.physicalTPs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Spent:</span>
                  <span className="text-lg font-semibold text-gray-700">{spentTPs.physicalTPs}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-300">
                  <span className="text-xs font-medium text-gray-700">Remaining:</span>
                  <span className={`text-xl font-bold ${remainingTPs.physicalTPs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remainingTPs.physicalTPs}
                  </span>
                </div>
              </div>
            </div>

            {/* Mental TPs */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Mental TPs</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Available:</span>
                  <span className="text-lg font-bold text-purple-600">{totalTPsAvailable.mentalTPs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Spent:</span>
                  <span className="text-lg font-semibold text-gray-700">{spentTPs.mentalTPs}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-300">
                  <span className="text-xs font-medium text-gray-700">Remaining:</span>
                  <span className={`text-xl font-bold ${remainingTPs.mentalTPs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remainingTPs.mentalTPs}
                  </span>
                </div>
              </div>
            </div>

            {/* Total TPs */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Total TPs</div>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Available:</span>
                  <span className="text-lg font-bold text-gray-900">{totalTPsAvailable.totalTPs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Spent:</span>
                  <span className="text-lg font-semibold text-gray-700">{spentTPs.totalTPs}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-300">
                  <span className="text-xs font-medium text-gray-700">Remaining:</span>
                  <span className={`text-xl font-bold ${remainingTPs.totalTPs >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {remainingTPs.totalTPs}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-3">
            Budget based on current level {currentCharacter.currentLevel} and {currentCharacter.currentXP.toLocaleString()} XP
          </div>
        </div>

        {/* Auto-Train Buttons */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={handleAutoTrain}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold text-lg rounded-lg shadow-lg hover:from-green-700 hover:to-emerald-800 transition-all"
            >
              🎯 Auto-Train (Calculate Plan)
            </button>
            <button
              onClick={handleClearAllTraining}
              className="px-6 py-4 bg-red-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-red-700 transition-all"
            >
              Clear All
            </button>
            {autoTrainResult && (
              <button
                onClick={() => {
                  setAutoTrainResult(null);
                  setShowBreakdown(false);
                }}
                className="px-6 py-4 bg-gray-600 text-white font-semibold text-lg rounded-lg shadow-lg hover:bg-gray-700 transition-all"
              >
                Hide Results
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Auto-Train calculates a level-by-level plan | Clear All resets all training frequencies
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(SKILL_CATEGORIES).map(([category, label]) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category as SkillCategory)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Skills Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Skill</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Frequency</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Current</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Target</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Max</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Cost/Rank</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {/* Category Header Row (for shared rank pools) */}
              {combinedRanksInfo && (
                <tr className={`${
                  combinedRanksInfo.isExceeding ? 'bg-red-50' : 'bg-blue-50'
                } border-b-2 border-gray-300`}>
                  <td colSpan={7} className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-lg text-gray-900">
                          {SKILL_CATEGORIES[selectedCategory]}
                          <span className={`ml-3 font-semibold ${
                            combinedRanksInfo.isExceeding ? 'text-red-700' : 'text-blue-700'
                          }`}>
                            {combinedRanksInfo.totalTargetRanks} / {combinedRanksInfo.maxCombined} ranks
                          </span>
                        </div>
                        <div className="text-sm mt-1">
                          {combinedRanksInfo.isExceeding ? (
                            <span className="text-red-700 font-medium">
                              ⚠️ Exceeds maximum by {Math.abs(combinedRanksInfo.remaining)} ranks
                            </span>
                          ) : (
                            <span className="text-gray-700">
                              <span className="font-medium text-green-700">{combinedRanksInfo.remaining}</span> ranks remaining
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}

              {/* Skill Rows */}
              {categorySkills.map((skill, index) => {
                const skillIndex = skill.index;
                const skillData = training[skillIndex] || { currentRanks: 0, targetRanks: 0, frequency: 0 };
                const cost = getSkillCost(skillIndex, currentCharacter.profession);
                const maxRanks = getMaxRanks(skillIndex, currentCharacter.profession, currentCharacter.targetLevel);
                const costTier = getSkillCostTier(skillIndex, currentCharacter.profession);
                const skillType = getSkillType(skillIndex, currentCharacter.profession);

                // Cost tier color
                const tierColor = {
                  'very-cheap': 'text-green-600',
                  'cheap': 'text-green-500',
                  'moderate': 'text-yellow-600',
                  'expensive': 'text-orange-600',
                  'very-expensive': 'text-red-600',
                }[costTier];

                // Skill type badge
                const typeBadge = {
                  physical: '💪',
                  mental: '🧠',
                  hybrid: '⚡',
                }[skillType];

                const isExceedingMax = skillData.targetRanks > maxRanks;

                // Calculate total cost to reach target using progressive cost multipliers
                const targetCost = calculateSkillCost(
                  skillIndex,
                  currentCharacter.profession,
                  skillData.targetRanks || 0,
                  currentCharacter.currentLevel
                );

                const currentCost = skillData.currentRanks > 0
                  ? calculateSkillCost(
                      skillIndex,
                      currentCharacter.profession,
                      skillData.currentRanks,
                      currentCharacter.currentLevel
                    )
                  : { totalPTP: 0, totalMTP: 0, totalTP: 0 };

                const totalPhysicalCost = targetCost.totalPTP - currentCost.totalPTP;
                const totalMentalCost = targetCost.totalMTP - currentCost.totalMTP;
                const totalCost = totalPhysicalCost + totalMentalCost;

                return (
                  <tr
                    key={skill.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span title={skillType}>{typeBadge}</span>
                        <div>
                          <div className="font-medium text-gray-900">{skill.name}</div>
                          <div className="text-xs text-gray-500">{skill.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max={cost.maxPerLevel}
                        step="0.25"
                        value={skillData.frequency || 0}
                        onChange={(e) => handleFrequencyChange(skillIndex, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <div className="text-xs text-gray-500 mt-1">/level</div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {skillData.currentRanks || 0}
                    </td>
                    <td className="text-center py-3 px-4">
                      <input
                        type="number"
                        min="0"
                        max={maxRanks}
                        value={skillData.targetRanks || 0}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (!isNaN(value) && value >= 0) {
                            handleTargetRanksChange(skillIndex, value);
                          }
                        }}
                        className={`w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-primary focus:border-transparent ${
                          isExceedingMax ? 'border-red-500 bg-red-50 font-bold' : 'border-gray-300 font-semibold'
                        }`}
                      />
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-600">
                        {maxRanks} <span className="text-xs text-gray-400">({cost.maxPerLevel}x)</span>
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className={`text-sm font-medium ${tierColor}`}>
                        {cost.ptp > 0 && <span className="mr-1">{cost.ptp}P</span>}
                        {cost.mtp > 0 && <span>{cost.mtp}M</span>}
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {totalCost > 0 ? (
                        <div className="text-sm font-semibold">
                          {totalPhysicalCost > 0 && (
                            <div className="text-blue-600">{totalPhysicalCost}P</div>
                          )}
                          {totalMentalCost > 0 && (
                            <div className="text-purple-600">{totalMentalCost}M</div>
                          )}
                          <div className="text-xs text-gray-500 mt-0.5 border-t border-gray-300 pt-0.5">
                            {totalCost} total
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Help Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">How to Use Auto-Training</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <div>
              <p className="mb-1"><strong>Frequency:</strong> How often to train a skill per level. Examples:</p>
              <ul className="ml-4 space-y-0.5">
                <li>• <strong>1</strong> = Train once per level</li>
                <li>• <strong>2</strong> = Train twice per level</li>
                <li>• <strong>0.5</strong> = Train once every 2 levels</li>
                <li>• <strong>0.25</strong> = Train once every 4 levels</li>
                <li>• <strong>1.5</strong> = Train 3 times every 2 levels</li>
              </ul>
            </div>
            <p>
              <strong>Target Ranks:</strong> Automatically calculated from your frequency and level range. Adjusts when you change frequency.
            </p>
            <p>
              <strong>Cost per Rank:</strong> Shows Physical (P) and Mental (M) TP cost per skill rank. Color indicates cost efficiency for your profession.
            </p>
          </div>
        </div>
      </div>

      {/* Training Breakdown */}
      {showBreakdown && autoTrainResult && (
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-gray-900">Level-by-Level Training Plan</h3>
            <button
              onClick={() => setShowBreakdown(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              Hide ✕
            </button>
          </div>
          <TrainingBreakdown
            result={autoTrainResult}
            startLevel={currentCharacter.currentLevel}
            endLevel={currentCharacter.targetLevel}
          />
        </div>
      )}
    </div>
  );
}
