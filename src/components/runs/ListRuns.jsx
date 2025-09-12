// === UPDATED LISTRUNS COMPONENT ===
// src/components/runs/ListRuns.jsx - Updated with better toggle placement

import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useRunFilters } from '../../hooks/useRunFilters';
import FiltersPanel from './FiltersPanel';
import CompactRunsView from './CompactRunsView';
import { StatisticsList } from './statistics';

const ListRuns = () => {
  const { 
    maps, 
    ghosts, 
    runs, 
    evidence, 
    gameModes, 
    cursedPossessions, 
    loading, 
    error 
  } = useData();

  const [showStatistics, setShowStatistics] = useState(false);

  const {
    filters,
    selectedPlayerFilter,
    allPlayers,
    filteredRuns,
    filterOptions,
    individualPlayerCounts,
    handleFilterChange,
    handlePlayerFilterChange,
    clearFilters
  } = useRunFilters(runs, maps, ghosts, cursedPossessions);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Statistics Section - Full Width when shown */}
      {showStatistics && (
        <div className="flex-shrink-0">
          <StatisticsList
            runs={filteredRuns}
            maps={maps}
            ghosts={ghosts}
            evidence={evidence}
            gameModes={gameModes}
            cursedPossessions={cursedPossessions}
            maxStats={6}
            showToggle={true}
            onHide={() => setShowStatistics(false)}
          />
        </div>
      )}

      {/* Main Content Area: Filters + Runs */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Filters Panel + Show Stats Button */}
        <div className="flex-shrink-0 flex flex-col gap-4">
          {/* Show Statistics Button - Only when hidden, in filters column */}
          {!showStatistics && (
            <button
              onClick={() => setShowStatistics(true)}
              className="w-72 flex items-center gap-2 px-4 py-2 bg-gray-600 text-gray-300 rounded-lg hover:bg-gray-500 transition-colors duration-200 text-sm"
            >
              <svg 
                className="w-4 h-4"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Show Statistics
              <span className="text-xs bg-gray-700 px-2 py-1 rounded ml-auto">
                {filteredRuns.length}
              </span>
            </button>
          )}
          
          {/* Filters Panel */}
          <FiltersPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions}
            onClearFilters={clearFilters}
            totalRuns={runs.length}
            filteredCount={filteredRuns.length}
            // Exact player filter props
            allPlayers={allPlayers}
            selectedPlayerFilter={selectedPlayerFilter}
            onPlayerFilterChange={handlePlayerFilterChange}
            individualPlayerCounts={individualPlayerCounts}
          />
        </div>

        {/* Right: Runs Display */}
        <div className="flex-1 min-w-0">
          <CompactRunsView
            runs={filteredRuns}
            maps={maps}
            ghosts={ghosts}
            evidence={evidence}
            gameModes={gameModes}
            cursedPossessions={cursedPossessions}
          />
        </div>
      </div>
    </div>
  );
};

export default ListRuns;