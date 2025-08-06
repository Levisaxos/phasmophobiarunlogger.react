import React from 'react';

const RunDetails = ({
  selectedRun,
  maps,
  ghosts,
  availableCursedPossessions
}) => {
  if (!selectedRun) {
    return (
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">Run Details</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-300 text-lg">Select a run to view details</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  const map = maps.find(m => m.id === selectedRun.mapId);
  const ghost = ghosts.find(g => g.id === selectedRun.ghostId);
  const cursedPossession = selectedRun.cursedPossessionId ? 
    availableCursedPossessions.find(p => p.id === selectedRun.cursedPossessionId) : null;

  return (
    <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
      <div className="p-6 border-b border-gray-600 flex-shrink-0">
        <h3 className="text-xl font-semibold text-gray-100">Run Details</h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-6">
          <div className="space-y-6">
            {/* Run Header */}
            <div className="pb-4 border-b border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-2xl font-bold text-gray-100">
                  Run #{selectedRun.runNumber}
                </h4>
              </div>
              <p className="text-gray-400">
                {formatDate(selectedRun.date)} at {formatTime(selectedRun.timestamp)}
              </p>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Location</h5>
                  <div className="bg-gray-800 rounded-lg p-4 relative">
                    <p className="text-lg font-medium text-gray-100">{map?.name || 'Unknown Map'}</p>
                    <p className="text-sm text-gray-300 capitalize">Size: {map?.size || 'Unknown'}</p>
                    <p className="text-sm text-gray-300 mt-2">Room: <span className="font-medium">{selectedRun.roomName}</span></p>

                    <div className={`absolute top-4 right-4 w-6 h-6 ${selectedRun.isPerfectGame ? 'text-yellow-400' : 'text-gray-500'}`}>
                      <svg viewBox="0 0 24 24" fill={selectedRun.isPerfectGame ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Cursed Possession */}
                {cursedPossession && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Cursed Possession</h5>
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-purple-400 text-lg">🔮</span>
                        <p className="text-lg font-medium text-purple-400">{cursedPossession.name}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1"></div>
                <div>
                  <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Ghost</h5>
                  <div className="bg-gray-800 rounded-lg p-4">
                    {selectedRun.wasCorrect ? (
                      // Correct guess - show in green
                      <p className="text-lg font-medium text-green-600">
                        {selectedRun.ghostName || 'Unknown Ghost'}
                      </p>
                    ) : (
                      // Incorrect guess - show crossed out in red, then actual ghost in green
                      <div>
                        <p className="text-lg font-medium text-red-600 line-through">
                          {selectedRun.ghostName || 'Unknown Ghost'}
                        </p>
                        <p className="text-lg font-medium text-green-600 mt-1">
                          {selectedRun.actualGhostName || 'Unknown Ghost'}
                        </p>
                      </div>
                    )}

                    {ghost?.evidence && ghost.evidence.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400 mb-1">Known Evidence:</p>
                        <div className="flex flex-wrap gap-1">
                          {ghost.evidence.map((evidence, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-600 text-gray-200 text-xs rounded"
                            >
                              {evidence}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Evidence Found</h5>
                  <div className="bg-gray-800 rounded-lg p-4">
                    {(selectedRun.evidence && selectedRun.evidence.length > 0) || cursedPossession ? (
                      <div className="grid grid-cols-1 gap-2">
                        {/* Regular Evidence */}
                        {selectedRun.evidence && selectedRun.evidence.length > 0 && (
                          selectedRun.evidence.map((evidence, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                            >
                              {evidence}
                            </div>
                          ))
                        )}
                        
                        {/* Cursed Possession */}
                        {cursedPossession && (
                          <div className="px-3 py-2 bg-purple-600 text-white rounded-md text-sm font-medium flex items-center gap-2">
                            <span>🔮</span>
                            <span>{cursedPossession.name}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">No evidence recorded</p>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Players</h5>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-300 mb-2">
                      {selectedRun.playerCount} player{selectedRun.playerCount !== 1 ? 's' : ''}
                    </p>
                    {selectedRun.players && selectedRun.players.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedRun.playerStates || {}).map(([player, status]) => (
                          <div
                            key={player}
                            className={`flex items-center justify-between p-2 rounded-md ${status === 'alive' ? 'bg-green-600/20 border border-green-600/30' : 'bg-red-600/20 border border-red-600/30'
                              }`}
                          >
                            <span className="text-sm font-medium text-gray-200">{player}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${status === 'alive' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                              {status === 'alive' ? '😄' : '💀'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-400">No players recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RunDetails;