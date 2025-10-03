// src/components/runs/CompactRunsView.jsx - Improved 3-column layout with colors and vertical dividers and challenge mode support
import React from 'react';
import { getRoomName, getEvidenceNames } from '../../utils/formatUtils';

const CompactRunsView = ({
  runs,
  maps,
  ghosts,
  evidence,
  gameModes,
  challengeModes,
  cursedPossessions
}) => {
  // Format date to compact format (e.g., "Mo 01-01-25")
  const formatCompactDate = (dateString) => {
    const date = new Date(dateString);
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    const dayAbbr = dayNames[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    return `${dayAbbr} ${day}-${month}-${year}`;
  };

  // Get run details
  const getRunDetails = (run) => {
    const map = maps.find(m => m.id === run.mapId);
    const ghost = ghosts.find(g => g.id === run.ghostId);
    const actualGhost = ghosts.find(g => g.id === run.actualGhostId);
    const gameMode = gameModes.find(gm => gm.id === run.gameModeId);
    const challengeMode = challengeModes.find(cm => cm.id === run.challengeModeId);
    const cursedPossession = run.cursedPossessionId ?
      cursedPossessions.find(p => p.id === run.cursedPossessionId) : null;

    const roomName = getRoomName(run, map);
    const evidenceNames = getEvidenceNames(run.evidenceIds || [], evidence);

    return { map, ghost, actualGhost, gameMode, challengeMode, cursedPossession, roomName, evidenceNames };
  };

  // Format players with status - colorful styling
  const formatPlayersWithStatus = (run) => {
    let playersData = [];

    if (run.players && Array.isArray(run.players) && run.players.length > 0) {
      if (typeof run.players[0] === 'object' && run.players[0].name) {
        playersData = run.players.map(player => ({
          name: String(player.name || 'Unknown'),
          status: String(player.status || 'alive')
        }));
      } else if (typeof run.players[0] === 'string') {
        const playerStates = run.playerStates || {};
        playersData = run.players.map(playerName => ({
          name: String(playerName),
          status: String(playerStates[playerName] || 'alive')
        }));
      }
    } else if (run.playersLegacy && Array.isArray(run.playersLegacy)) {
      const playerStates = run.playerStates || {};
      playersData = run.playersLegacy.map(playerName => ({
        name: String(playerName),
        status: String(playerStates[playerName] || 'alive')
      }));
    }

    if (playersData.length === 0) {
      return <span className="text-gray-300">No players</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {playersData.map((player, index) => {
          const isAlive = player.status === 'alive';
          return (
            <span
              key={`player-${index}-${player.name}`}
              className={`px-2 py-1 text-xs border rounded ${isAlive
                ? 'bg-green-600/20 border-green-500/50 text-green-300'
                : 'bg-red-600/20 border-red-500/50 text-red-300'
                }`}
            >
              {player.name}
            </span>
          );
        })}
      </div>
    );
  };

  // Format ghost display - showing guessed vs actual
  const formatGhostDisplay = (ghost, actualGhost, wasCorrect) => {
    const guessedName = ghost?.name || 'None';
    const actualName = actualGhost?.name || 'Unknown';

    if (guessedName === 'None' && actualName === 'Unknown') {
      return <span className="text-gray-300">Not recorded</span>;
    }

    return (
      <div className="space-y-1">
        <div className="text-gray-300">
          <span className>Guessed:</span> <span className={wasCorrect != null && wasCorrect ? `text-green-400` : `line-through text-red-400`}> {guessedName}</span> {wasCorrect != null && !wasCorrect && (<span className='text-green-400' >{actualName}</span>)}
        </div>
      </div>
    );
  };

  if (runs.length === 0) {
    return (
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex items-center justify-center">
        <p className="text-gray-300 text-lg">No runs match the selected filters</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
      <div className="p-4 border-b border-gray-600 flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-100">
          Runs ({runs.length})
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="p-4 space-y-4">
          {runs.map((run) => {
            try {
              const { map, ghost, actualGhost, gameMode, challengeMode, cursedPossession, roomName, evidenceNames } = getRunDetails(run);

              return (
                <div
                  key={`run-${run.id}`}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-4 hover:bg-gray-750 transition-colors duration-200"
                >
                  {/* 3-Column Grid Layout with Vertical Dividers */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">

                    {/* Column 1: Run Information */}
                    <div className="p-3 lg:border-r border-gray-600">
                      <h4 className="text-sm font-medium text-blue-400 mb-3 border-b border-gray-600 pb-2">
                        Run Information
                      </h4>

                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">Run:</span>
                          <span className="text-white font-medium ml-2">#{run.runNumber}</span>
                        </div>

                        <div>
                          <span className="text-gray-400 text-sm">Date:</span>
                          <span className="text-white ml-2">{formatCompactDate(run.date)}</span>
                        </div>

                        {run.formattedRunTime && (
                          <div>
                            <span className="text-gray-400 text-sm">Time:</span>
                            <span className="text-blue-300 font-mono ml-2">{run.formattedRunTime}</span>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-400 text-sm">Players:</span>
                          <div className="mt-1">
                            {formatPlayersWithStatus(run)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Game Setup */}
                    <div className="p-3 lg:border-r border-gray-600">
                      <h4 className="text-sm font-medium text-orange-400 mb-3 border-b border-gray-600 pb-2">
                        Game Setup
                      </h4>

                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">Location:</span>
                          <div className="text-white mt-1">
                            {map?.name || 'Unknown Map'} - <span className="text-gray-300">{roomName}</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-400 text-sm">Difficulty:</span>
                          <div className="text-orange-300 mt-1">{gameMode?.name || 'Unknown'}</div>
                        </div>

                        {/* Challenge Mode Display */}
                        {challengeMode && (
                          <div>
                            <span className="text-gray-400 text-sm">Challenge Mode:</span>
                            <div className="text-orange-400 font-medium mt-1">{challengeMode.name}</div>
                          </div>
                        )}

                        <div>
                          <span className="text-gray-400 text-sm">Perfect:</span>
                          <div className="mt-1">
                            {run.isPerfectGame ? (
                              <span className="text-yellow-400">⭐ Yes</span>
                            ) : (
                              <span className="text-gray-300">No</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column 3: Results */}
                    <div className="p-3">
                      <h4 className="text-sm font-medium text-green-400 mb-3 border-b border-gray-600 pb-2">
                        Results
                      </h4>

                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">Ghost:</span>
                          <div className="mt-1">
                            {formatGhostDisplay(ghost, actualGhost, run.wasCorrect)}
                          </div>
                        </div>

                        <div>
                          <span className="text-gray-400 text-sm">Evidence:</span>
                          <div className="mt-1">
                            {evidenceNames.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {evidenceNames.map((evidenceName, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 text-xs bg-blue-600 text-white border border-blue-500 rounded"
                                  >
                                    {evidenceName}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-300 text-sm">None found</span>
                            )}
                          </div>
                        </div>


                        <div>
                          <span className="text-gray-400 text-sm">Cursed Item:</span>
                          <div className='mt-1'>
                            {cursedPossession ? (
                              <div className="text-purple-300 mt-1">🔮 {cursedPossession.name}</div>
                            ) :
                              (
                                <span className="text-gray-300 text-sm">Not found</span>
                              )
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } catch (error) {
              console.error('Error rendering run:', error, run);
              return (
                <div key={`run-error-${run.id}`} className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                  <p className="text-red-400">Error displaying run #{run.runNumber}</p>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default CompactRunsView;