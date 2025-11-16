/**
 * Stat Progression Chart - Visualize stat growth from level 0 to target level
 */

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Stats, StatName } from '../../types';
import { calculateAllStatsProgression } from '../../engine/stats/statsCalculator';

const STAT_NAMES: StatName[] = ['STR', 'CON', 'DEX', 'AGL', 'DIS', 'AUR', 'LOG', 'INT', 'WIS', 'INF'];

const STAT_COLORS: Record<StatName, string> = {
  STR: '#ef4444', // red
  CON: '#f97316', // orange
  DEX: '#eab308', // yellow
  AGL: '#84cc16', // lime
  DIS: '#22c55e', // green
  AUR: '#14b8a6', // teal
  LOG: '#06b6d4', // cyan
  INT: '#3b82f6', // blue
  WIS: '#8b5cf6', // violet
  INF: '#d946ef', // fuchsia
};

interface StatProgressionChartProps {
  baseStats: Stats;
  growthRates: Record<StatName, number>;
  targetLevel: number;
  currentLevel: number;
}

export default function StatProgressionChart({
  baseStats,
  growthRates,
  targetLevel,
  currentLevel,
}: StatProgressionChartProps) {
  // Allow user to select which stats to display
  const [selectedStats, setSelectedStats] = useState<Set<StatName>>(new Set(['STR', 'CON', 'DEX']));

  // Calculate progressions for all stats
  // baseStats already include racial bonuses (they are the in-game values)
  const progressions = calculateAllStatsProgression(baseStats, growthRates, targetLevel);

  // Transform data for Recharts
  const chartData = Array.from({ length: targetLevel + 1 }, (_, level) => {
    const dataPoint: any = { level };

    STAT_NAMES.forEach((stat) => {
      dataPoint[stat] = progressions[stat][level];
    });

    return dataPoint;
  });

  // Toggle stat visibility
  const toggleStat = (stat: StatName) => {
    const newSelected = new Set(selectedStats);
    if (newSelected.has(stat)) {
      newSelected.delete(stat);
    } else {
      newSelected.add(stat);
    }
    setSelectedStats(newSelected);
  };

  // Select all / deselect all
  const selectAll = () => setSelectedStats(new Set(STAT_NAMES));
  const deselectAll = () => setSelectedStats(new Set());

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Stat Progression Chart</h3>

      {/* Stat selector */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-gray-600">Select stats to display:</p>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
            >
              Select All
            </button>
            <button
              onClick={deselectAll}
              className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STAT_NAMES.map((stat) => (
            <button
              key={stat}
              onClick={() => toggleStat(stat)}
              className={`px-3 py-1 rounded text-sm font-medium transition ${
                selectedStats.has(stat)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedStats.has(stat) ? STAT_COLORS[stat] : undefined,
              }}
            >
              {stat}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {selectedStats.size === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Select at least one stat to display the chart
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="level"
              label={{ value: 'Level', position: 'insideBottom', offset: -5 }}
              stroke="#6b7280"
            />
            <YAxis
              label={{ value: 'Stat Value', angle: -90, position: 'insideLeft' }}
              stroke="#6b7280"
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />

            {/* Render lines for selected stats */}
            {STAT_NAMES.filter((stat) => selectedStats.has(stat)).map((stat) => (
              <Line
                key={stat}
                type="monotone"
                dataKey={stat}
                stroke={STAT_COLORS[stat]}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            ))}

            {/* Current level indicator */}
            {currentLevel > 0 && (
              <Line
                type="monotone"
                dataKey={() => null}
                stroke="#9ca3af"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Current level indicator */}
      {currentLevel > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-8 h-0.5 bg-gray-400" style={{ borderTop: '2px dashed #9ca3af' }}></span>
            Current Level: {currentLevel}
          </span>
        </div>
      )}
    </div>
  );
}
