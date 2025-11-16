/**
 * Header Component
 */

import { useCharacterStore } from '../../store/characterStore';
import { useUIStore } from '../../store/uiStore';
import { importFromExcel, downloadJSON } from '../../utils/excelImport';

export default function Header() {
  const currentCharacter = useCharacterStore((state) => state.currentCharacter);
  const importCharacter = useCharacterStore((state) => state.importCharacter);
  const isBeginnerMode = useUIStore((state) => state.isBeginnerMode);
  const toggleBeginnerMode = useUIStore((state) => state.toggleBeginnerMode);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importFromExcel(file);

    if (result.success && result.character) {
      await importCharacter(result.character);
      alert('Character imported successfully!');
    } else {
      alert('Import failed:\n' + result.errors.join('\n'));
    }

    // Reset file input
    e.target.value = '';
  };

  const handleExport = () => {
    if (!currentCharacter) {
      alert('No character to export');
      return;
    }

    downloadJSON(
      currentCharacter,
      `${currentCharacter.name.replace(/\s+/g, '_')}.json`
    );
  };

  return (
    <header className="bg-slate-800 text-white shadow-lg" style={{ backgroundColor: '#1e293b' }}>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Menu + Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-serif text-white">
                GS4 Trainer
              </h1>
              <p className="text-sm text-gray-300 hidden md:block">
                GemStone IV Character Training Calculator
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Character Name */}
            {currentCharacter && (
              <div className="hidden md:block text-right mr-4 text-white">
                <div className="font-semibold text-white">{currentCharacter.name}</div>
                <div className="text-sm text-gray-300">
                  {currentCharacter.profession} - {currentCharacter.race}
                </div>
              </div>
            )}

            {/* Import Excel */}
            <label className="cursor-pointer px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium text-white">
              <input
                type="file"
                accept=".xlsm,.xlsx"
                onChange={handleImportExcel}
                className="hidden"
              />
              <span className="hidden md:inline">Import Excel</span>
              <span className="md:hidden">Import</span>
            </label>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={!currentCharacter}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium text-white"
            >
              <span className="hidden md:inline">Export</span>
              <span className="md:hidden">Save</span>
            </button>

            {/* Beginner Mode Toggle */}
            <button
              onClick={toggleBeginnerMode}
              className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                isBeginnerMode
                  ? 'bg-gold text-gray-900'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isBeginnerMode ? 'Beginner Mode ON' : 'Beginner Mode OFF'}
            >
              <span className="hidden md:inline">
                {isBeginnerMode ? 'Beginner' : 'Expert'}
              </span>
              <span className="md:hidden">?</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
