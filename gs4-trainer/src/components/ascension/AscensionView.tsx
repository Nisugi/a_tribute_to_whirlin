/**
 * Ascension View - Overall ascension management hub
 */

import { STATS, type StatName } from '../../types';
import { useCharacterStore } from '../../store/characterStore';
import {
  calculateEarnedATPs,
  calculateRemainingAEXP,
  calculateATPProgress,
  calculateTotalATPs,
  formatAEXP,
} from '../../engine/ascension/atpCalculator';
import { calculateMilestoneATPs } from '../../engine/ascension/milestoneTracker';
import { calculateTotalAbilityCost } from '../../data/ascensionAbilities';
import AscensionSkillTree from './AscensionSkillTree';
import MilestoneTracker from './MilestoneTracker';

const formatNumber = (value: number) => value.toLocaleString();

export default function AscensionView() {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);

  if (!currentCharacter) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-600">Select a character to manage ascension progress.</p>
      </div>
    );
  }

  const ascensionXP = currentCharacter.ascensionXP ?? 0;
  const ascensionData = currentCharacter.ascension;
  const milestoneATPs = calculateMilestoneATPs(ascensionData.milestones);
  const earnedATPs = calculateEarnedATPs(ascensionXP);
  const totalATPs = calculateTotalATPs(earnedATPs, milestoneATPs);
  const spentATPs = calculateTotalAbilityCost(ascensionData.selectedAbilities);
  const remainingATPs = totalATPs - spentATPs;
  const progressPercent = calculateATPProgress(ascensionXP);
  const remainingAEXP = calculateRemainingAEXP(ascensionXP);
  const statBonuses = ascensionData.bonuses;

  const statList = STATS as readonly StatName[];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 lg:col-span-2">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Ascension Progress</h2>
              <p className="text-sm text-gray-500 mt-1">
                Track ascension experience, milestone ATPs, and overall point budget.
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Ascension XP:{' '}
                <span className="font-semibold text-purple-700">{formatNumber(ascensionXP)}</span>
              </div>
              <div className="text-sm text-gray-600">
                Remaining to next ATP:{' '}
                <span className="font-semibold text-purple-700">{formatAEXP(remainingAEXP)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>0</span>
              <span>50K</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="text-xs uppercase text-gray-500">Earned ATPs</div>
              <div className="text-2xl font-bold text-gray-900">{earnedATPs}</div>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="text-xs uppercase text-gray-500">Milestone ATPs</div>
              <div className="text-2xl font-bold text-gray-900">{milestoneATPs}</div>
            </div>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="text-xs uppercase text-gray-500">Total ATP Budget</div>
              <div className="text-2xl font-bold text-gray-900">{totalATPs}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <div className="text-xs uppercase text-gray-500">ATP Spent</div>
              <div className="text-2xl font-semibold text-gray-900">{spentATPs}</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-xs uppercase text-gray-500">ATP Remaining</div>
              <div
                className={`text-2xl font-semibold ${
                  remainingATPs < 0 ? 'text-red-600' : 'text-green-700'
                }`}
              >
                {remainingATPs}
              </div>
              {remainingATPs < 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Reduce ranks or earn more ATPs to balance your plan.
                </p>
              )}
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-xs uppercase text-gray-500">Total Experience</div>
              <div className="text-2xl font-semibold text-gray-900">
                {formatNumber((currentCharacter.currentXP ?? 0) + ascensionXP)}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ascension Stat Bonuses</h3>
          <div className="grid grid-cols-2 gap-3">
            {statList.map((stat) => {
              const bonus = statBonuses?.[stat] ?? 0;
              return (
                <div
                  key={stat}
                  className={`p-3 rounded-lg border ${
                    bonus > 0 ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-xs font-semibold text-gray-500">{stat}</div>
                  <div className={`text-xl font-bold ${bonus > 0 ? 'text-purple-700' : 'text-gray-700'}`}>
                    {bonus > 0 ? `+${bonus}` : '+0'}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-4">
            These bonuses are applied to your base stats everywhere in the app.
            Adjust ranks in the skill tree to see immediate updates.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AscensionSkillTree />
        </div>
        <div>
          <MilestoneTracker />
        </div>
      </div>
    </div>
  );
}
