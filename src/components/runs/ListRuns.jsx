import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import FiltersPanel from './FiltersPanel';
import RunsList from './RunsList';
import RunDetails from './RunDetails';

const ListRuns = () => {
  const { maps, ghosts, runs, loading, error } = useData();
  const { cursedPossessions } = useData();
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedPlayerFilter, setSelectedPlayerFilter] = useState([]); // New state for exact player filter
  const [filters, setFilters] = useState({
    dateFilter: '',
    playerFilter: '',
    mapFilter: '',
    ghostFilter: '',
    cursedPossessionFilter: '',
    deathsFilter: ''
  });

  // Get all unique dates and players from runs
  const allDates = useMemo(() => {
    const dates = [...new Set(runs.map(run => run.date))];
    return dates.sort((a, b) => new Date(b) - new Date(a)); // Most recent first
  }, [runs]);

  const allPlayers = useMemo(() => {
    const players = new Set();
    runs.forEach(run => {
      if (run.players && Array.isArray(run.players)) {
        run.players.forEach(player => {
          // Handle both object and string formats
          let playerName;
          if (typeof player === 'object' && player !== null) {
            // New format: player is an object with name property
            playerName = player.name;
          } else {
            // Legacy format: player is a string
            playerName = player;
          }

          if (playerName) {
            players.add(String(playerName));
          }
        });
      }
    });
    const playersArray = Array.from(players).sort();

    // Move Levisaxos to the front if present
    const levisaxosIndex = playersArray.indexOf('Levisaxos');
    if (levisaxosIndex > -1) {
      playersArray.splice(levisaxosIndex, 1);
      playersArray.unshift('Levisaxos');
    }

    return playersArray;
  }, [runs]);

  // Helper function to check if run matches exact player selection
  const matchesExactPlayers = (run, selectedPlayers) => {
    if (selectedPlayers.length === 0) return true; // No filter applied

    const runPlayers = run.players || [];

    // Must have exact same number of players
    if (runPlayers.length !== selectedPlayers.length) return false;

    // Must contain all selected players and no others
    return selectedPlayers.every(player => runPlayers.includes(player)) &&
      runPlayers.every(player => selectedPlayers.includes(player));
  };

  // Helper function to apply a single filter to runs
  const applyFilter = (runs, filterType, filterValue) => {
    if (!filterValue) return runs;

    switch (filterType) {
      case 'date':
        return runs.filter(run => run.date === filterValue);
      case 'player':
        return runs.filter(run => run.players && run.players.includes(filterValue));
      case 'map':
        return runs.filter(run => run.mapId === parseInt(filterValue));
      case 'ghost':
        return runs.filter(run => run.ghostId === parseInt(filterValue));
      case 'cursedPossession':
        if (filterValue === 'none') {
          return runs.filter(run => !run.cursedPossessionId);
        }
        return runs.filter(run => run.cursedPossessionId === parseInt(filterValue));
      case 'deaths':
        if (filterValue === 'none') {
          return runs.filter(run => {
            if (!run.playerStates) return true;
            return Object.values(run.playerStates).every(status => status === 'alive');
          });
        } else if (filterValue === 'any') {
          return runs.filter(run => {
            if (!run.playerStates) return false;
            return Object.values(run.playerStates).some(status => status === 'dead');
          });
        } else {
          // Filter by specific player who died
          return runs.filter(run => {
            if (!run.playerStates) return false;
            return run.playerStates[filterValue] === 'dead';
          });
        }
      default:
        return runs;
    }
  };

  // Function to get filtered runs excluding one specific filter
  const getFilteredRunsExcluding = (excludeFilter) => {
    let filtered = [...runs];

    // Apply exact player filter first (if not excluded)
    if (excludeFilter !== 'exactPlayer') {
      filtered = filtered.filter(run => matchesExactPlayers(run, selectedPlayerFilter));
    }

    Object.entries(filters).forEach(([key, value]) => {
      const filterType = key.replace('Filter', '');
      if (filterType !== excludeFilter && value) {
        filtered = applyFilter(filtered, filterType, value);
      }
    });

    return filtered;
  };

  // Calculate filter options with dynamic counts
  const filterOptions = useMemo(() => {
    // Date options
    const dateFilteredRuns = getFilteredRunsExcluding('date');
    const dateCounts = {};
    dateFilteredRuns.forEach(run => {
      dateCounts[run.date] = (dateCounts[run.date] || 0) + 1;
    });
    const dateOptions = {
      allCount: dateFilteredRuns.length,
      options: allDates.map(date => ({
        date,
        runCount: dateCounts[date] || 0
      }))
    };

    // Player options (for the individual player filter)
    const playerFilteredRuns = getFilteredRunsExcluding('player');
    const playerCounts = {};
    playerFilteredRuns.forEach(run => {
      if (run.players && Array.isArray(run.players)) {
        run.players.forEach(player => {
          playerCounts[player] = (playerCounts[player] || 0) + 1;
        });
      }
    });
    const playerOptions = {
      allCount: playerFilteredRuns.length,
      options: allPlayers.map(player => ({
        name: player,
        runCount: playerCounts[player] || 0
      })).sort((a, b) => b.runCount - a.runCount)
    };

    // Map options
    const mapFilteredRuns = getFilteredRunsExcluding('map');
    const mapCounts = {};
    mapFilteredRuns.forEach(run => {
      mapCounts[run.mapId] = (mapCounts[run.mapId] || 0) + 1;
    });
    const mapOptions = {
      allCount: mapFilteredRuns.length,
      options: maps.map(map => ({
        ...map,
        runCount: mapCounts[map.id] || 0
      })).sort((a, b) => b.runCount - a.runCount)
    };

    // Ghost options
    const ghostFilteredRuns = getFilteredRunsExcluding('ghost');
    const ghostCounts = {};
    ghostFilteredRuns.forEach(run => {
      ghostCounts[run.ghostId] = (ghostCounts[run.ghostId] || 0) + 1;
    });
    const ghostOptions = {
      allCount: ghostFilteredRuns.length,
      options: ghosts.map(ghost => ({
        ...ghost,
        runCount: ghostCounts[ghost.id] || 0
      })).sort((a, b) => b.runCount - a.runCount)
    };

    // Cursed possession options
    const cursedPossessionFilteredRuns = getFilteredRunsExcluding('cursedPossession');
    const possessionCounts = {};
    let noneCount = 0;
    cursedPossessionFilteredRuns.forEach(run => {
      if (run.cursedPossessionId) {
        possessionCounts[run.cursedPossessionId] = (possessionCounts[run.cursedPossessionId] || 0) + 1;
      } else {
        noneCount++;
      }
    });
    const cursedPossessionOptions = {
      allCount: cursedPossessionFilteredRuns.length,
      noneCount,
      possessions: cursedPossessions.map(possession => ({
        ...possession,
        runCount: possessionCounts[possession.id] || 0
      })).sort((a, b) => b.runCount - a.runCount)
    };

    // Deaths options
    const deathsFilteredRuns = getFilteredRunsExcluding('deaths');
    let noDeathsCount = 0;
    let anyDeathsCount = 0;
    const playerDeathCounts = {};

    deathsFilteredRuns.forEach(run => {
      if (!run.playerStates) {
        noDeathsCount++; // Assume no deaths if no player states
        return;
      }

      const hasDeaths = Object.entries(run.playerStates).some(([player, status]) => {
        if (status === 'dead') {
          playerDeathCounts[player] = (playerDeathCounts[player] || 0) + 1;
          return true;
        }
        return false;
      });

      if (hasDeaths) {
        anyDeathsCount++;
      } else {
        noDeathsCount++;
      }
    });

    const deathsOptions = {
      allCount: deathsFilteredRuns.length,
      noDeathsCount,
      anyDeathsCount,
      playerDeaths: allPlayers.map(player => ({
        name: player,
        deathCount: playerDeathCounts[player] || 0
      })).filter(playerDeath => playerDeath.deathCount > 0)
        .sort((a, b) => b.deathCount - a.deathCount)
    };

    return {
      dateOptions,
      playerOptions,
      mapOptions,
      ghostOptions,
      cursedPossessionOptions,
      deathsOptions
    };
  }, [runs, filters, selectedPlayerFilter, allDates, allPlayers, maps, ghosts]);

  // Final filtered runs with all filters applied
  const filteredRuns = useMemo(() => {
    let filtered = [...runs];

    // Apply exact player filter first
    filtered = filtered.filter(run => matchesExactPlayers(run, selectedPlayerFilter));

    Object.entries(filters).forEach(([key, value]) => {
      const filterType = key.replace('Filter', '');
      if (value) {
        filtered = applyFilter(filtered, filterType, value);
      }
    });

    // Sort by date (most recent first), then by run number (highest first)
    return filtered.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (b.runNumber || 0) - (a.runNumber || 0);
    });
  }, [runs, filters, selectedPlayerFilter]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [`${filterType}Filter`]: value
    }));
  };

  // Handle player selection change
  const handlePlayerFilterChange = (player) => {
    setSelectedPlayerFilter(prevSelected => {
      if (prevSelected.includes(player)) {
        // Remove player if already selected
        return prevSelected.filter(p => p !== player);
      } else {
        // Add player if not selected
        return [...prevSelected, player];
      }
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      dateFilter: '',
      playerFilter: '',
      mapFilter: '',
      ghostFilter: '',
      cursedPossessionFilter: '',
      deathsFilter: ''
    });
    setSelectedPlayerFilter([]);
  };

  // Calculate individual player game counts for display
