// src/hooks/useRunFilters.js - Fixed exact player matching logic
import { useState, useMemo } from 'react';

export const useRunFilters = (runs, maps, ghosts, cursedPossessions) => {
  const [filters, setFilters] = useState({
    dateFilter: '',
    playerFilter: '',
    mapFilter: '',
    ghostFilter: '',
    cursedPossessionFilter: '',
    deathsFilter: ''
  });

  const [selectedPlayerFilter, setSelectedPlayerFilter] = useState([]);

  // Get all unique dates and players from runs
  const allDates = useMemo(() => {
    const dates = [...new Set(runs.map(run => run.date))];
    return dates.sort((a, b) => new Date(b) - new Date(a));
  }, [runs]);

  const allPlayers = useMemo(() => {
    const players = new Set();
    runs.forEach(run => {
      if (run.players && Array.isArray(run.players)) {
        run.players.forEach(player => {
          let playerName;
          if (typeof player === 'object' && player !== null) {
            playerName = player.name;
          } else {
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

  // Helper function to extract player names from a run
  const getPlayerNamesFromRun = (run) => {
    const playerNames = [];
    if (run.players && Array.isArray(run.players)) {
      run.players.forEach(player => {
        let playerName;
        if (typeof player === 'object' && player !== null) {
          playerName = player.name;
        } else {
          playerName = player;
        }
        if (playerName) {
          playerNames.push(String(playerName));
        }
      });
    }
    return playerNames.sort(); // Sort for consistent comparison
  };

  // FIXED: Helper function to check if run matches exact player selection
  const matchesExactPlayers = (run, selectedPlayers) => {
    // If no players selected, show all runs (no filter active)
    if (selectedPlayers.length === 0) return true;

    const runPlayers = getPlayerNamesFromRun(run);
    const sortedSelectedPlayers = [...selectedPlayers].sort();
    
    // Must have exact same length and exact same players
    if (runPlayers.length !== sortedSelectedPlayers.length) return false;
    
    // Check if arrays are identical (both are sorted)
    return runPlayers.every((player, index) => player === sortedSelectedPlayers[index]);
  };

  // Helper function to apply a single filter to runs
  const applyFilter = (runs, filterType, filterValue) => {
    if (!filterValue) return runs;

    switch (filterType) {
      case 'date':
        return runs.filter(run => run.date === filterValue);
      case 'player':
        return runs.filter(run => {
          const runPlayers = getPlayerNamesFromRun(run);
          return runPlayers.includes(filterValue);
        });
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
            let hasDeaths = false;
            
            if (run.players && Array.isArray(run.players)) {
              hasDeaths = run.players.some(player => {
                if (typeof player === 'object' && player !== null) {
                  return player.status === 'dead';
                } else {
                  return run.playerStates && run.playerStates[player] === 'dead';
                }
              });
            } else if (run.playerStates) {
              hasDeaths = Object.values(run.playerStates).some(status => status === 'dead');
            }
            
            return !hasDeaths;
          });
        } else if (filterValue === 'any') {
          return runs.filter(run => {
            let hasDeaths = false;
            
            if (run.players && Array.isArray(run.players)) {
              hasDeaths = run.players.some(player => {
                if (typeof player === 'object' && player !== null) {
                  return player.status === 'dead';
                } else {
                  return run.playerStates && run.playerStates[player] === 'dead';
                }
              });
            } else if (run.playerStates) {
              hasDeaths = Object.values(run.playerStates).some(status => status === 'dead');
            }
            
            return hasDeaths;
          });
        } else {
          return runs.filter(run => {
            if (run.players && Array.isArray(run.players)) {
              return run.players.some(player => {
                let playerName;
                let playerStatus;
                
                if (typeof player === 'object' && player !== null) {
                  playerName = player.name;
                  playerStatus = player.status;
                } else {
                  playerName = player;
                  playerStatus = run.playerStates ? run.playerStates[player] : 'alive';
                }
                
                return playerName === filterValue && playerStatus === 'dead';
              });
            } else if (run.playerStates) {
              return run.playerStates[filterValue] === 'dead';
            }
            
            return false;
          });
        }
      default:
        return runs;
    }
  };

  // Function to get filtered runs excluding one specific filter
  const getFilteredRunsExcluding = (excludeFilter) => {
    let filtered = [...runs];

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

    // Player options
    const playerFilteredRuns = getFilteredRunsExcluding('player');
    const playerCounts = {};
    playerFilteredRuns.forEach(run => {
      const runPlayers = getPlayerNamesFromRun(run);
      runPlayers.forEach(playerName => {
        playerCounts[playerName] = (playerCounts[playerName] || 0) + 1;
      });
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
      if (run.ghostId) {
        ghostCounts[run.ghostId] = (ghostCounts[run.ghostId] || 0) + 1;
      }
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
      let runHasDeaths = false;

      if (run.players && Array.isArray(run.players)) {
        run.players.forEach(player => {
          let playerName;
          let playerStatus;
          
          if (typeof player === 'object' && player !== null) {
            playerName = player.name;
            playerStatus = player.status;
          } else {
            playerName = player;
            playerStatus = run.playerStates ? run.playerStates[player] : 'alive';
          }
          
          if (playerName && playerStatus === 'dead') {
            playerDeathCounts[playerName] = (playerDeathCounts[playerName] || 0) + 1;
            runHasDeaths = true;
          }
        });
      } else if (run.playerStates) {
        Object.entries(run.playerStates).forEach(([playerName, status]) => {
          if (status === 'dead') {
            playerDeathCounts[playerName] = (playerDeathCounts[playerName] || 0) + 1;
            runHasDeaths = true;
          }
        });
      }

      if (runHasDeaths) {
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
  }, [runs, filters, selectedPlayerFilter, allDates, allPlayers, maps, ghosts, cursedPossessions]);

  // Final filtered runs with all filters applied
  const filteredRuns = useMemo(() => {
    let filtered = [...runs];

    // FIXED: Apply exact player filter correctly
    filtered = filtered.filter(run => matchesExactPlayers(run, selectedPlayerFilter));

    Object.entries(filters).forEach(([key, value]) => {
      const filterType = key.replace('Filter', '');
      if (value) {
        filtered = applyFilter(filtered, filterType, value);
      }
    });

    return filtered.sort((a, b) => {
      const dateCompare = new Date(b.date) - new Date(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (b.runNumber || 0) - (a.runNumber || 0);
    });
  }, [runs, filters, selectedPlayerFilter]);

  // Calculate individual player game counts for display
  const individualPlayerCounts = useMemo(() => {
    const baseFilteredRuns = getFilteredRunsExcluding('exactPlayer');
    const counts = {};
    
    baseFilteredRuns.forEach(run => {
      const runPlayers = getPlayerNamesFromRun(run);
      runPlayers.forEach(playerName => {
        counts[playerName] = (counts[playerName] || 0) + 1;
      });
    });
    
    return counts;
  }, [runs, filters]);

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
        return prevSelected.filter(p => p !== player);
      } else {
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

  return {
    // State
    filters,
    selectedPlayerFilter,
    allPlayers,
    filteredRuns,
    filterOptions,
    individualPlayerCounts,
    
    // Actions
    handleFilterChange,
    handlePlayerFilterChange,
    clearFilters
  };
};