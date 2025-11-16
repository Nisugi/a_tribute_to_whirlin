/**
 * Skills View - Aggregated skill ranks/bonuses across base training and ascension
 */

import { useMemo, useState } from 'react';
import { useCharacterStore } from '../../store/characterStore';
import { useUIStore } from '../../store/uiStore';
import {
  SKILLS,
  SKILL_CATEGORIES,
  type SkillCategory,
} from '../../data/skills';
import {
  ALL_ABILITIES,
  normalizeAbilityId,
} from '../../data/ascensionAbilities';
import { calculateSkillBonusFromRanks } from '../../engine/skills/skillBonus';

const abilityMap = new Map(ALL_ABILITIES.map((ability) => [ability.id, ability]));
const normalizedSkillIndex = new Map<string, number>();
for (const skill of SKILLS) {
  normalizedSkillIndex.set(normalizeAbilityId(skill.name), skill.index);
  normalizedSkillIndex.set(normalizeAbilityId(skill.id), skill.index);
}

const categoryOrder = Object.keys(SKILL_CATEGORIES) as SkillCategory[];
const defaultCategory =
  categoryOrder[0] ?? ('weapon' as SkillCategory);

const formatNumber = (value: number) => value.toLocaleString();

export default function SkillsView() {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);
  const showEmptySkills = useUIStore((state) => state.showEmptySkills);
  const toggleShowEmptySkills = useUIStore((state) => state.toggleShowEmptySkills);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>(defaultCategory);

  if (!currentCharacter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Select or create a character to view skill details.</p>
      </div>
    );
  }

  const training = currentCharacter.training || {};
  const ascensionSelections = currentCharacter.ascension?.selectedAbilities ?? [];

  const ascensionSkillBonuses = useMemo(() => {
    const map = new Map<number, number>();
    for (const selection of ascensionSelections) {
      const ability = abilityMap.get(selection.abilityId);
      if (!ability || ability.category !== 'Skill') continue;
      const skillIndex = normalizedSkillIndex.get(normalizeAbilityId(ability.name ?? ability.id));
      if (skillIndex === undefined) continue;
      map.set(skillIndex, (map.get(skillIndex) ?? 0) + selection.ranks);
    }
    return map;
  }, [ascensionSelections]);

  const totalAscensionBonus = useMemo(
    () => Array.from(ascensionSkillBonuses.values()).reduce((sum, value) => sum + value, 0),
    [ascensionSkillBonuses]
  );

  const trainedSkillCount = useMemo(() => {
    let total = 0;
    for (const skill of SKILLS) {
      const ranks = training[skill.index]?.currentRanks ?? 0;
      if (ranks > 0) total++;
    }
    return total;
  }, [training]);

  const categorySkills = useMemo(
    () =>
      SKILLS.filter((skill) => skill.category === selectedCategory).sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    [selectedCategory]
  );

  const categoryRollup = useMemo(() => {
    let baseCurrent = 0;
    let baseTarget = 0;
    let ascension = 0;

    for (const skill of categorySkills) {
      baseCurrent += training[skill.index]?.currentRanks ?? 0;
      baseTarget += training[skill.index]?.targetRanks ?? 0;
      ascension += ascensionSkillBonuses.get(skill.index) ?? 0;
    }

    return {
      baseCurrent,
      baseTarget,
      ascensionBonus: ascension,
    };
  }, [categorySkills, training, ascensionSkillBonuses]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex flex-wrap gap-6 justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Skills Overview</h2>
            <p className="text-sm text-gray-600 mt-1">
              Combined skill ranks from base training, ascension abilities, and (soon) enhancives.
            </p>
          </div>
          <button
            onClick={toggleShowEmptySkills}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium hover:border-blue-400 hover:text-blue-600 transition-colors"
          >
            {showEmptySkills ? 'Hide' : 'Show'} zero-rank skills
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs uppercase text-gray-500">Active Skills</div>
            <div className="text-3xl font-semibold text-gray-900">{trainedSkillCount}</div>
            <p className="text-xs text-gray-500 mt-1">Skills with at least 1 trained rank</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs uppercase text-gray-500">Ascension Bonus</div>
            <div className="text-3xl font-semibold text-purple-700">+{totalAscensionBonus}</div>
            <p className="text-xs text-gray-500 mt-1">Bonus points granted via ascension</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs uppercase text-gray-500">Category Focus</div>
            <div className="text-lg font-semibold text-gray-900">
              {SKILL_CATEGORIES[selectedCategory]}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatNumber(categoryRollup.baseCurrent)} base ranks • +{categoryRollup.ascensionBonus} ascension bonus
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          {categoryOrder.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {SKILL_CATEGORIES[category]}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Skill</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Current Ranks</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Current Bonus</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Target Ranks</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Target Bonus</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Ascension</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Enhancive</th>
              </tr>
            </thead>
            <tbody>
              {categorySkills.map((skill, index) => {
                const baseCurrent = training[skill.index]?.currentRanks ?? 0;
                const baseTarget = training[skill.index]?.targetRanks ?? 0;
                const ascensionBonus = ascensionSkillBonuses.get(skill.index) ?? 0;
                const currentBonus = calculateSkillBonusFromRanks(baseCurrent) + ascensionBonus;
                const targetBonus = calculateSkillBonusFromRanks(baseTarget) + ascensionBonus;
                const belowTarget = baseCurrent < baseTarget;
                const shouldRender =
                  showEmptySkills ||
                  baseCurrent > 0 ||
                  baseTarget > 0 ||
                  ascensionBonus > 0;

                if (!shouldRender) {
                  return null;
                }

                return (
                  <tr
                    key={skill.id}
                    className={`${
                      belowTarget ? 'bg-amber-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } border-b border-gray-100`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{skill.name}</div>
                      <p className="text-xs text-gray-500">{skill.description}</p>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="text-lg font-semibold text-gray-900">{baseCurrent}</div>
                      <div className="text-xs text-gray-500">
                        Base ranks
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="text-lg font-semibold text-gray-900">{currentBonus}</div>
                      <div className="text-xs text-gray-500">
                        {calculateSkillBonusFromRanks(baseCurrent)} base + {ascensionBonus} asc
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="text-lg font-semibold text-gray-900">{baseTarget}</div>
                      <div className="text-xs text-gray-500">
                        Target ranks
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="text-lg font-semibold text-gray-900">{targetBonus}</div>
                      <div className="text-xs text-gray-500">
                        {calculateSkillBonusFromRanks(baseTarget)} base + {ascensionBonus} asc
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      {ascensionBonus > 0 ? (
                        <span className="text-sm font-semibold text-purple-700">+{ascensionBonus} bonus</span>
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-xs text-gray-400">Pending (Enhancives)</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500">
          Skill bonuses are calculated as base ranks × 5. Ascension adds straight bonus points (shown above) and enhancive contributions will appear once enhancive sets are implemented.
        </p>
      </div>
    </div>
  );
}
