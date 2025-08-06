import React from 'react';

const RunsList = ({
  runs,
  selectedRun,
  onRunSelect,
  maps,
  ghosts,
  availableCursedPossessions
}) => {
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

  // Format time for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get run details
  const getRunDetails = (run) => {
    const map = maps.find(m => m.id === run.mapId);
    const ghost = ghosts.find(g => g.id === run.ghostId);
    const cursedPossession = run.cursedPossessionId ? 
      availableCursedPossessions.find(p => p.id === run.cursedPossessionId) : null;
    return { map, ghost, cursedPossession };
  };

  return (
    <div className="w-72 bg-gray-700 rounded-lg shadow flex flex-col h-full">
      <div className="p-4 border-b border-gray-600 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-100">Runs</h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4">
          {runs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                No runs match the selected filters
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {runs.map((run) => {
                const { map, ghost, cursedPossession } = getRunDetails(run);
                return (
                  <button
                    key={run.id}
                    onClick={() => onRunSelect(run)}
                    className={`w-full text-left px-3 py-3 rounded-md text-sm transition-colors duration-200 border ${selectedRun?.id === run.id
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        Run #{run.runNumber} - {formatDate(run.date)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${run.wasCorrect
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                        }`}>
                        {run.wasCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>{map?.name || 'Unknown Map'} - {run.roomName}</div>
                      <div>{ghost?.name || 'Unknown Ghost'}</div>
                      {cursedPossession && (
                        <div className="text-purple-400">🔮 {cursedPossession.name}</div>
                      )}
                      <div>{run.players?.join(', ') || 'No players'} ({run.playerCount} players)</div>
                      <div>{formatTime(run.timestamp)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RunsList;