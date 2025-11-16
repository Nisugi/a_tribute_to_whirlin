/**
 * Sidebar Navigation Component
 */

import { useUIStore } from '../../store/uiStore';

const navItems = [
  { id: 'character' as const, label: 'Character', icon: '👤' },
  { id: 'stats' as const, label: 'Stats', icon: '📊' },
  { id: 'training' as const, label: 'Training', icon: '🎯' },
  { id: 'enhancives' as const, label: 'Enhancives', icon: '✨' },
  { id: 'ascension' as const, label: 'Ascension', icon: '⬆️' },
  { id: 'calculators' as const, label: 'Calculators', icon: '🔢' },
  { id: 'tables' as const, label: 'Tables', icon: '📋' },
];

export default function Sidebar() {
  const currentView = useUIStore((state) => state.currentView);
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);
  const setView = useUIStore((state) => state.setView);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white shadow-lg z-50 transition-transform duration-300 w-64 ${
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'
        } md:translate-x-0`}
      >
        <nav className="flex flex-col h-full p-4">
          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 768) {
                    toggleSidebar();
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                  currentView === item.id
                    ? 'bg-primary text-white font-semibold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              <p>Based on Whirlin Trainer</p>
              <p className="mt-1">v2025.1</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
