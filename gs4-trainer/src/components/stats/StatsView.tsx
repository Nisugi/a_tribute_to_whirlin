/**
 * Stats View - Stat management and progression
 */

import { useCharacterStore } from '../../store/characterStore';
import {
  calculateAllStatGrowthRates,
  getStatsAtLevel
} from '../../engine/stats/statsCalculator';
import { calculateStatBonus } from '../../engine/stats/statBonusCalculator';
import { RACE_DATA } from '../../data/races';
import type { StatName } from '../../types';
import StatProgressionChart from './StatProgressionChart';

const STAT_NAMES: StatName[] = ['STR', 'CON', 'DEX', 'AGL', 'DIS', 'AUR', 'LOG', 'INT', 'WIS', 'INF'];

const STAT_FULL_NAMES: Record<StatName, string> = {
  STR: 'Strength',
  CON: 'Constitution',
  DEX: 'Dexterity',
  AGL: 'Agility',
  DIS: 'Discipline',
  AUR: 'Aura',
  LOG: 'Logic',
  INT: 'Intuition',
  WIS: 'Wisdom',
  INF: 'Influence',
};

export default function StatsView() {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);

  if (!currentCharacter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No character selected</p>
      </div>
    );
  }

  const handleStatChange = (stat: StatName, value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    updateCharacter({
      baseStats: {
        ...currentCharacter.baseStats,
        [stat]: clampedValue
      }
    });
  };

  // Get race data for displaying racial adjustments
  const raceData = RACE_DATA[currentCharacter.race];

  // Calculate growth rates based on profession + race
  const growthRates = calculateAllStatGrowthRates(
    currentCharacter.profession,
    currentCharacter.race
  );

  // Calculate current stats at current level
  // baseStats already include racial bonuses (they are the in-game values)
  const currentStats = getStatsAtLevel(
    currentCharacter.baseStats,
    growthRates,
    currentCharacter.currentLevel
  );

  // Calculate target stats at target level
  const targetStats = getStatsAtLevel(
    currentCharacter.baseStats,
    growthRates,
    currentCharacter.targetLevel
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Stats</h2>
          <div className="text-sm text-gray-600">
            <div>Current Level: <span className="font-semibold">{currentCharacter.currentLevel}</span></div>
            <div>Target Level: <span className="font-semibold">{currentCharacter.targetLevel}</span></div>
          </div>
        </div>

        {/* Stats Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stat</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Base (Lvl 0)</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Current (Lvl {currentCharacter.currentLevel})
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Growth Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Target (Lvl {currentCharacter.targetLevel})
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Gain</th>
              </tr>
            </thead>
            <tbody>
              {STAT_NAMES.map((stat, index) => {
                const baseStat = currentCharacter.baseStats[stat];
                const currentStat = currentStats[stat];
                const targetStat = targetStats[stat];
                const gain = targetStat - currentStat;
                const growthRate = growthRates[stat];

                // Calculate bonuses
                const baseBonus = calculateStatBonus(baseStat);
                const currentBonus = calculateStatBonus(currentStat);
                const targetBonus = calculateStatBonus(targetStat);

                return (
                  <tr
                    key={stat}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-600">{stat}</span>
                        <span className="text-sm">{STAT_FULL_NAMES[stat]}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={baseStat}
                          onChange={(e) => handleStatChange(stat, e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span className="text-sm text-gray-500">({baseBonus >= 0 ? '+' : ''}{baseBonus})</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold text-lg">
                      {currentStat} <span className="text-sm text-gray-600">({currentBonus >= 0 ? '+' : ''}{currentBonus})</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-sm text-gray-600">{growthRate}</span>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold text-lg text-blue-600">
                      {targetStat} <span className="text-sm text-gray-600">({targetBonus >= 0 ? '+' : ''}{targetBonus})</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      {gain > 0 ? (
                        <span className="text-green-600 font-semibold">+{gain}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                <td className="py-3 px-4">Total</td>
                <td className="text-center py-3 px-4">
                  {Object.values(currentCharacter.baseStats).reduce((sum, val) => sum + val, 0)}
                </td>
                <td className="text-center py-3 px-4 text-lg">
                  {STAT_NAMES.reduce((sum, stat) => sum + currentStats[stat], 0)}
                </td>
                <td className="text-center py-3 px-4">—</td>
                <td className="text-center py-3 px-4 text-lg text-blue-600">
                  {STAT_NAMES.reduce((sum, stat) => sum + targetStats[stat], 0)}
                </td>
                <td className="text-center py-3 px-4 text-green-600">
                  +{STAT_NAMES.reduce((sum, stat) => sum + (targetStats[stat] - currentStats[stat]), 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Racial Stat Adjustments */}
        <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-3">Racial Stat Adjustments ({currentCharacter.race})</h3>
          <p className="text-sm text-purple-800 mb-3">
            These adjustments were applied during character creation and are already included in your Base stats above:
          </p>
          <div className="flex flex-wrap gap-2">
            {STAT_NAMES.map((stat) => {
              const adjustment = raceData.statBonuses[stat];
              if (adjustment === 0) return null;
              return (
                <div
                  key={stat}
                  className={`px-3 py-1 rounded font-medium ${
                    adjustment > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {stat}: {adjustment > 0 ? '+' : ''}{adjustment}
                </div>
              );
            })}
            {STAT_NAMES.every((stat) => raceData.statBonuses[stat] === 0) && (
              <span className="text-sm text-purple-700 italic">No racial stat adjustments</span>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Growth Rate Information</h3>
          <p className="text-sm text-blue-800">
            Growth rates are automatically calculated based on your profession ({currentCharacter.profession})
            and race ({currentCharacter.race}). The growth rate determines how your stats increase as you level up.
            A lower growth rate means the stat increases more frequently.
          </p>
        </div>
      </div>

      {/* Stat Progression Chart */}
      <div className="mt-6">
        <StatProgressionChart
          baseStats={currentCharacter.baseStats}
          growthRates={growthRates}
          targetLevel={currentCharacter.targetLevel}
          currentLevel={currentCharacter.currentLevel}
        />
      </div>
    </div>
  );
}
