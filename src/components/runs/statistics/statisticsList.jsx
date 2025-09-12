// === STATISTICS LIST MAIN COMPONENT ===
// src/components/runs/statistics/StatisticsList.jsx

import React, { useState, useMemo } from 'react';
import StatisticsCard from './statisticsCard';
import StatisticsModal from './statisticsModal';
import { AVAILABLE_STATISTICS, DEFAULT_SELECTED_STATISTICS } from './statisticsConfig';
import { StatisticsCalculator } from './statisticsCalculator';

const StatisticsList = ({ 
  runs, 
  maps, 
  ghosts, 
  evidence, 
  gameModes, 
  cursedPossessions,
  maxStats = 6,
  showToggle = false,
  onHide
}) => {
  const [selectedStats, setSelectedStats] = useState(DEFAULT_SELECTED_STATISTICS);
  const [showModal, setShowModal] = useState(false);

  // Create calculator instance
  const calculator = useMemo(() => 
    new StatisticsCalculator(runs, maps, ghosts, evidence, gameModes, cursedPossessions),
    [runs, maps, ghosts, evidence, gameModes, cursedPossessions]
  );

  // Calculate all selected statistics
  const statisticsData = useMemo(() => {
    console.log('📊 StatisticsList: Calculating statistics for IDs:', selectedStats);
    const data = {};
    selectedStats.forEach(statId => {
      console.log(`📈 Processing statistic: ${statId}`);
      data[statId] = calculator.calculateStatistic(statId);
    });
    console.log('📊 All statistics calculated:', data);
    return data;
  }, [calculator, selectedStats]);

  // Get statistic configurations
  const getStatisticConfig = (statId) => {
    return AVAILABLE_STATISTICS.find(stat => stat.id === statId);
  };

  const handleSelectionChange = (newSelection) => {
    setSelectedStats(newSelection);
  };

  if (runs.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Run Statistics
        </h3>
        <p className="text-sm text-gray-400">
          No runs available to calculate statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            Run Statistics
          </h3>
          <p className="text-sm text-gray-400">
            Based on {runs.length} run{runs.length !== 1 ? 's' : ''} in current filter
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Customize
          </button>
          {showToggle && onHide && (
            <button
              onClick={onHide}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hide
            </button>
          )}
        </div>
      </div>

      {/* Statistics Grid - Single Row, 6 Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {selectedStats.map(statId => {
          const statConfig = getStatisticConfig(statId);
          const statData = statisticsData[statId];
          
          if (!statConfig) return null;

          return (
            <StatisticsCard
              key={statId}
              statistic={statConfig}
              data={statData}
            />
          );
        })}
      </div>

      {/* No statistics selected state */}
      {selectedStats.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">No statistics selected</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Select Statistics
          </button>
        </div>
      )}

      {/* Show available vs selected count */}
      {selectedStats.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-600">
          <div className="text-xs text-gray-400 text-center">
            Showing {selectedStats.length} of {AVAILABLE_STATISTICS.length} available statistics
            {selectedStats.length < maxStats && (
              <span className="ml-2">
                ({maxStats - selectedStats.length} more can be added)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      <StatisticsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedStats={selectedStats}
        onSelectionChange={handleSelectionChange}
        maxStats={maxStats}
      />
    </div>
  );
};

export default StatisticsList;