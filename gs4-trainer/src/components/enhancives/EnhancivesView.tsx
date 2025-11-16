/**
 * Enhancives View - manage enhancive items, slots, and sets
 */

import { useMemo, useState } from 'react';
import {
  useEnhanciveStore,
} from '../../store/enhanciveStore';
import { ENHANCIVE_SLOT_DEFINITIONS } from '../../data/enhanciveSlots';
import type {
  EnhanciveSlot,
  EnhanciveProperty,
  EnhanciveItem,
  StatName,
} from '../../types';
import { STATS } from '../../types';
import { SKILLS } from '../../data/skills';

const statOptions = STATS;
const skillOptions = SKILLS.map((skill) => ({ id: skill.id, name: skill.name }));

interface NewItemFormState {
  name: string;
  slot: EnhanciveSlot;
  propertyKind: 'stat' | 'skill';
  stat: StatName;
  statMode: 'base' | 'bonus';
  skillId: string;
  skillMode: 'bonus' | 'ranks';
  value: number;
}

const defaultFormState: NewItemFormState = {
  name: '',
  slot: 'pin',
  propertyKind: 'stat',
  stat: 'STR',
  statMode: 'base',
  skillId: skillOptions[0]?.id ?? 'combat-maneuvers',
  skillMode: 'bonus',
  value: 5,
};

