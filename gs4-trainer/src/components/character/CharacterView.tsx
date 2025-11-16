/**
 * Character View - Character creation and selection
 */

import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import CharacterWizard from './CharacterWizard';
import MilestoneTracker from '../ascension/MilestoneTracker';
import { calculateEarnedATPs, calculateRemainingAEXP, calculateATPProgress, formatAEXP, calculateTotalATPs } from '../../engine/ascension/atpCalculator';
import { calculateMilestoneATPs } from '../../engine/ascension/milestoneTracker';
import type { StatName } from '../../types';

export default function CharacterView() {
  const [showWizard, setShowWizard] = useState(false);
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);
  const characters = useCharacterStore((state) => state.characters);
  const setCurrentCharacter = useCharacterStore((state) => state.setCurrentCharacter);
  const updateCharacter = useCharacterStore((state) => state.updateCharacter);
  const deleteCharacter = useCharacterStore((state) => state.deleteCharacter);

  // Local state for inputs
  const [levelInput, setLevelInput] = useState(currentCharacter?.currentLevel ?? 0);
  const [xpInput, setXpInput] = useState(currentCharacter?.currentXP ?? 0);
  const [ascensionXPInput, setAscensionXPInput] = useState(currentCharacter?.ascensionXP ?? 0);

  // Sync local state when character changes
  useEffect(() => {
    if (currentCharacter) {
      setLevelInput(currentCharacter.currentLevel);
      setXpInput(currentCharacter.currentXP);
      setAscensionXPInput(currentCharacter.ascensionXP ?? 0);
    }
  }, [currentCharacter]);

  const statEntries = currentCharacter
    ? (Object.entries(currentCharacter.baseStats) as Array<[StatName, number]>)
    : [];

  const handleDeleteCharacter = async () => {
    if (!currentCharacter) return;

    if (confirm(`Are you sure you want to delete ${currentCharacter.name}? This cannot be undone.`)) {
      await deleteCharacter(currentCharacter.id);
      setCurrentCharacter(null);
    }
  };

  if (showWizard) {
    return (
      <CharacterWizard
        onComplete={() => setShowWizard(false)}
        onCancel={() => setShowWizard(false)}
      />
    );
  }

  if (!currentCharacter) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome to GS4 Trainer
            </h1>
            <p className="text-lg text-gray-600">
              Your ultimate character training planner for GemStone IV
            </p>
          </div>

          {characters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Characters</h3>
              <div className="space-y-2">
                {characters.map((char) => (
                  <button
                    key={char.id}
                    onClick={() => setCurrentCharacter(char)}
                    className="w-full text-left px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary-50 hover:to-primary-100 rounded-lg transition-all border border-gray-200 hover:border-primary-300 shadow-sm hover:shadow-md"
                  >
                    <div className="font-semibold text-lg text-gray-900">{char.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {char.profession} • {char.race} • Level {char.currentLevel}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 text-center">
                {characters.length > 0 ? 'Add Another Character' : 'Get Started'}
              </h3>

              <button
                onClick={() => setShowWizard(true)}
                className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold text-lg rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Create New Character
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Or import your existing character from the Whirlin Trainer Excel file using the Import button in the header
              </p>
            </div>
          </div>
        </div>

        {characters.length === 0 && (
          <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">What is GS4 Trainer?</h4>
            <p className="text-sm text-blue-800 mb-3">
              GS4 Trainer is a modern web application that helps you plan your character's progression in GemStone IV.
              It preserves all the carefully designed formulas from Whirlin's Excel spreadsheet while providing a clean,
              user-friendly interface that works on any device.
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>Track stats, skills, and training progression</li>
              <li>Visualize stat growth with interactive charts</li>
              <li>Plan training across levels 0-100</li>
              <li>All calculations stay in your browser - 100% private</li>
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Character Overview
          </h2>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentCharacter(null)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Switch Character
            </button>
            <button
              onClick={handleDeleteCharacter}
              className="text-sm text-red-600 hover:text-red-800 font-semibold"
            >
              Delete Character
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={currentCharacter.name}
              onChange={(e) => updateCharacter({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Level
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={levelInput}
              onChange={(e) => setLevelInput(parseInt(e.target.value) || 0)}
              onBlur={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0 && value <= 100) {
                  updateCharacter({ currentLevel: value });
                } else {
                  setLevelInput(currentCharacter.currentLevel);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Race
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg font-semibold">
              {currentCharacter.race}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profession
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-lg font-semibold">
              {currentCharacter.profession}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experience
            </label>
            <input
              type="number"
              min="0"
              value={xpInput}
              onChange={(e) => setXpInput(parseInt(e.target.value) || 0)}
              onBlur={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  updateCharacter({ currentXP: value });
                } else {
                  setXpInput(currentCharacter.currentXP);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ascension Experience
            </label>
            <input
              type="number"
              min="0"
              value={ascensionXPInput}
              onChange={(e) => setAscensionXPInput(parseInt(e.target.value) || 0)}
              onBlur={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 0) {
                  updateCharacter({ ascensionXP: value });
                } else {
                  setAscensionXPInput(currentCharacter.ascensionXP ?? 0);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-purple-700">
                  {calculateEarnedATPs(currentCharacter.ascensionXP ?? 0)} Earned ATPs
                </span>
                <span className="text-xs text-gray-500">
                  {formatAEXP(calculateRemainingAEXP(currentCharacter.ascensionXP ?? 0))} to next
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateATPProgress(currentCharacter.ascensionXP ?? 0)}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-600">
                  +{calculateMilestoneATPs(currentCharacter.ascension.milestones)} Milestone ATPs
                </span>
                <span className="font-semibold text-purple-800">
                  = {calculateTotalATPs(
                    calculateEarnedATPs(currentCharacter.ascensionXP ?? 0),
                    calculateMilestoneATPs(currentCharacter.ascension.milestones)
                  )} Total ATPs
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Experience
            </label>
            <div className="px-3 py-2 bg-blue-50 rounded-lg font-semibold text-blue-900 border border-blue-200">
              {((currentCharacter.currentXP ?? 0) + (currentCharacter.ascensionXP ?? 0)).toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Experience + Ascension Experience</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Stats (Level 0)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statEntries.map(([stat, value]) => {
              const ascBonus = currentCharacter.ascension?.bonuses?.[stat] ?? 0;
              const totalValue = value + ascBonus;
              return (
                <div key={stat} className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div className="text-sm text-gray-600 font-medium mb-1">{stat}</div>
                  <div className="text-3xl font-bold text-primary">{totalValue}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Base {value}{' '}
                    {ascBonus > 0 && (
                      <span className="text-purple-700 font-semibold">+{ascBonus} Asc</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <MilestoneTracker />
        </div>
      </div>
    </div>
  );
}
