// src/components/runs/TimingStats.jsx
import React from 'react';

const TimingStats = ({ runs, maps, ghosts }) => {
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

  // Get runs with valid run times
  const runsWithTime = runs.filter(run => run.runTimeSeconds && run.runTimeSeconds > 0);

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (runsWithTime.length === 0) {
      return {
        fastest: { time: null, run: null },
        slowest: { time: null, run: null },
        average: null,
        totalRuns: 0
      };
    }

    const times = runsWithTime.map(run => run.runTimeSeconds);
    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);
    const averageTime = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);

    const fastestRun = runsWithTime.find(run => run.runTimeSeconds === fastestTime);
    const slowestRun = runsWithTime.find(run => run.runTimeSeconds === slowestTime);

    return {
      fastest: { time: fastestTime, run: fastestRun },
      slowest: { time: slowestTime, run: slowestRun },
      average: averageTime,
      totalRuns: runsWithTime.length
    };
  }, [runsWithTime]);

  // Helper function to get run details for display
  const getRunDetails = (run) => {
    if (!run) return { mapName: '', ghostName: '', playerCount: 0 };
    
    const map = maps.find(m => m.id === run.mapId);
    const ghost = ghosts.find(g => g.id === run.actualGhostId || g.id === run.ghostId);
    
    return {
      mapName: map?.name || 'Unknown Map',
      ghostName: ghost?.name || 'Unknown Ghost',
      playerCount: run.playerCount || 0
    };
  };

  if (runs.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg shadow p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Timing Statistics
          </h3>
          <p className="text-sm text-gray-400">
            No runs available to calculate timing statistics.
          </p>
        </div>
      </div>
    );
  }

  if (stats.totalRuns === 0) {
    return (
      <div className="bg-gray-700 rounded-lg shadow p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-100 mb-2">
            Timing Statistics
          </h3>
          <p className="text-sm text-gray-400">
            No runs with recorded times in the current filter. Timing data is available for runs created with the timer feature.
          </p>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Showing {runs.length} run{runs.length !== 1 ? 's' : ''} total, 0 with timing data
          </p>
        </div>
      </div>
    );
  }

  const fastestDetails = getRunDetails(stats.fastest.run);
  const slowestDetails = getRunDetails(stats.slowest.run);

  return (
    <div className="bg-gray-700 rounded-lg shadow p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Timing Statistics
        </h3>
        <p className="text-sm text-gray-400">
          Based on {stats.totalRuns} run{stats.totalRuns !== 1 ? 's' : ''} with timing data 
          {runs.length !== stats.totalRuns && (
            <span> (out of {runs.length} total filtered runs)</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Fastest Time */}
        <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Fastest</span>
          </div>
          <div className="text-2xl font-bold text-green-400 mb-2 font-mono">
            {formatTime(stats.fastest.time)}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Run #{stats.fastest.run.runNumber}</div>
            <div className="truncate">{fastestDetails.mapName}</div>
            <div className="truncate">{fastestDetails.ghostName}</div>
            <div>{fastestDetails.playerCount} player{fastestDetails.playerCount !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Average Time */}
        <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Average</span>
          </div>
          <div className="text-2xl font-bold text-blue-400 mb-2 font-mono">
            {formatTime(stats.average)}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Across {stats.totalRuns} run{stats.totalRuns !== 1 ? 's' : ''}</div>
            <div className="text-gray-500">•••</div>
            <div className="text-gray-500">•••</div>
            <div className="text-gray-500">•••</div>
          </div>
        </div>

        {/* Slowest Time */}
        <div className="bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">Slowest</span>
          </div>
          <div className="text-2xl font-bold text-red-400 mb-2 font-mono">
            {formatTime(stats.slowest.time)}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Run #{stats.slowest.run.runNumber}</div>
            <div className="truncate">{slowestDetails.mapName}</div>
            <div className="truncate">{slowestDetails.ghostName}</div>
            <div>{slowestDetails.playerCount} player{slowestDetails.playerCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>
            Time Range: {formatTime(stats.fastest.time)} - {formatTime(stats.slowest.time)}
          </span>
          <span>
            {((stats.totalRuns / runs.length) * 100).toFixed(0)}% of runs have timing data
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimingStats;