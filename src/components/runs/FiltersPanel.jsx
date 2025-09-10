// src/components/runs/FiltersPanel.jsx - Fresh version with exact player filter integrated
import React from 'react';
import FilterDropdown from '../common/FilterDropdown';
import { HoverSelect } from '../common';

const FiltersPanel = ({
  filters,
  onFilterChange,
  filterOptions,
  onClearFilters,
  totalRuns,
  filteredCount,
  // Exact player filter props
  allPlayers = [],
  selectedPlayerFilter = [],
  onPlayerFilterChange,
  individualPlayerCounts = {}
}) => {
  const {
    dateFilter,
    playerFilter,
    mapFilter,
    ghostFilter,
    cursedPossessionFilter,
    deathsFilter
  } = filters;

  const hasActiveFilters = dateFilter || playerFilter || mapFilter || ghostFilter || cursedPossessionFilter || deathsFilter || selectedPlayerFilter.length > 0;

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
          
          {/* Exact Player Combination Filter */}
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-400 mb-3">
              Exact Player Combination
            </h4>
            
            {allPlayers && allPlayers.length > 0 ? (
              <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                {allPlayers.map(playerName => {
                  const isSelected = selectedPlayerFilter.includes(playerName);
                  const playerGameCount = individualPlayerCounts[playerName] || 0;

                  return (
                    <button
                      key={playerName}
                      onClick={() => onPlayerFilterChange && onPlayerFilterChange(playerName)}
                      className={`px-2 py-1 text-xs rounded transition-colors duration-200 text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600 text-white border border-blue-500'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      }`}
                    >
                      <span className="truncate">{playerName}</span>
                      <span className="text-xs ml-1">({playerGameCount})</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-gray-400">No players available</div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-600 pt-2">
            <h4 className="text-sm font-medium text-orange-400 mb-3">Individual Filters</h4>
          </div>

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
            <HoverSelect
              value={cursedPossessionFilter}
              onChange={(e) => onFilterChange('cursedPossession', e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Possessions ({filterOptions.cursedPossessionOptions.allCount})</option>
              <option value="none">No Possession Found ({filterOptions.cursedPossessionOptions.noneCount})</option>
              {filterOptions.cursedPossessionOptions.possessions.map((possession) => (
                <option key={possession.id} value={possession.id}>
                  {possession.name} ({possession.runCount})
                </option>
              ))}
            </HoverSelect>
          </div>

          {/* Deaths Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Filter by Deaths
            </label>
            <HoverSelect
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
            </HoverSelect>
          </div>

          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              Clear All Filters
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