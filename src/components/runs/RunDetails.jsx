// src/components/runs/RunDetails.jsx - Fixed with all missing information
import React from 'react';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { getRoomName, getEvidenceNames } from '../../utils/formatUtils';

const RunDetails = ({
  selectedRun,
  maps,
  ghosts,
  evidence,
  gameModes,
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

  // Get run details
  const map = maps.find(m => m.id === selectedRun.mapId);
  const ghost = ghosts.find(g => g.id === selectedRun.ghostId);
  const actualGhost = ghosts.find(g => g.id === selectedRun.actualGhostId);
  const gameMode = gameModes.find(gm => gm.id === selectedRun.gameModeId);
  const cursedPossession = selectedRun.cursedPossessionId ? 
    availableCursedPossessions.find(p => p.id === selectedRun.cursedPossessionId) : null;

  const roomName = getRoomName(selectedRun, map);
  
  // Get evidence names from the run's evidence IDs
  const foundEvidenceNames = getEvidenceNames(selectedRun.evidenceIds || [], evidence);

  // Format players section
  const renderPlayersSection = () => {
    // Handle both new and legacy player data formats
    let playersData = [];
    let playerCount = 0;
    
    if (selectedRun.players && Array.isArray(selectedRun.players) && typeof selectedRun.players[0] === 'object') {
      // New format: players is array of objects with id, name, status
      playersData = selectedRun.players;
      playerCount = playersData.length;
    } else if (selectedRun.players && Array.isArray(selectedRun.players)) {
      // Legacy format: players is array of names, use playerStates for status
      const playerStates = selectedRun.playerStates || {};
      playersData = selectedRun.players.map(playerName => ({
        name: playerName,
        status: playerStates[playerName] || 'alive'
      }));
      playerCount = selectedRun.players.length;
    } else if (selectedRun.playersLegacy) {
      // Fallback to legacy players field
      const playerStates = selectedRun.playerStates || {};
      playersData = selectedRun.playersLegacy.map(playerName => ({
        name: playerName,
        status: playerStates[playerName] || 'alive'
      }));
      playerCount = selectedRun.playersLegacy.length;
    } else {
      playerCount = selectedRun.playerCount || 0;
    }

    return (
      <>
        <p className="text-sm text-gray-300 mb-2">
          {playerCount} player{playerCount !== 1 ? 's' : ''}
        </p>
        {playersData.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {playersData.map((player, index) => {
              const playerName = player.name || player;
              const status = player.status || 'alive';
              return (
                <div
                  key={`${playerName}-${index}`}
                  className={`flex items-center justify-between p-2 rounded-md ${
                    status === 'alive' 
                      ? 'bg-green-600/20 border border-green-600/30' 
                      : 'bg-red-600/20 border border-red-600/30'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-200">{playerName}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    status === 'alive' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-red-600 text-white'
                  }`}>
                    {status === 'alive' ? '😄' : '💀'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No players recorded</p>
        )}
      </>
    );
  };

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
                {/* Run Time Display */}
                {selectedRun.formattedRunTime && (
                  <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg px-3 py-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400">⏱️</span>
                      <span className="text-blue-300 font-mono font-bold">
                        {selectedRun.formattedRunTime}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-400">
                {formatDate(selectedRun.date)} at {formatTime(selectedRun.timestamp)}
              </p>
              {/* Game Mode Display */}
              {gameMode && (
                <p className="text-gray-300 mt-1">
                  <span className="text-gray-400">Difficulty:</span> {gameMode.name} (Max {gameMode.maxEvidence || 0} evidence)
                </p>
              )}
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Location</h5>
                  <div className="bg-gray-800 rounded-lg p-4 relative">
                    <p className="text-lg font-medium text-gray-100">{map?.name || 'Unknown Map'}</p>
                    <p className="text-sm text-gray-300 capitalize">Size: {map?.size || 'Unknown'}</p>
                    <p className="text-sm text-gray-300 mt-2">Room: <span className="font-medium">{roomName}</span></p>

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
                      <p className="text-lg font-medium text-green-500">
                        {ghost?.name || 'Unknown Ghost'}
                      </p>
                    ) : (
                      // Incorrect guess - show crossed out in red, then actual ghost in green
                      <div>
                        {ghost && (
                          <p className="text-lg font-medium text-red-500 line-through">
                            {ghost.name}
                          </p>
                        )}
                        <p className="text-lg font-medium text-green-500 mt-1">
                          {actualGhost?.name || 'Unknown Ghost'}
                        </p>
                      </div>
                    )}

                    {/* Show evidence for the actual ghost (or guessed ghost if correct) */}
                    {(() => {
                      const displayGhost = actualGhost || ghost;
                      if (displayGhost?.evidenceIds) {
                        const ghostEvidenceNames = getEvidenceNames(displayGhost.evidenceIds, evidence);
                        
                        if (ghostEvidenceNames.length > 0) {
                          return (
                            <div className="mt-2">
                              <p className="text-xs text-gray-400 mb-1">Known Evidence:</p>
                              <div className="flex flex-wrap gap-1">
                                {ghostEvidenceNames.map((evidenceName, index) => {
                                  // Check if this evidence was found in the run
                                  const wasFound = foundEvidenceNames.includes(evidenceName);
                                  
                                  return (
                                    <span
                                      key={index}
                                      className={`px-2 py-1 text-xs rounded ${
                                        wasFound 
                                          ? 'bg-blue-600 text-white border border-blue-400' 
                                          : 'bg-gray-600 text-gray-200'
                                      }`}
                                    >
                                      {evidenceName}
                                      {wasFound && ' ✓'}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Evidence Found</h5>
                  <div className="bg-gray-800 rounded-lg p-4">
                    {foundEvidenceNames.length > 0 || cursedPossession ? (
                      <div className="grid grid-cols-1 gap-2">
                        {/* Regular Evidence */}
                        {foundEvidenceNames.map((evidenceName, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium"
                          >
                            {evidenceName}
                          </div>
                        ))}                                                
                      </div>
                    ) : (
                      <p className="text-gray-400">No evidence recorded</p>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-2">Players</h5>
                  <div className="bg-gray-800 rounded-lg p-4">
                    {renderPlayersSection()}
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