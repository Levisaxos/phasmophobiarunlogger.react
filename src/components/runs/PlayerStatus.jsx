// components/AddRun/PlayerStatus.jsx - Fixed version
import React from 'react';

const PlayerStatus = ({
  todaysPlayers,
  playerStates,
  onPlayerStatusToggle,
  onChangePlayersClick
}) => {
  const handlePlayerStatusToggle = (player) => {
    const currentStatus = playerStates[player] || 'alive';
    onPlayerStatusToggle(player, currentStatus === 'alive' ? 'dead' : 'alive');
  };

  if (todaysPlayers.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Players (0) *
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No players selected for today's session. Please set up your gaming session first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-2 gap-2">
        <label className="block text-sm font-medium text-gray-300">
          Players ({todaysPlayers.length})
        </label>
        <button
          type="button"
          onClick={onChangePlayersClick}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          ✎
        </button>
      </div>

      {/* Compact grid layout */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {todaysPlayers.map((player) => {
          // Get current status, defaulting to 'alive' if not set
          const currentStatus = playerStates[player] || 'alive';
          const isAlive = currentStatus === 'alive';
          
          return (
            <button
              key={player}
              type="button"
              onClick={() => handlePlayerStatusToggle(player)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors duration-200 text-center ${
                isAlive
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {player} {isAlive ? '😄' : '💀'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerStatus;