// src/components/filters/FiltersPanel.jsx
import React from 'react';
import DateFilter from './DateFilter';
import PlayerFilter from './PlayerFilter';
import MapFilter from './MapFilter';
import GhostFilter from './GhostFilter';
import CursedPossessionFilter from './CursedPossessionFilter';
import DeathsFilter from './DeathsFilter';

const FiltersPanel = ({
  filters,
  onFilterChange,
  filterOptions,
  onClearFilters,
  totalRuns,
  filteredCount
}) => {
  const {
    dateFilter,
    playerFilter,
    mapFilter,
    ghostFilter,
    cursedPossessionFilter,
    deathsFilter
  } = filters;

  const hasActiveFilters = dateFilter || playerFilter || mapFilter || ghostFilter || cursedPossessionFilter || deathsFilter;

  return (
    <div className="w-72 bg-gray-700 rounded-lg shadow flex flex-col h-full">
      <div className="p-4 border-b border-gray-600 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-4">
          <DateFilter
            value={dateFilter}
            onChange={(value) => onFilterChange('date', value)}
            options={filterOptions.dateOptions}
          />

          <PlayerFilter
            value={playerFilter}
            onChange={(value) => onFilterChange('player', value)}
            options={filterOptions.playerOptions}
          />

          <MapFilter
            value={mapFilter}
            onChange={(value) => onFilterChange('map', value)}
            options={filterOptions.mapOptions}
          />

          <GhostFilter
            value={ghostFilter}
            onChange={(value) => onFilterChange('ghost', value)}
            options={filterOptions.ghostOptions}
          />

          <CursedPossessionFilter
            value={cursedPossessionFilter}
            onChange={(value) => onFilterChange('cursedPossession', value)}
            options={filterOptions.cursedPossessionOptions}
          />

          <DeathsFilter
            value={deathsFilter}
            onChange={(value) => onFilterChange('deaths', value)}
            options={filterOptions.deathsOptions}
          />

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full px-3 py-2 text-sm bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-colors duration-200"
            >
              Clear Filters
            </button>
          )}

          {/* Results Count */}
          <div className="pt-4 border-t border-gray-600">
            <p className="text-sm text-gray-400">
              Showing {filteredCount} of {totalRuns} runs
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;