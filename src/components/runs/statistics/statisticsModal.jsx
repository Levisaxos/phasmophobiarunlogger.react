// === STATISTICS CONFIGURATION MODAL ===
// src/components/runs/statistics/StatisticsModal.jsx

import React, { useState } from 'react';
import { AVAILABLE_STATISTICS } from './statisticsConfig';

const StatisticsModal = ({ 
  isOpen, 
  onClose, 
  selectedStats, 
  onSelectionChange,
  maxStats = 6 
}) => {
  const [tempSelection, setTempSelection] = useState([...selectedStats]);

  if (!isOpen) return null;

  const handleStatToggle = (statId) => {
    setTempSelection(prev => {
      if (prev.includes(statId)) {
        return prev.filter(id => id !== statId);
      } else if (prev.length < maxStats) {
        return [...prev, statId];
      }
      return prev;
    });
  };

  const handleSave = () => {
    onSelectionChange(tempSelection);
    onClose();
  };

  const handleCancel = () => {
    setTempSelection([...selectedStats]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-gray-100">
            Customize Statistics Display
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-2">
              Select up to {maxStats} statistics to display ({tempSelection.length}/{maxStats})
            </div>
            <div className="text-xs text-gray-400">
              Statistics show the highest and lowest values with support for tied results
            </div>
          </div>

          {/* Simple grid selection - no categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {AVAILABLE_STATISTICS.map(stat => {
              const isSelected = tempSelection.includes(stat.id);
              const canSelect = isSelected || tempSelection.length < maxStats;
              
              return (
                <button
                  key={stat.id}
                  onClick={() => canSelect && handleStatToggle(stat.id)}
                  disabled={!canSelect}
                  className={`p-3 rounded-lg border text-left transition-colors duration-200 ${
                    isSelected
                      ? `${stat.category.borderColor} border-2 bg-gray-700 text-white`
                      : canSelect
                      ? 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                      : 'border-gray-700 bg-gray-900 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="font-medium mb-1">{stat.name}</div>
                  <div className="text-xs text-gray-400">
                    {stat.description}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stat.category.name}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick presets */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <div className="text-sm font-medium text-gray-300 mb-3">Quick Presets:</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTempSelection(['run-times', 'ghost-encounters', 'evidence-found', 'map-popularity', 'difficulty-preference', 'player-deaths'])}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
              >
                Balanced Overview
              </button>
              <button
                onClick={() => setTempSelection(['run-times', 'ghost-lethality', 'player-deaths', 'map-popularity'])}
                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
              >
                Death Analysis
              </button>
              <button
                onClick={() => setTempSelection(['ghost-encounters', 'ghost-lethality', 'evidence-found', 'cursed-items'])}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200"
              >
                Ghost Focus
              </button>
              <button
                onClick={() => setTempSelection(['map-popularity', 'difficulty-preference', 'evidence-found', 'cursed-items'])}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                Game Elements
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {tempSelection.length} of {maxStats} statistics selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-300 hover:text-gray-100 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsModal;