/**
 * Character Creation Wizard
 * Step-by-step character creation flow
 */

import { useState } from 'react';
import type { Profession, Race, Stats } from '../../types';
import { PROFESSIONS_LIST } from '../../data/professions';
import { RACES_LIST } from '../../data/races';
import { useCharacterStore } from '../../store/characterStore';
import { calculateAllStatGrowthRates } from '../../engine/stats/statsCalculator';
import { calculateOptimalStats } from '../../engine/stats/statOptimizer';

interface WizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export default function CharacterWizard({ onComplete, onCancel }: WizardProps) {
  const [step, setStep] = useState(1);
  const [characterName, setCharacterName] = useState('');
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [baseStats, setBaseStats] = useState<Stats>({
    STR: 50, CON: 50, DEX: 50, AGL: 50, DIS: 50,
    AUR: 50, LOG: 50, INT: 50, WIS: 50, INF: 50,
  });

  const createCharacter = useCharacterStore((state) => state.createCharacter);

  const totalStats = Object.values(baseStats).reduce((sum, val) => sum + val, 0);
  const statsValid = totalStats === 660;

  const handleCreate = async () => {
    if (!selectedProfession || !selectedRace || !statsValid) return;

    // User enters in-game stats which already include racial bonuses
    // These ARE the base stats - no conversion needed
    await createCharacter({
      name: characterName || `${selectedProfession} Character`,
      profession: selectedProfession,
      race: selectedRace,
      baseStats,
    });

    onComplete();
  };

  const updateStat = (stat: keyof Stats, value: number) => {
    setBaseStats((prev) => ({ ...prev, [stat]: Math.max(20, Math.min(100, value)) }));
  };

  const handleAutoOptimize = () => {
    if (!selectedProfession || !selectedRace) return;

    // Calculate growth rates based on profession + race
    const growthRates = calculateAllStatGrowthRates(selectedProfession, selectedRace);

    // Calculate optimal stat distribution
    const optimalStats = calculateOptimalStats(growthRates);

    setBaseStats(optimalStats);
  };

  // Step 1: Name & Profession
  if (step === 1) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Character</h2>
          <p className="text-gray-600">Step 1 of 3: Choose a Profession</p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Character Name (optional)
          </label>
          <input
            type="text"
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="Enter character name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Your Profession</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {PROFESSIONS_LIST.map((prof) => (
              <button
                key={prof.id}
                onClick={() => setSelectedProfession(prof.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedProfession === prof.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="font-bold text-lg mb-1">{prof.name}</div>
                <div className="text-sm text-gray-600 mb-2">{prof.description}</div>
                <div className="text-xs text-gray-500">
                  Prime: {prof.primeStats.join(', ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => setStep(2)}
            disabled={!selectedProfession}
            className={`px-8 py-3 text-white font-semibold rounded-lg shadow-lg transition-all text-lg ${
              selectedProfession
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Next: Choose Race →
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Race
  if (step === 2) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Character</h2>
          <p className="text-gray-600">Step 2 of 3: Choose a Race</p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Select Your Race</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {RACES_LIST.map((race) => (
              <button
                key={race.id}
                onClick={() => setSelectedRace(race.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedRace === race.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <div className="font-bold text-lg mb-1">{race.name}</div>
                <div className="text-sm text-gray-600 mb-2">{race.description}</div>
                <div className="text-xs text-gray-500 flex flex-wrap gap-1">
                  {Object.entries(race.statBonuses)
                    .filter(([_, val]) => val !== 0)
                    .map(([stat, val]) => (
                      <span
                        key={stat}
                        className={val > 0 ? 'text-green-600' : 'text-red-600'}
                      >
                        {stat} {val > 0 ? '+' : ''}{val}
                      </span>
                    ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setStep(1)}
            className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => setStep(3)}
            disabled={!selectedRace}
            className={`px-8 py-3 text-white font-semibold rounded-lg shadow-lg transition-all text-lg ${
              selectedRace
                ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl transform hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            Next: Set Stats →
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Stats
  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Character</h2>
        <p className="text-gray-600">Step 3 of 3: Enter Your Stats</p>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900 mb-3">
          <strong>Instructions:</strong> Enter your stats exactly as they appear in-game at level 0.
          Use the <code className="bg-blue-100 px-1 rounded font-mono">INFO</code> command in-game to see your current stats.
        </p>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-blue-900">Total Stats:</span>
          <span
            className={`text-2xl font-bold ${
              totalStats === 660 ? 'text-green-600' : totalStats < 660 ? 'text-orange-600' : 'text-red-600'
            }`}
          >
            {totalStats} / 660
          </span>
        </div>
        {!statsValid && (
          <p className="text-sm text-orange-600 mt-2">
            Your total must equal 660 points (including racial bonuses)
          </p>
        )}
      </div>

      <div className="mb-6">
        <button
          onClick={handleAutoOptimize}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all"
        >
          ✨ Auto-Optimize Stats (Reach 100 in all stats with minimal waste)
        </button>
        <p className="text-xs text-gray-500 mt-2 text-center">
          This will calculate the optimal stat distribution to reach 100 in all stats at level 100, using Influence as a dump stat for remaining points.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {Object.keys(baseStats).map((stat) => {
          const statKey = stat as keyof Stats;

          return (
            <div key={stat} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">{stat}</span>
                <span className="text-2xl font-bold text-primary">
                  {baseStats[statKey]}
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="100"
                value={baseStats[statKey]}
                onChange={(e) => updateStat(statKey, parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between gap-2 mt-2">
                <button
                  onClick={() => updateStat(statKey, baseStats[statKey] - 5)}
                  className="flex-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  -5
                </button>
                <button
                  onClick={() => updateStat(statKey, baseStats[statKey] - 1)}
                  className="flex-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  -1
                </button>
                <button
                  onClick={() => updateStat(statKey, baseStats[statKey] + 1)}
                  className="flex-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  +1
                </button>
                <button
                  onClick={() => updateStat(statKey, baseStats[statKey] + 5)}
                  className="flex-1 px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
                >
                  +5
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center">
        <button
          onClick={() => setStep(2)}
          className="px-6 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleCreate}
          disabled={!statsValid}
          className={`px-8 py-3 text-white font-bold rounded-lg shadow-lg transition-all text-lg ${
            statsValid
              ? 'bg-green-600 hover:bg-green-700 hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          ✓ Create Character
        </button>
      </div>
    </div>
  );
}
