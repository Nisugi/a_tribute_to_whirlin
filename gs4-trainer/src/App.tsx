/**
 * GS4 Trainer - Main Application
 */

import { useEffect } from 'react';
import { useCharacterStore } from './store/characterStore';
import { useUIStore } from './store/uiStore';
import Header from './components/shared/Header';
import Sidebar from './components/shared/Sidebar';
import CharacterView from './components/character/CharacterView';
import StatsView from './components/stats/StatsView';
import TrainingView from './components/training/TrainingView';

function App() {
  const loadCharacters = useCharacterStore((state) => state.loadCharacters);
  const currentView = useUIStore((state) => state.currentView);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area (Header + Content) */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : 'ml-0 md:ml-64'
      }`}>
        {/* Header */}
        <Header />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[var(--bg-parchment)]">
          <div className="container mx-auto px-4 py-6 max-w-7xl">
            {currentView === 'character' && <CharacterView />}
            {currentView === 'stats' && <StatsView />}
            {currentView === 'training' && <TrainingView />}
            {currentView === 'enhancives' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-600">
                  Enhancives - Coming Soon
                </h2>
              </div>
            )}
            {currentView === 'ascension' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-600">
                  Ascension - Coming Soon
                </h2>
              </div>
            )}
            {currentView === 'calculators' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-600">
                  Calculators - Coming Soon
                </h2>
              </div>
            )}
            {currentView === 'tables' && (
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-gray-600">
                  Reference Tables - Coming Soon
                </h2>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
