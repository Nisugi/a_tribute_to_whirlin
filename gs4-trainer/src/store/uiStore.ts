/**
 * UI Store
 * Manages UI state and preferences
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ViewType =
  | 'character'
  | 'stats'
  | 'skills'
  | 'training'
  | 'enhancives'
  | 'ascension'
  | 'calculators'
  | 'tables';

interface UIState {
  // Current view
  currentView: ViewType;

  // Beginner mode (shows tooltips, help text, wizards)
  isBeginnerMode: boolean;

  // Sidebar collapsed (mobile/tablet)
  sidebarCollapsed: boolean;

  // Show empty skills in training view
  showEmptySkills: boolean;

  // Theme (for future dark mode)
  theme: 'light' | 'dark';

  // Actions
  setView: (view: ViewType) => void;
  toggleBeginnerMode: () => void;
  toggleSidebar: () => void;
  toggleShowEmptySkills: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentView: 'character',
      isBeginnerMode: true, // Default to beginner mode for new users
      sidebarCollapsed: false,
      showEmptySkills: false,
      theme: 'light',

      setView: (view) => set({ currentView: view }),

      toggleBeginnerMode: () =>
        set((state) => ({ isBeginnerMode: !state.isBeginnerMode })),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      toggleShowEmptySkills: () =>
        set((state) => ({ showEmptySkills: !state.showEmptySkills })),

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'gs4-trainer-ui', // localStorage key
    }
  )
);