export default function EnhancivesView() {
  const [formState, setFormState] = useState<NewItemFormState>(defaultFormState);
  const enhanciveBonuses = useEnhanciveStore((state) => state.aggregatedBonuses);
  const subscriptionTier = useEnhanciveStore((state) => state.subscriptionTier);
  const setSubscriptionTier = useEnhanciveStore((state) => state.setSubscriptionTier);
  const items = useEnhanciveStore((state) => state.items);
  const addItem = useEnhanciveStore((state) => state.addItem);
  const removeItem = useEnhanciveStore((state) => state.removeItem);
  const sets = useEnhanciveStore((state) => state.sets);
  const addSet = useEnhanciveStore((state) => state.addSet);
  const activeSetId = useEnhanciveStore((state) => state.activeSetId);
  const setActiveSet = useEnhanciveStore((state) => state.setActiveSet);
  const assignItemToSlot = useEnhanciveStore((state) => state.assignItemToSlot);
  const removeItemFromSlot = useEnhanciveStore((state) => state.removeItemFromSlot);

  const activeSet = sets[activeSetId];
  const itemsList = Object.values(items);
  const slotUsage = useMemo(() => {
    const usage: Record<EnhanciveSlot, number> = {} as Record<EnhanciveSlot, number>;
    if (activeSet) {
      for (const slot of Object.keys(activeSet.equipped) as EnhanciveSlot[]) {
        usage[slot] = activeSet.equipped[slot]?.length ?? 0;
      }
    }
    return usage;
  }, [activeSet]);

  const handleAddSet = () => {
    const id = addSet(`Set ${Object.keys(sets).length + 1}`);
    setActiveSet(id);
  };

  const handleAddItem = (event: React.FormEvent) => {
    event.preventDefault();
    if (!formState.name.trim()) return;

    let property: EnhanciveProperty;
    if (formState.propertyKind === 'stat') {
      property = {
        kind: 'stat',
        stat: formState.stat,
        mode: formState.statMode,
        value: Number(formState.value),
      };
    } else {
      property = {
        kind: 'skill',
        skillId: formState.skillId,
        mode: formState.skillMode,
        value: Number(formState.value),
      };
    }

    const item: EnhanciveItem = {
      id: crypto.randomUUID(),
      name: formState.name.trim(),
      slot: formState.slot,
      properties: [property],
      isFunctional: true,
    };

    addItem(item);
    setFormState(defaultFormState);
  };

  const handleEquipToggle = (item: EnhanciveItem) => {
    if (!activeSet) return;
    const equippedItems = activeSet.equipped[item.slot] ?? [];
    if (equippedItems.includes(item.id)) {
      removeItemFromSlot(activeSet.id, item.slot, item.id);
    } else {
      assignItemToSlot(activeSet.id, item.slot, item.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Enhancives</h2>
            <p className="text-sm text-gray-600 mt-1">
              Track enhancive items, manage slot usage, and preview stat/skill bonuses applied to your character.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <div>
              <label className="text-xs uppercase text-gray-500 block">Subscription Tier</label>
              <select
                value={subscriptionTier}
                onChange={(e) => setSubscriptionTier(e.target.value as any)}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="prime">Prime</option>
                <option value="premium">Premium</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase text-gray-500 block">Active Set</label>
              <div className="flex gap-2 mt-1">
                <select
                  value={activeSetId}
                  onChange={(e) => setActiveSet(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  {Object.values(sets).map((setDef) => (
                    <option key={setDef.id} value={setDef.id}>
                      {setDef.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddSet}
                  className="px-3 py-2 text-sm bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
                >
                  + New Set
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mt-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs uppercase text-gray-500">Equipped Items</div>
            <div className="text-3xl font-semibold text-gray-900">
              {activeSet
                ? Object.values(activeSet.equipped).reduce((sum, items) => sum + (items?.length ?? 0), 0)
                : 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Items active in current set</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs uppercase text-gray-500">Stat Bonus</div>
            <div className="text-3xl font-semibold text-purple-700">
              +{Object.values(enhanciveBonuses.stats.base).reduce((sum, value) => sum + (value ?? 0), 0) +
                Object.values(enhanciveBonuses.stats.bonus).reduce((sum, value) => sum + (value ?? 0), 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Combined base + bonus points</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="text-xs uppercase text-gray-500">Skill Bonus</div>
            <div className="text-3xl font-semibold text-emerald-700">
              +{Object.values(enhanciveBonuses.skills).reduce((sum, entry) => sum + entry.bonus, 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Bonus points from enhancives</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Slot Usage</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-300">
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-600">Slot</th>
                <th className="text-center px-4 py-2 text-sm font-semibold text-gray-600">Used</th>
                <th className="text-center px-4 py-2 text-sm font-semibold text-gray-600">Limit</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(ENHANCIVE_SLOT_DEFINITIONS).map((slot) => {
                const used = slotUsage[slot.id] ?? 0;
                const limit = slot.functionalLimit[subscriptionTier];
                const over = used > limit;
                return (
                  <tr key={slot.id} className={over ? 'bg-red-50' : ''}>
                    <td className="px-4 py-2 text-sm text-gray-900">{slot.label}</td>
                    <td className="text-center px-4 py-2 text-sm font-semibold">
                      {used}
                    </td>
                    <td className="text-center px-4 py-2 text-sm text-gray-600">{limit}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 border border-gray-200 space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Add Enhancive Item</h3>
          <form onSubmit={handleAddItem} className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-gray-500">Name</label>
              <input
                type="text"
                value={formState.name}
                onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-gray-500">Slot</label>
              <select
                value={formState.slot}
                onChange={(e) => setFormState((prev) => ({ ...prev, slot: e.target.value as EnhanciveSlot }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.values(ENHANCIVE_SLOT_DEFINITIONS).map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-gray-500">Property Type</label>
              <select
                value={formState.propertyKind}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, propertyKind: e.target.value as 'stat' | 'skill' }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="stat">Stat</option>
                <option value="skill">Skill</option>
              </select>
            </div>

            {formState.propertyKind === 'stat' ? (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase text-gray-500">Stat</label>
                  <select
                    value={formState.stat}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, stat: e.target.value as StatName }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {statOptions.map((stat) => (
                      <option key={stat} value={stat}>
                        {stat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase text-gray-500">Mode</label>
                  <select
                    value={formState.statMode}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, statMode: e.target.value as 'base' | 'bonus' }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="base">Base (+2 counts as +1 bonus)</option>
                    <option value="bonus">Bonus</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase text-gray-500">Skill</label>
                  <select
                    value={formState.skillId}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, skillId: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {skillOptions.map((skill) => (
                      <option key={skill.id} value={skill.id}>
                        {skill.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase text-gray-500">Mode</label>
                  <select
                    value={formState.skillMode}
                    onChange={(e) =>
                      setFormState((prev) => ({ ...prev, skillMode: e.target.value as 'bonus' | 'ranks' }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bonus">Bonus (+1)</option>
                    <option value="ranks">Ranks (converted to bonus, capped at +50)</option>
                  </select>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase text-gray-500">Value</label>
              <input
                type="number"
                min="1"
                value={formState.value}
                onChange={(e) =>
                  setFormState((prev) => ({ ...prev, value: parseInt(e.target.value) || 0 }))
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Item
              </button>
            </div>
          </form>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Item Library</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-sm text-gray-600">
                  <th className="text-left px-4 py-2">Name</th>
                  <th className="text-center px-4 py-2">Slot</th>
                  <th className="text-left px-4 py-2">Properties</th>
                  <th className="text-center px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {itemsList.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center px-4 py-8 text-gray-500">
                      No enhancive items added yet.
                    </td>
                  </tr>
                )}
                {itemsList.map((item, index) => {
                  const equipped = activeSet?.equipped[item.slot]?.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    >
                      <td className="px-4 py-2 text-sm font-semibold text-gray-900">
                        {item.name}
                      </td>
                      <td className="text-center px-4 py-2 text-sm text-gray-600">
                        {ENHANCIVE_SLOT_DEFINITIONS[item.slot]?.label ?? item.slot}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-600 space-y-1">
                        {item.properties.map((property, idx) => (
                          <div key={idx}>
                            {property.kind === 'stat' ? (
                              <span>
                                {property.stat} {property.mode === 'base' ? 'base' : 'bonus'} +{property.value}
                              </span>
                            ) : (
                              <span>
                                {SKILLS.find((skill) => skill.id === property.skillId)?.name ??
                                  property.skillId}{' '}
                                {property.mode} +{property.value}
                              </span>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="text-center px-4 py-2 text-sm">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => handleEquipToggle(item)}
                            className={`px-3 py-1 rounded ${
                              equipped
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {equipped ? 'Unequip' : 'Equip'}
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="px-3 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
