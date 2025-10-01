// src/components/session/PlayersSection.jsx
import React from 'react';

const PlayersSection = ({ 
  activePlayers, 
  selectedPlayers, 
  onPlayerToggle 
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-100 mb-3">
        Players ({selectedPlayers.length}) 
        <span className="text-red-400 ml-1">*</span>
        {selectedPlayers.length === 0 && (
          <span className="text-red-400 text-sm font-normal ml-2">- At least 1 player required</span>
        )}
      </h3>
      
      {activePlayers.length === 0 ? (
        <div className="bg-red-900/20 border border-red-600/30 rounded-md p-4">
          <p className="text-red-400 text-sm">
            ❌ <strong>No active players configured.</strong> Please go to <strong>Manage → Players</strong> to add players first.
            <br />
            <span className="text-red-300 text-xs mt-1 block">You cannot start a session without at least one player.</span>
          </p>
        </div>
      ) : selectedPlayers.length === 0 ? (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4 mb-4">
          <p className="text-yellow-400 text-sm">
            ⚠️ <strong>No players selected.</strong> Please select at least one player to start your session.
          </p>
        </div>
      ) : null}

      {activePlayers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
          {activePlayers.map((player) => {
            const isSelected = selectedPlayers.includes(player.name);
            const isLastSelected = selectedPlayers.length === 1 && isSelected;

            return (
              <button
                key={player.id}
                onClick={() => onPlayerToggle(player.name)}
                disabled={isLastSelected}
                className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 flex items-center justify-center gap-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-2 border-blue-500'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border-2 border-gray-600'
                } ${isLastSelected ? 'opacity-75 cursor-not-allowed' : ''}`}
                title={isLastSelected ? 'Cannot remove the last player - at least one player is required' : ''}
              >
                <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                  isSelected ? 'bg-white border-white' : 'border-gray-400'
                }`}>
                  {isSelected && (
                    <svg className="w-2 h-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="truncate">
                  {player.isDefault && '🌟'}{player.name}
                </span>
              </button>
            );
          })}
        </div>
      )}   
    </div>
  );
};

export default PlayersSection;