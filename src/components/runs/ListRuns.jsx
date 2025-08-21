// src/components/runs/ListRuns.jsx
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { useRunFilters } from '../../hooks/useRunFilters';
import { FiltersPanel, ExactPlayerFilter } from './filters';
import RunsList from './RunsList';
import RunDetails from './RunDetails';

const ListRuns = () => {
  const { maps, ghosts, runs, cursedPossessions, loading, error } = useData();
  const [selectedRun, setSelectedRun] = useState(null);

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
      {/* Exact Player Filter Section */}
      <ExactPlayerFilter
        allPlayers={allPlayers}
        selectedPlayerFilter={selectedPlayerFilter}
        onPlayerFilterChange={handlePlayerFilterChange}
        individualPlayerCounts={individualPlayerCounts}
      />

      {/* Main Content Area */}
      <div className="flex gap-6 flex-1 min-h-0">
        <FiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          filterOptions={filterOptions}
          onClearFilters={clearFilters}
          totalRuns={runs.length}
          filteredCount={filteredRuns.length}
        />

        <RunsList
          runs={filteredRuns}
          selectedRun={selectedRun}
          onRunSelect={setSelectedRun}
          maps={maps}
          ghosts={ghosts}
          availableCursedPossessions={cursedPossessions}
        />

        <RunDetails
          selectedRun={selectedRun}
          maps={maps}
          ghosts={ghosts}
          availableCursedPossessions={cursedPossessions}
        />
      </div>
    </div>
  );
};

export default ListRuns;