import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  EnhanciveItem,
  EnhanciveSet,
  EnhanciveSlot,
  EnhanciveProperty,
  SubscriptionTier,
  Stats,
  StatName,
} from '../types';
import { getSlotLimit } from '../data/enhanciveSlots';
import { calculateSkillBonusFromRanks, calculateRanksForBonus } from '../engine/skills/skillBonus';

const STAT_BASE_CAP = 40;
const STAT_BONUS_CAP = 20;
const SKILL_BONUS_CAP = 50;

const EMPTY_STATS: Stats = {
  STR: 0,
  CON: 0,
  DEX: 0,
  AGL: 0,
  DIS: 0,
  AUR: 0,
  LOG: 0,
  INT: 0,
  WIS: 0,
  INF: 0,
};

const DEFAULT_SET_ID = 'default';

interface EnhanciveState {
  subscriptionTier: SubscriptionTier;
  items: Record<string, EnhanciveItem>;
  sets: Record<string, EnhanciveSet>;
  activeSetId: string;
  addItem: (item: EnhanciveItem) => void;
  updateItem: (id: string, updates: Partial<EnhanciveItem>) => void;
  removeItem: (id: string) => void;
  addSet: (name: string) => string;
  renameSet: (id: string, name: string) => void;
  removeSet: (id: string) => void;
  setActiveSet: (id: string) => void;
  assignItemToSlot: (setId: string, slot: EnhanciveSlot, itemId: string) => void;
  removeItemFromSlot: (setId: string, slot: EnhanciveSlot, itemId: string) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
}

const ensureSetSlot = (set: EnhanciveSet, slot: EnhanciveSlot) => {
  if (!set.equipped[slot]) {
    set.equipped[slot] = [];
  }
};

export const useEnhanciveStore = create<EnhanciveState>()(
  immer((set) => ({
    subscriptionTier: 'prime',
    items: {},
    sets: {
      [DEFAULT_SET_ID]: {
        id: DEFAULT_SET_ID,
        name: 'Default',
        equipped: {} as Record<EnhanciveSlot, string[]>,
      },
    },
    activeSetId: DEFAULT_SET_ID,

    addItem: (item) =>
      set((state) => {
        state.items[item.id] = item;
      }),

    updateItem: (id, updates) =>
      set((state) => {
        if (state.items[id]) {
          state.items[id] = { ...state.items[id], ...updates };
        }
      }),

    removeItem: (id) =>
      set((state) => {
        delete state.items[id];
        Object.values(state.sets).forEach((setDef) => {
          for (const slot of Object.keys(setDef.equipped) as EnhanciveSlot[]) {
            setDef.equipped[slot] = setDef.equipped[slot].filter((itemId) => itemId !== id);
          }
        });
      }),

    addSet: (name) => {
      const id = crypto.randomUUID();
      set((state) => {
        state.sets[id] = { id, name, equipped: {} as Record<EnhanciveSlot, string[]> };
      });
      return id;
    },

    renameSet: (id, name) =>
      set((state) => {
        if (state.sets[id]) {
          state.sets[id].name = name;
        }
      }),

    removeSet: (id) =>
      set((state) => {
        if (id === DEFAULT_SET_ID) return;
        delete state.sets[id];
        if (state.activeSetId === id) {
          state.activeSetId = DEFAULT_SET_ID;
        }
      }),

    setActiveSet: (id) =>
      set((state) => {
        if (state.sets[id]) {
          state.activeSetId = id;
        }
      }),

    assignItemToSlot: (setId, slot, itemId) =>
      set((state) => {
        const setDef = state.sets[setId];
        const item = state.items[itemId];
        if (!setDef || !item || item.slot !== slot || !item.isFunctional) {
          return;
        }
        ensureSetSlot(setDef, slot);
        const current = setDef.equipped[slot];
        const limit = getSlotLimit(slot, state.subscriptionTier);
        if (current.includes(itemId)) return;
        if (current.length >= limit) return;
        current.push(itemId);
      }),

    removeItemFromSlot: (setId, slot, itemId) =>
      set((state) => {
        const setDef = state.sets[setId];
        if (!setDef?.equipped[slot]) return;
        setDef.equipped[slot] = setDef.equipped[slot].filter((id) => id !== itemId);
      }),

    setSubscriptionTier: (tier) =>
      set((state) => {
        state.subscriptionTier = tier;
        const active = state.sets[state.activeSetId];
        if (!active) return;
        for (const slot of Object.keys(active.equipped) as EnhanciveSlot[]) {
          const limit = getSlotLimit(slot, tier);
          if (active.equipped[slot].length > limit) {
            active.equipped[slot] = active.equipped[slot].slice(0, limit);
          }
        }
      }),
  }))
);

export interface AggregatedEnhanciveBonuses {
  stats: {
    base: Partial<Stats>;
    bonus: Partial<Stats>;
  };
  skills: Record<
    string,
    {
      bonus: number;
      ranksFromEnhancives: number;
    }
  >;
}

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

export function getActiveEnhanciveBonuses(state: EnhanciveState): AggregatedEnhanciveBonuses {
  const setDef = state.sets[state.activeSetId];
  const statsBase: Partial<Stats> = { ...EMPTY_STATS };
  const statsBonus: Partial<Stats> = { ...EMPTY_STATS };
  const skillBonuses: Record<string, { bonus: number; ranksFromEnhancives: number }> = {};

  if (!setDef) {
    return { stats: { base: statsBase, bonus: statsBonus }, skills: skillBonuses };
  }

  const collectProperty = (property: EnhanciveProperty) => {
    if (property.kind === 'stat') {
      const stat = property.stat;
      if (!statsBase[stat]) statsBase[stat] = 0;
      if (!statsBonus[stat]) statsBonus[stat] = 0;

      if (property.mode === 'base') {
        statsBase[stat]! += property.value;
      } else {
        statsBonus[stat]! += property.value;
      }
    } else {
      const entry = (skillBonuses[property.skillId] ||= { bonus: 0, ranksFromEnhancives: 0 });
      if (property.mode === 'bonus') {
        entry.bonus += property.value;
      } else {
        entry.ranksFromEnhancives += property.value;
        entry.bonus += calculateSkillBonusFromRanks(property.value);
      }
    }
  };

  for (const slot of Object.keys(setDef.equipped) as EnhanciveSlot[]) {
    for (const itemId of setDef.equipped[slot]) {
      const item = state.items[itemId];
      if (!item?.isFunctional) continue;
      item.properties.forEach(collectProperty);
    }
  }

  // Clamp stats
  (Object.keys(statsBase) as StatName[]).forEach((stat) => {
    statsBase[stat] = clamp(statsBase[stat] ?? 0, STAT_BASE_CAP);
    statsBonus[stat] = clamp(statsBonus[stat] ?? 0, STAT_BONUS_CAP);
  });

  // Clamp skills
  Object.values(skillBonuses).forEach((entry) => {
    if (entry.bonus > SKILL_BONUS_CAP) {
      entry.bonus = SKILL_BONUS_CAP;
      const ranks = calculateRanksForBonus(SKILL_BONUS_CAP);
      if (entry.ranksFromEnhancives > ranks) {
        entry.ranksFromEnhancives = ranks;
      }
    }
  });

  return {
    stats: { base: statsBase, bonus: statsBonus },
    skills: skillBonuses,
  };
}
