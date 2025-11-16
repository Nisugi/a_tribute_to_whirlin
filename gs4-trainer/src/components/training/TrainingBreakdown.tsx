/**
 * Training Breakdown - Level-by-level training plan display
 */

import { SKILL_BY_INDEX } from '../../data/skills';
import type { AutoTrainResult } from '../../engine/training/autoTrain';

interface TrainingBreakdownProps {
  result: AutoTrainResult;
  startLevel?: number;
  endLevel?: number;
}

export default function TrainingBreakdown({ result, startLevel = 0, endLevel = 100 }: TrainingBreakdownProps) {
  const levels = Object.keys(result.trainingByLevel)
    .map(Number)
    .filter(level => level >= (startLevel + 1) && level <= endLevel)
    .sort((a, b) => a - b);

  if (levels.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No training data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-300 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">⚠️ Training Plan Errors</h4>
          <ul className="text-sm text-red-800 space-y-1">
            {result.errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Warnings</h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {result.warnings.slice(0, 10).map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
            {result.warnings.length > 10 && (
              <li className="italic">... and {result.warnings.length - 10} more warnings</li>
            )}
          </ul>
        </div>
      )}

      {/* Summary */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg">
        <h4 className="font-semibold text-green-900 mb-2">Training Plan Summary</h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-green-700">Physical TPs:</span>{' '}
            <span className="font-bold text-green-900">{result.totalTPsSpent.physical}</span>
          </div>
          <div>
            <span className="text-green-700">Mental TPs:</span>{' '}
            <span className="font-bold text-green-900">{result.totalTPsSpent.mental}</span>
          </div>
          <div>
            <span className="text-green-700">Total TPs:</span>{' '}
            <span className="font-bold text-green-900">{result.totalTPsSpent.total}</span>
          </div>
        </div>
      </div>

      {/* Level-by-level breakdown */}
      <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-300 rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Level</th>
              <th className="text-left py-2 px-3 font-semibold text-gray-700">Skills Trained</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">PTP</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">MTP</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">Total</th>
              <th className="text-center py-2 px-3 font-semibold text-gray-700">Remaining</th>
            </tr>
          </thead>
          <tbody>
            {levels.map((level, index) => {
              const levelData = result.trainingByLevel[level];
              const hasTraining = Object.keys(levelData.skillRanks).length > 0;

              if (!hasTraining) return null; // Skip levels with no training

              return (
                <tr
                  key={level}
                  className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                    levelData.overBudget ? 'bg-red-50' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-semibold">{level}</td>
                  <td className="py-2 px-3">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(levelData.skillRanks).map(([skillIndexStr, ranks]) => {
                        const skillIndex = parseInt(skillIndexStr);
                        const skill = SKILL_BY_INDEX[skillIndex];
                        if (!skill) return null;

                        return (
                          <span
                            key={skillIndex}
                            className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs"
                            title={skill.name}
                          >
                            {skill.name} +{ranks}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className={levelData.tpSpent.physical > levelData.tpAvailable.physicalTPs ? 'text-red-600 font-bold' : ''}>
                      {levelData.tpSpent.physical}
                    </span>
                    <span className="text-gray-500 text-xs">/{levelData.tpAvailable.physicalTPs}</span>
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className={levelData.tpSpent.mental > levelData.tpAvailable.mentalTPs ? 'text-red-600 font-bold' : ''}>
                      {levelData.tpSpent.mental}
                    </span>
                    <span className="text-gray-500 text-xs">/{levelData.tpAvailable.mentalTPs}</span>
                  </td>
                  <td className="text-center py-2 px-3 font-semibold">
                    {levelData.tpSpent.total}
                  </td>
                  <td className="text-center py-2 px-3">
                    <span className={levelData.tpRemaining.total < 0 ? 'text-red-600' : 'text-green-600'}>
                      {levelData.tpRemaining.total >= 0 ? '+' : ''}{levelData.tpRemaining.total}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
