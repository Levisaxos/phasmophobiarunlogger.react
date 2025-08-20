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
    const actualghost = ghosts.find(g => g.id === run.actualGhostId);
    const cursedPossession = run.cursedPossessionId ?
      availableCursedPossessions.find(p => p.id === run.cursedPossessionId) : null;
    
    // Get room name - handle both room ID and legacy room name
    const getRoomName = () => {
      if (run.roomName) {
        // If roomName exists, use it (covers both legacy and new format)
        return run.roomName;
      } else if (run.roomId && map?.rooms) {
        // If we have roomId and map rooms, try to find room by ID
        if (typeof map.rooms[0] === 'object') {
          // New format: rooms with IDs
          const room = map.rooms.find(r => r.id === run.roomId);
          return room?.name || 'Unknown Room';
        }
      }
      return 'Unknown Room';
    };
    
    return { map, ghost, cursedPossession, actualghost, roomName: getRoomName() };
  };

  // Format players with color coding based on alive/dead status
  const formatPlayersWithStatus = (run) => {
    // Handle both new and legacy player data formats
    let playersData = [];
    
    if (run.players && Array.isArray(run.players) && typeof run.players[0] === 'object') {
      // New format: players is array of objects with id, name, status
      playersData = run.players;
    } else if (run.players && Array.isArray(run.players)) {
      // Legacy format: players is array of names, use playerStates for status
      const playerStates = run.playerStates || {};
      playersData = run.players.map(playerName => ({
        name: playerName,
        status: playerStates[playerName] || 'alive'
      }));
    } else if (run.playersLegacy) {
      // Fallback to legacy players field
      const playerStates = run.playerStates || {};
      playersData = run.playersLegacy.map(playerName => ({
        name: playerName,
        status: playerStates[playerName] || 'alive'
      }));
    }

    if (playersData.length === 0) {
      return <span className="text-gray-400">No players</span>;
    }
    
    return (
      <div className="flex flex-wrap gap-1">
        {playersData.map((player, index) => {
          const playerName = player.name || player;
          const status = player.status || 'alive';
          const isAlive = status === 'alive';
          
          return (
            <span key={playerName} className="inline-flex items-center">
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
                const { map, ghost, cursedPossession, actualghost, roomName } = getRunDetails(run);
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
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div>{map?.name || 'Unknown Map'} - {roomName}</div>
                      <div className='flex gap-2'>
                        {ghost?.name !== actualghost?.name && (
                          <span className='text-red-500 line-through'>{ghost?.name}</span>
                        )}
                        <span className='text-green-500'>{actualghost?.name || 'Unknown Ghost'}</span>
                      </div>
                      {cursedPossession && (
                        <div className="text-purple-400">{cursedPossession.name}</div>
                      )}
                      <div>{formatPlayersWithStatus(run)}</div>
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