const individualPlayerCounts = useMemo(() => {
  const baseFilteredRuns = getFilteredRunsExcluding('exactPlayer');
  const counts = {};
  
  baseFilteredRuns.forEach(run => {
    if (run.players && Array.isArray(run.players)) {
      run.players.forEach(player => {
        // Handle both object and string formats
        let playerName;
        if (typeof player === 'object' && player !== null) {
          playerName = player.name;
        } else {
          playerName = player;
        }
        
        if (playerName) {
          counts[playerName] = (counts[playerName] || 0) + 1;
        }
      });
    }
  });
  
  return counts;
}, [runs, filters]);

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
      {/* Player-Specific Filter Section */}
      <div className="bg-gray-700 rounded-lg shadow p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Filter by Exact Player Combination</h3>
          <p className="text-sm text-gray-400">
            Select players to show only games with that exact player combination.
            Leave empty to show all games.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {allPlayers.map(playerName => {
            // playerName is now guaranteed to be a string
            const isSelected = selectedPlayerFilter.includes(playerName);
            const playerGameCount = individualPlayerCounts[playerName] || 0;

            return (
              <button
                key={playerName} // Now using string instead of object
                onClick={() => handlePlayerFilterChange(playerName)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isSelected
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border-2 border-gray-600'
                  }`}
              >
                {playerName}
                <span className="ml-1 text-xs">({playerGameCount})</span>
              </button>
            );
          })}
        </div>
      </div>

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