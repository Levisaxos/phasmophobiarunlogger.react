// src/components/runs/ListRuns.jsx - Fresh version with proper imports and integrated filters
import React from 'react';
import { useData } from '../../hooks/useData';
import { useRunFilters } from '../../hooks/useRunFilters';
import FiltersPanel from './FiltersPanel';
import CompactRunsView from './CompactRunsView';
import TimingStats from './TimingStats';

const ListRuns = () => {
  const { maps, ghosts, runs, evidence, gameModes, cursedPossessions, loading, error } = useData();

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
    <div className="flex flex-col gap-6 w-full" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Top Row: Timing Statistics (Full Width) */}
      <div className="w-full">
        <TimingStats
          runs={filteredRuns}
          maps={maps}
          ghosts={ghosts}
        />
      </div>

      {/* Main Content Area: Filters + Runs */}
      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left: Filters Panel with Integrated Exact Player Filter */}
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

        {/* Right: Runs Display */}
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
  );
};

export default ListRuns;