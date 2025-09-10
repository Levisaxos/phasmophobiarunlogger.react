// src/components/runs/RunsList.jsx - Improved layout and ghost display
import React from 'react';
import { formatTime } from '../../utils/dateUtils';
import { getRoomName } from '../../utils/formatUtils';

const RunsList = ({
  runs,
  selectedRun,
  onRunSelect,
  maps,
  ghosts,
  gameModes = [], // Default to empty array if not provided
  availableCursedPossessions
}) => {
  // Get run details
  const getRunDetails = (run) => {
    const map = maps.find(m => m.id === run.mapId);
    const ghost = ghosts.find(g => g.id === run.ghostId);
    const actualghost = ghosts.find(g => g.id === run.actualGhostId);
    const gameMode = gameModes.find(gm => gm.id === run.gameModeId);
    const cursedPossession = run.cursedPossessionId ?
      availableCursedPossessions.find(p => p.id === run.cursedPossessionId) : null;
    
    const roomName = getRoomName(run, map);
    
    return { map, ghost, cursedPossession, actualghost, gameMode, roomName };
  };

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

  // Safe player formatting that ensures we never render objects
  const formatPlayersWithStatus = (run) => {
    try {
      // Handle both new and legacy player data formats
      let playersData = [];
      
      if (run.players && Array.isArray(run.players) && run.players.length > 0) {
        if (typeof run.players[0] === 'object' && run.players[0].name) {
          // New format: players is array of objects with id, name, status
          playersData = run.players.map(player => ({
            name: String(player.name || 'Unknown'),
            status: String(player.status || 'alive')
          }));
        } else if (typeof run.players[0] === 'string') {
          // Legacy format: players is array of names, use playerStates for status
          const playerStates = run.playerStates || {};
          playersData = run.players.map(playerName => ({
            name: String(playerName),
            status: String(playerStates[playerName] || 'alive')
          }));
        } else {
          // Handle other cases
          playersData = run.players.map((player, index) => ({
            name: String(player.name || player || `Player ${index + 1}`),
            status: String((player.status) || 'alive')
          }));
        }
      } else if (run.playersLegacy && Array.isArray(run.playersLegacy)) {
        // Fallback to legacy players field
        const playerStates = run.playerStates || {};
        playersData = run.playersLegacy.map(playerName => ({
          name: String(playerName),
          status: String(playerStates[playerName] || 'alive')
        }));
      }

      if (playersData.length === 0) {
        return <span className="text-gray-400">No players</span>;
      }
      
      return (
        <div className="flex flex-wrap gap-1">
          {playersData.map((player, index) => {
            const playerName = String(player.name);
            const status = String(player.status);
            const isAlive = status === 'alive';
            
            return (
              <span key={`player-${index}-${playerName}`} className="inline-flex items-center">
                <span className={`font-medium ${isAlive ? 'text-green-500' : 'text-red-500'}`}>
                  {playerName}
                </span>
                {/* Add comma separator except for last player */}
                {index < playersData.length - 1 && (
                  <span className="text-gray-400 ml-1">,</span>
                )}
              </span>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error formatting players:', error, run);
      return <span className="text-red-400">Error displaying players</span>;
    }
  };

  // Format ghost display with better incorrect guess handling
  const formatGhostDisplay = (ghost, actualGhost, wasCorrect) => {
    if (!ghost && !actualGhost) {
      return <span className="text-gray-400">Unknown Ghost</span>;
    }

    if (wasCorrect || !ghost || ghost.id === actualGhost?.id) {
      // Correct guess or only one ghost - show in neutral color
      const displayGhost = actualGhost || ghost;
      return (
        <span className="text-blue-400">
          {displayGhost.name || 'Unknown Ghost'}
        </span>
      );
    } else {
      // Incorrect guess - show both with clear visual distinction
      return (
        <div className="flex items-center gap-1">
          <span className="text-red-400 line-through text-xs">
            {ghost.name}
          </span>
          <span className="text-gray-400">→</span>
          <span className="text-blue-400">
            {actualGhost?.name || 'Unknown Ghost'}
          </span>
        </div>
      );
    }
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
                try {
                  const { map, ghost, cursedPossession, actualghost, gameMode, roomName } = getRunDetails(run);
                  
                  return (
                    <button
                      key={`run-${run.id}`}
                      onClick={() => onRunSelect(run)}
                      className={`w-full text-left px-3 py-3 rounded-md text-sm transition-colors duration-200 border ${selectedRun?.id === run.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                      {/* Header Row: Run # + Date + Timer */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Run #{run.runNumber}</span>
                          <span className="text-xs text-gray-400">
                            {formatCompactDate(run.date)}
                          </span>
                        </div>
                        {/* Timer Display */}
                        {run.formattedRunTime && (
                          <span className="text-xs bg-blue-600/30 text-blue-300 px-2 py-1 rounded font-mono">
                            {run.formattedRunTime}
                          </span>
                        )}
                      </div>
                      
                      {/* Content Rows */}
                      <div className="text-xs text-gray-400 space-y-1">
                        {/* Map + Difficulty Row */}
                        <div className="flex items-center justify-between">
                          <span className="truncate">{map?.name || 'Unknown Map'} - {roomName}</span>
                          {gameMode && (
                            <span className="text-orange-400 text-xs px-1.5 py-0.5 rounded bg-orange-900/20 ml-2 flex-shrink-0">
                              {gameMode.name}
                            </span>
                          )}
                        </div>
                        
                        {/* Ghost Row */}
                        <div>
                          {formatGhostDisplay(ghost, actualghost, run.wasCorrect)}
                        </div>
                        
                        {/* Cursed Possession Row (if present) */}
                        {cursedPossession && (
                          <div className="text-purple-400 truncate">
                            {cursedPossession.name}
                          </div>
                        )}
                        
                        {/* Players Row */}
                        <div className="truncate">
                          {formatPlayersWithStatus(run)}
                        </div>
                        
                        {/* Time Row */}
                        <div className="text-gray-500">
                          {formatTime(run.timestamp)}
                        </div>
                      </div>
                    </button>
                  );
                } catch (error) {
                  console.error('Error rendering run:', error, run);
                  return (
                    <div key={`run-error-${run.id}`} className="p-3 bg-red-900/20 border border-red-600/30 rounded-md">
                      <p className="text-red-400 text-sm">Error displaying run #{run.runNumber}</p>
                    </div>
                  );
                }
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RunsList;