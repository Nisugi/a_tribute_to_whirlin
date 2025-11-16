/**
 * Character Store
 * Manages character data using Zustand + Immer
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Character, StatName, StatGrowthRates, Stats, AscensionData } from '../types';
import { db } from '../utils/db';
import { calculateAllStatGrowthRates } from '../engine/stats/statsCalculator';
import { createDefaultMilestones } from '../engine/ascension/milestoneTracker';

const ZERO_STATS: Stats = {
  STR: 0, CON: 0, DEX: 0, AGL: 0, DIS: 0,
  AUR: 0, LOG: 0, INT: 0, WIS: 0, INF: 0,
};

const normalizeAscensionData = (ascension?: Partial<AscensionData>): AscensionData => ({
  totalExperience: ascension?.totalExperience ?? 0,
  milestones: {
    ...createDefaultMilestones(),
    ...(ascension?.milestones ?? {}),
  },
  selectedAbilities: ascension?.selectedAbilities ?? [],
  bonuses: {
    ...ZERO_STATS,
    ...(ascension?.bonuses ?? {}),
  },
});

const normalizeCharacter = (character: Character): Character => ({
  ...character,
  ascension: normalizeAscensionData(character.ascension),
});

interface CharacterState {
  // Current active character
  currentCharacter: Character | null;

  // List of all characters
  characters: Character[];

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCharacters: () => Promise<void>;
  setCurrentCharacter: (character: Character | null) => void;
  createCharacter: (data: Partial<Character>) => Promise<Character>;
  updateCharacter: (updates: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  importCharacter: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Character>;

  // Stat updates
  updateStat: (stat: StatName, value: number) => void;
  updateStatGrowthRate: (stat: StatName, rate: number) => void;

  // Training updates
  updateSkillCurrentRanks: (skillIndex: number, ranks: number) => void;
  updateSkillTargetRanks: (skillIndex: number, ranks: number) => void;
  updateSkillRankAtLevel: (skillIndex: number, level: number, ranks: number) => void;

  // Auto-save (debounced)
  saveCurrentCharacter: () => Promise<void>;
}

export const useCharacterStore = create<CharacterState>()(
  immer((set, get) => ({
    currentCharacter: null,
    characters: [],
    isLoading: false,
    error: null,

    // Load all characters from IndexedDB
    loadCharacters: async () => {
      set({ isLoading: true, error: null });
      try {
        const characters = await db.getAllCharacters();
        const normalizedCharacters = characters.map((character) => normalizeCharacter(character));
        console.log('[CharacterStore] Loaded characters from DB:', normalizedCharacters);
        set({ characters: normalizedCharacters, isLoading: false });

        // If there's only one character, set it as current
        if (normalizedCharacters.length === 1 && !get().currentCharacter) {
          console.log('[CharacterStore] Setting current character:', normalizedCharacters[0]);
          set({ currentCharacter: normalizedCharacters[0] });
        }
      } catch (error) {
        console.error('[CharacterStore] Failed to load characters:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to load characters',
          isLoading: false,
        });
      }
    },

    // Set the current active character
    setCurrentCharacter: (character) => {
      set({ currentCharacter: character });
    },

    // Create a new character
    createCharacter: async (data) => {
      const profession = data.profession || 'Warrior';
      const race = data.race || 'Human';

      // Calculate stat growth rates based on profession + race
      const calculatedGrowthRates = calculateAllStatGrowthRates(profession, race);
      const statGrowthRates: StatGrowthRates = Object.entries(calculatedGrowthRates).reduce(
        (acc, [stat, rate]) => {
          acc[stat as StatName] = { rate };
          return acc;
        },
        {} as StatGrowthRates
      );

      const newCharacter: Character = {
        id: crypto.randomUUID(),
        name: data.name || 'New Character',
        profession,
        race,
        currentXP: data.currentXP || 0,
        ascensionXP: data.ascensionXP || 0,
        currentLevel: data.currentLevel || 0,
        targetXP: data.targetXP || 0,
        targetLevel: data.targetLevel || 100,
        baseStats: data.baseStats || {
          STR: 50, CON: 50, DEX: 50, AGL: 50, DIS: 50,
          AUR: 50, LOG: 50, INT: 50, WIS: 50, INF: 50,
        },
        statGrowthRates: data.statGrowthRates || statGrowthRates,
        training: data.training || {},
        ascension: normalizeAscensionData(data.ascension),
        enhanciveSetId: data.enhanciveSetId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.saveCharacter(newCharacter);

      set((state) => {
        state.characters.push(newCharacter);
        state.currentCharacter = newCharacter;
      });

      return newCharacter;
    },

    // Update current character
    updateCharacter: async (updates) => {
      const { currentCharacter } = get();
      if (!currentCharacter) return;

      console.log('[CharacterStore] updateCharacter called with:', updates);

      set((state) => {
        if (state.currentCharacter) {
          Object.assign(state.currentCharacter, updates);
          state.currentCharacter.updatedAt = new Date();
          console.log('[CharacterStore] After update:', {
            currentLevel: state.currentCharacter.currentLevel,
            currentXP: state.currentCharacter.currentXP
          });
        }
      });

      // Auto-save will handle persistence via the debounced subscription
    },

    // Delete a character
    deleteCharacter: async (id) => {
      await db.deleteCharacter(id);

      set((state) => {
        state.characters = state.characters.filter((c) => c.id !== id);
        if (state.currentCharacter?.id === id) {
          state.currentCharacter = null;
        }
      });
    },

    // Import character from Excel or JSON
    importCharacter: async (importedData) => {
      const character: Character = {
        ...importedData,
        ascension: normalizeAscensionData(importedData.ascension),
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.saveCharacter(character);

      set((state) => {
        state.characters.push(character);
        state.currentCharacter = character;
      });

      return character;
    },

    // Update a single stat
    updateStat: (stat, value) => {
      set((state) => {
        if (state.currentCharacter) {
          state.currentCharacter.baseStats[stat] = value;
          state.currentCharacter.updatedAt = new Date();
        }
      });
    },

    // Update stat growth rate
    updateStatGrowthRate: (stat, rate) => {
      set((state) => {
        if (state.currentCharacter) {
          state.currentCharacter.statGrowthRates[stat].rate = rate;
          state.currentCharacter.updatedAt = new Date();
        }
      });
    },

    // Update skill current ranks
    updateSkillCurrentRanks: (skillIndex, ranks) => {
      set((state) => {
        if (state.currentCharacter) {
          if (!state.currentCharacter.training[skillIndex]) {
            state.currentCharacter.training[skillIndex] = {
              currentRanks: 0,
              targetRanks: 0,
              frequency: 0,
              ranksByLevel: Array(101).fill(0),
            };
          }
          state.currentCharacter.training[skillIndex].currentRanks = ranks;
          state.currentCharacter.updatedAt = new Date();
        }
      });
    },

    // Update skill target ranks
    updateSkillTargetRanks: (skillIndex, ranks) => {
      set((state) => {
        if (state.currentCharacter) {
          if (!state.currentCharacter.training[skillIndex]) {
            state.currentCharacter.training[skillIndex] = {
              currentRanks: 0,
              targetRanks: 0,
              frequency: 0,
              ranksByLevel: Array(101).fill(0),
            };
          }
          state.currentCharacter.training[skillIndex].targetRanks = ranks;
          state.currentCharacter.updatedAt = new Date();
        }
      });
    },

    // Update skill rank at specific level
    updateSkillRankAtLevel: (skillIndex, level, ranks) => {
      set((state) => {
        if (state.currentCharacter) {
          if (!state.currentCharacter.training[skillIndex]) {
            state.currentCharacter.training[skillIndex] = {
              currentRanks: 0,
              targetRanks: 0,
              frequency: 0,
              ranksByLevel: Array(101).fill(0),
            };
          }
          if (state.currentCharacter.training[skillIndex].ranksByLevel) {
            state.currentCharacter.training[skillIndex].ranksByLevel![level] = ranks;
          }
          state.currentCharacter.updatedAt = new Date();
        }
      });
    },

    // Save current character to IndexedDB
    saveCurrentCharacter: async () => {
      const { currentCharacter } = get();
      if (!currentCharacter) return;

      console.log('[CharacterStore] Saving character to DB:', {
        id: currentCharacter.id,
        name: currentCharacter.name,
        currentLevel: currentCharacter.currentLevel,
        currentXP: currentCharacter.currentXP
      });

      try {
        await db.saveCharacter(currentCharacter);
        console.log('[CharacterStore] Character saved successfully');

        // Update in characters array
        set((state) => {
          const index = state.characters.findIndex((c) => c.id === currentCharacter.id);
          if (index >= 0) {
            state.characters[index] = currentCharacter;
          }
        });
      } catch (error) {
        console.error('[CharacterStore] Failed to save character:', error);
        set({
          error: error instanceof Error ? error.message : 'Failed to save character',
        });
      }
    },
  }))
);

// Auto-save current character after 1 second of inactivity (debounced)
let autoSaveTimer: ReturnType<typeof setTimeout> | null = null;

useCharacterStore.subscribe((state) => {
  if (state.currentCharacter) {
    console.log('[CharacterStore] State changed, scheduling auto-save for:', {
      name: state.currentCharacter.name,
      currentLevel: state.currentCharacter.currentLevel,
      currentXP: state.currentCharacter.currentXP
    });

    if (autoSaveTimer) clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {
      console.log('[CharacterStore] Auto-save timer fired');
      state.saveCurrentCharacter();
    }, 1000);
  }
});
