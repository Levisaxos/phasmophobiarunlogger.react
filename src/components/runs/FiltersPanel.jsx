import React from 'react';
import FilterDropdown from '../common/FilterDropdown';

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

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="w-72 bg-gray-700 rounded-lg shadow flex flex-col h-full">
      <div className="p-4 border-b border-gray-600 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-4">
          {/* Date Filter */}
          <FilterDropdown
            label="Filter by Date"
            value={dateFilter}
            onChange={(value) => onFilterChange('date', value)}
            allLabel="All Dates"
            allCount={filterOptions.dateOptions.allCount}
            options={filterOptions.dateOptions.options.map(({ date, runCount }) => ({
              value: date,
              label: formatDate(date),
              count: runCount
            }))}
          />

          {/* Player Filter */}
          <FilterDropdown
            label="Filter by Player"
            value={playerFilter}
            onChange={(value) => onFilterChange('player', value)}
            allLabel="All Players"
            allCount={filterOptions.playerOptions.allCount}
            options={filterOptions.playerOptions.options.map(({ name, runCount }) => ({
              value: name,
              label: name,
              count: runCount
            }))}
          />

          {/* Map Filter */}
          <FilterDropdown
            label="Filter by Map"
            value={mapFilter}
            onChange={(value) => onFilterChange('map', value)}
            allLabel="All Maps"
            allCount={filterOptions.mapOptions.allCount}
            options={filterOptions.mapOptions.options.map((map) => ({
              value: map.id.toString(),
              label: map.name,
              count: map.runCount
            }))}
          />

          {/* Ghost Filter */}
          <FilterDropdown
            label="Filter by Ghost"
            value={ghostFilter}
            onChange={(value) => onFilterChange('ghost', value)}
            allLabel="All Ghosts"
            allCount={filterOptions.ghostOptions.allCount}
            options={filterOptions.ghostOptions.options.map((ghost) => ({
              value: ghost.id.toString(),
              label: ghost.name,
              count: ghost.runCount
            }))}
          />

          {/* Cursed Possession Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Cursed Possession
            </label>
            <select
              value={cursedPossessionFilter}
              onChange={(e) => onFilterChange('cursedPossession', e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Possessions ({filterOptions.cursedPossessionOptions.allCount})</option>
              <option value="none">No Possession Used ({filterOptions.cursedPossessionOptions.noneCount})</option>
              {filterOptions.cursedPossessionOptions.possessions.map((possession) => (
                <option key={possession.id} value={possession.id}>
                  {possession.name} ({possession.runCount})
                </option>
              ))}
            </select>
          </div>

          {/* Deaths Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Deaths
            </label>
            <select
              value={deathsFilter}
              onChange={(e) => onFilterChange('deaths', e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Runs ({filterOptions.deathsOptions.allCount})</option>
              <option value="none">No Deaths ({filterOptions.deathsOptions.noDeathsCount})</option>
              <option value="any">Any Deaths ({filterOptions.deathsOptions.anyDeathsCount})</option>
              {filterOptions.deathsOptions.playerDeaths.map((playerDeath) => (
                <option key={playerDeath.name} value={playerDeath.name}>
                  {playerDeath.name} Died ({playerDeath.deathCount})
                </option>
              ))}
            </select>
          </div>

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