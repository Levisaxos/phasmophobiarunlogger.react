// src/components/runs/EnhancedStats.jsx - Fixed version with proper exports
import React, { useState, useMemo } from 'react';

const EnhancedStats = ({ runs, maps, ghosts, evidence, gameModes, cursedPossessions }) => {
  // Available statistic types
  const availableStats = [
    { id: 'fastest-run', name: 'Fastest Run', category: 'timing' },
    { id: 'slowest-run', name: 'Slowest Run', category: 'timing' },
    { id: 'avg-evidence', name: 'Avg Evidence Found', category: 'averages' },
    { id: 'avg-players', name: 'Avg Players', category: 'averages' },
    { id: 'avg-duration', name: 'Avg Duration', category: 'averages' },
    { id: 'most-ghost', name: 'Most Seen Ghost', category: 'ghosts' },
    { id: 'least-ghost', name: 'Least Seen Ghost', category: 'ghosts' },
    { id: 'most-evidence', name: 'Most Found Evidence', category: 'evidence' },
    { id: 'least-evidence', name: 'Least Found Evidence', category: 'evidence' },
    { id: 'most-map', name: 'Most Played Map', category: 'maps' },
    { id: 'least-map', name: 'Least Played Map', category: 'maps' },
    { id: 'most-possession', name: 'Most Found Possession', category: 'possessions' },
    { id: 'least-possession', name: 'Least Found Possession', category: 'possessions' },
    { id: 'most-difficulty', name: 'Most Played Difficulty', category: 'difficulty' },
    { id: 'least-difficulty', name: 'Least Played Difficulty', category: 'difficulty' },
    { id: 'perfect-rate', name: 'Perfect Game Rate', category: 'averages' },
  ];

  // Default selected stats (6 cards)
  const [selectedStats, setSelectedStats] = useState([
    'fastest-run', 'slowest-run', 'avg-evidence', 'most-ghost', 'most-map', 'most-difficulty'
  ]);
  
  const [showSettings, setShowSettings] = useState(false);

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '--:--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  // Calculate all statistics
  const stats = useMemo(() => {
    if (runs.length === 0) return {};

    // Helper function to get run details
    const getRunDetails = (run) => {
      const map = maps.find(m => m.id === run.mapId);
      const ghost = ghosts.find(g => g.id === run.actualGhostId || g.id === run.ghostId);
      const gameMode = gameModes.find(gm => gm.id === run.gameModeId);
      
      return {
        mapName: map?.name || 'Unknown Map',
        ghostName: ghost?.name || 'Unknown Ghost',
        gameModeName: gameMode?.name || 'Unknown',
        playerCount: run.playerCount || 0
      };
    };

    // Timing stats
    const runsWithTime = runs.filter(run => run.runTimeSeconds && run.runTimeSeconds > 0);
    let fastestRun = null, slowestRun = null, avgDuration = 0;
    
    if (runsWithTime.length > 0) {
      const times = runsWithTime.map(run => run.runTimeSeconds);
      const fastestTime = Math.min(...times);
      const slowestTime = Math.max(...times);
      avgDuration = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
      
      fastestRun = runsWithTime.find(run => run.runTimeSeconds === fastestTime);
      slowestRun = runsWithTime.find(run => run.runTimeSeconds === slowestTime);
    }

    // Evidence stats
    const evidenceCounts = {};
    let totalEvidence = 0;
    runs.forEach(run => {
      const evidenceFound = (run.evidenceIds || []).length;
      totalEvidence += evidenceFound;
      
      (run.evidenceIds || []).forEach(evidenceId => {
        evidenceCounts[evidenceId] = (evidenceCounts[evidenceId] || 0) + 1;
      });
    });
    const avgEvidence = runs.length > 0 ? (totalEvidence / runs.length).toFixed(1) : 0;

    // Player stats
    const totalPlayers = runs.reduce((sum, run) => sum + (run.playerCount || 0), 0);
    const avgPlayers = runs.length > 0 ? (totalPlayers / runs.length).toFixed(1) : 0;

    // Perfect game rate
    const perfectGames = runs.filter(run => run.isPerfectGame).length;
    const perfectRate = runs.length > 0 ? ((perfectGames / runs.length) * 100).toFixed(1) : 0;

    // Ghost stats
    const ghostCounts = {};
    runs.forEach(run => {
      const ghostId = run.actualGhostId || run.ghostId;
      if (ghostId) {
        ghostCounts[ghostId] = (ghostCounts[ghostId] || 0) + 1;
      }
    });

    // Map stats
    const mapCounts = {};
    runs.forEach(run => {
      if (run.mapId) {
        mapCounts[run.mapId] = (mapCounts[run.mapId] || 0) + 1;
      }
    });

    // Cursed possession stats
    const possessionCounts = {};
    runs.forEach(run => {
      if (run.cursedPossessionId) {
        possessionCounts[run.cursedPossessionId] = (possessionCounts[run.cursedPossessionId] || 0) + 1;
      }
    });

    // Difficulty stats
    const difficultyCounts = {};
    runs.forEach(run => {
      if (run.gameModeId) {
        difficultyCounts[run.gameModeId] = (difficultyCounts[run.gameModeId] || 0) + 1;
      }
    });

    // Helper to get most/least
    const getMostLeast = (counts, items, getName) => {
      const entries = Object.entries(counts).map(([id, count]) => ({
        id: parseInt(id),
        count,
        name: getName(parseInt(id))
      })).filter(item => item.name !== 'Unknown');

      if (entries.length === 0) return { most: null, least: null };

      entries.sort((a, b) => b.count - a.count);
      return {
        most: entries[0],
        least: entries[entries.length - 1]
      };
    };

    const ghostStats = getMostLeast(ghostCounts, ghosts, (id) => ghosts.find(g => g.id === id)?.name || 'Unknown');
    const mapStats = getMostLeast(mapCounts, maps, (id) => maps.find(m => m.id === id)?.name || 'Unknown');
    const possessionStats = getMostLeast(possessionCounts, cursedPossessions, (id) => cursedPossessions.find(p => p.id === id)?.name || 'Unknown');
    const difficultyStats = getMostLeast(difficultyCounts, gameModes, (id) => gameModes.find(gm => gm.id === id)?.name || 'Unknown');

    // Evidence most/least
    const evidenceStats = getMostLeast(evidenceCounts, evidence, (id) => evidence.find(e => e.id === id)?.name || 'Unknown');

    return {
      'fastest-run': fastestRun ? { ...getRunDetails(fastestRun), time: fastestRun.runTimeSeconds, run: fastestRun } : null,
      'slowest-run': slowestRun ? { ...getRunDetails(slowestRun), time: slowestRun.runTimeSeconds, run: slowestRun } : null,
      'avg-evidence': { value: avgEvidence, total: totalEvidence, runs: runs.length },
      'avg-players': { value: avgPlayers, total: totalPlayers, runs: runs.length },
      'avg-duration': { value: avgDuration, runs: runsWithTime.length },
      'perfect-rate': { value: perfectRate, perfect: perfectGames, total: runs.length },
      'most-ghost': ghostStats.most,
      'least-ghost': ghostStats.least,
      'most-evidence': evidenceStats.most,
      'least-evidence': evidenceStats.least,
      'most-map': mapStats.most,
      'least-map': mapStats.least,
      'most-possession': possessionStats.most,
      'least-possession': possessionStats.least,
      'most-difficulty': difficultyStats.most,
      'least-difficulty': difficultyStats.least,
    };
  }, [runs, maps, ghosts, evidence, gameModes, cursedPossessions]);

  // Get styling helpers
  const getBorderColor = (category) => {
    switch (category) {
      case 'timing': return 'border-blue-500';
      case 'averages': return 'border-purple-500';
      case 'ghosts': return 'border-green-500';
      case 'evidence': return 'border-yellow-500';
      case 'maps': return 'border-red-500';
      case 'possessions': return 'border-purple-500';
      case 'difficulty': return 'border-orange-500';
      default: return 'border-gray-500';
    }
  };

  const getTextColor = (category) => {
    switch (category) {
      case 'timing': return 'text-blue-400';
      case 'averages': return 'text-purple-400';
      case 'ghosts': return 'text-green-400';
      case 'evidence': return 'text-yellow-400';
      case 'maps': return 'text-red-400';
      case 'possessions': return 'text-purple-400';
      case 'difficulty': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  // Render individual stat card
  const renderStatCard = (statId) => {
    const statConfig = availableStats.find(s => s.id === statId);
    const statData = stats[statId];

    if (!statConfig || !statData) {
      return (
        <div key={statId} className="bg-gray-800 rounded-lg p-3 border-l-4 border-gray-500">
          <div className="text-sm font-medium text-gray-400 mb-2">{statConfig?.name || 'Unknown'}</div>
          <div className="text-lg font-bold text-gray-500">No Data</div>
        </div>
      );
    }

    const borderColor = getBorderColor(statConfig.category);
    const textColor = getTextColor(statConfig.category);

    return (
      <div key={statId} className={`bg-gray-800 rounded-lg p-3 border-l-4 ${borderColor}`}>
        <div className="text-sm font-medium text-gray-300 mb-2">{statConfig.name}</div>
        
        {/* Timing stats */}
        {(statId === 'fastest-run' || statId === 'slowest-run') && (
          <>
            <div className={`text-2xl font-bold ${textColor} mb-2 font-mono`}>
              {formatTime(statData.time)}
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <div>Run #{statData.run.runNumber}</div>
              <div className="truncate">{statData.mapName}</div>
              <div className="truncate">{statData.ghostName}</div>
              <div>{statData.playerCount} player{statData.playerCount !== 1 ? 's' : ''}</div>
            </div>
          </>
        )}

        {/* Average evidence */}
        {statId === 'avg-evidence' && (
          <>
            <div className={`text-2xl font-bold ${textColor} mb-2`}>
              {statData.value}
            </div>
            <div className="text-xs text-gray-400">
              {statData.total} total across {statData.runs} runs
            </div>
          </>
        )}

        {/* Average players */}
        {statId === 'avg-players' && (
          <>
            <div className={`text-2xl font-bold ${textColor} mb-2`}>
              {statData.value}
            </div>
            <div className="text-xs text-gray-400">
              {statData.total} total across {statData.runs} runs
            </div>
          </>
        )}

        {/* Average duration */}
        {statId === 'avg-duration' && (
          <>
            <div className={`text-2xl font-bold ${textColor} mb-2 font-mono`}>
              {formatTime(statData.value)}
            </div>
            <div className="text-xs text-gray-400">
              Across {statData.runs} timed runs
            </div>
          </>
        )}

        {/* Perfect rate */}
        {statId === 'perfect-rate' && (
          <>
            <div className={`text-2xl font-bold ${textColor} mb-2`}>
              {statData.value}%
            </div>
            <div className="text-xs text-gray-400">
              {statData.perfect} perfect out of {statData.total} runs
            </div>
          </>
        )}

        {/* Most/Least stats */}
        {(statId.startsWith('most-') || statId.startsWith('least-')) && (
          <>
            <div className={`text-lg font-bold ${textColor} mb-2`}>
              {statData.name}
            </div>
            <div className="text-xs text-gray-400">
              {statData.count} time{statData.count !== 1 ? 's' : ''}
            </div>
          </>
        )}
      </div>
    );
  };

  const handleStatToggle = (statId) => {
    setSelectedStats(prev => {
      if (prev.includes(statId)) {
        return prev.filter(id => id !== statId);
      } else if (prev.length < 6) {
        return [...prev, statId];
      }
      return prev;
    });
  };

  if (runs.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Enhanced Statistics
        </h3>
        <p className="text-sm text-gray-400">
          No runs available to calculate statistics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-100">
          Enhanced Statistics
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-blue-400 hover:text-blue-300 underline"
        >
          {showSettings ? 'Hide Settings' : 'Customize Stats'}
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="text-sm font-medium text-gray-300 mb-3">
            Select up to 6 statistics to display ({selectedStats.length}/6):
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableStats.map(stat => (
              <button
                key={stat.id}
                onClick={() => handleStatToggle(stat.id)}
                disabled={!selectedStats.includes(stat.id) && selectedStats.length >= 6}
                className={`px-3 py-2 text-xs rounded border transition-colors duration-200 text-left ${
                  selectedStats.includes(stat.id)
                    ? 'bg-blue-600 text-white border-blue-500'
                    : selectedStats.length >= 6
                    ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                    : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'
                }`}
              >
                {stat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedStats.map(statId => renderStatCard(statId))}
      </div>
    </div>
  );
};

export default EnhancedStats;