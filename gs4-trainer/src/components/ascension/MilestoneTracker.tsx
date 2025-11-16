/**
 * Milestone Tracker Component
 * Allows users to toggle ascension milestone completions
 */

import { useCharacterStore } from '../../store/characterStore';
import {
  getMilestonesByCategory,
  calculateMilestoneATPs,
} from '../../engine/ascension/milestoneTracker';
import type { AscensionMilestones } from '../../types';

export default function MilestoneTracker() {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);

  if (!currentCharacter) {
    return null;
  }

  const milestones = currentCharacter.ascension?.milestones;
  if (!milestones) {
    return null;
  }

  const milestoneATPs = calculateMilestoneATPs(milestones);
  const { level: levelMilestones, achievement: achievementMilestones } =
    getMilestonesByCategory();

  const handleToggleMilestone = (milestoneId: keyof AscensionMilestones) => {
    const updatedMilestones = {
      ...milestones,
      [milestoneId]: !milestones[milestoneId],
    };

    updateCharacter({
      ascension: {
        ...currentCharacter.ascension,
        milestones: updatedMilestones,
      },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Milestone Tracker</h3>
        <div className="text-sm">
          <span className="font-medium text-purple-700">{milestoneATPs} Milestone ATPs</span>
        </div>
      </div>

      {/* Level Milestones */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Level Milestones</h4>
        <div className="space-y-2">
          {levelMilestones.map((milestone) => (
            <label
              key={milestone.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={milestones[milestone.id]}
                onChange={() => handleToggleMilestone(milestone.id)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{milestone.label}</div>
                <div className="text-xs text-gray-500">{milestone.description}</div>
              </div>
              <div className="text-xs font-medium text-purple-600">+{milestone.atpReward} ATP</div>
            </label>
          ))}
        </div>
      </div>

      {/* Achievement Milestones */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Achievement Milestones</h4>
        <div className="space-y-2">
          {achievementMilestones.map((milestone) => (
            <label
              key={milestone.id}
              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={milestones[milestone.id]}
                onChange={() => handleToggleMilestone(milestone.id)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{milestone.label}</div>
                <div className="text-xs text-gray-500">{milestone.description}</div>
              </div>
              <div className="text-xs font-medium text-purple-600">+{milestone.atpReward} ATP</div>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Milestones grant bonus ATPs in addition to those earned from Ascension Experience.
          Toggle the checkboxes above to track which milestones you have completed.
        </p>
      </div>
    </div>
  );
}
