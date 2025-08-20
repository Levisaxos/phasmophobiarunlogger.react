// components/TodaysPlayersModal.jsx
import React, { useState, useEffect, useMemo } from 'react';

const TodaysPlayersModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  allPlayers = [], 
  currentTodaysPlayers = [] 
}) => {
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  // Get active and default players
  const activePlayers = useMemo(() => allPlayers.filter(p => p.isActive), [allPlayers]);
  const defaultPlayers = useMemo(() => activePlayers.filter(p => p.isDefault), [activePlayers]);

  useEffect(() => {
    if (isOpen) {
      if (currentTodaysPlayers.length > 0) {
        // If there are already today's players set, use those
        setSelectedPlayers([...currentTodaysPlayers]);
      } else if (defaultPlayers.length > 0) {
        // If no today's players but there are default players, use default players
        setSelectedPlayers(defaultPlayers.map(p => p.name));
      } else if (activePlayers.length > 0) {
        // If no default players, select the first active player
        setSelectedPlayers([activePlayers[0].name]);
      } else {
        // No players available
        setSelectedPlayers([]);
      }
    }
  }, [isOpen, currentTodaysPlayers, defaultPlayers, activePlayers]);

  const handlePlayerToggle = (playerName) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerName)) {
        if (prev.length > 1) {
          return prev.filter(name => name !== playerName);
        }
        return prev; // Don't allow removing the last player
      } else {
        return [...prev, playerName];
      }
    });
  };

  const handleConfirm = () => {
    if (selectedPlayers.length === 0) {
      alert('Please select at least one player for today\'s session.');
      return;
    }
    onConfirm(selectedPlayers);
  };

  const handleClose = () => {
    if (currentTodaysPlayers.length === 0 && selectedPlayers.length === 0) {
      alert('Please select at least one player to continue.');
      return;
    }
    onClose();
  };

  const handleSelectAllDefaults = () => {
    setSelectedPlayers(defaultPlayers.map(p => p.name));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-100">🎮 Today's Gaming Session</h3>
          {currentTodaysPlayers.length > 0 && (
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            Select who's playing today. These players will be automatically included in all runs for today's session.
          </p>

          {activePlayers.length === 0 ? (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
              <p className="text-yellow-400 text-sm">
                No active players configured. Please go to Manage → Players to add players first.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-300">
                  Select Players ({selectedPlayers.length})
                </label>
                {defaultPlayers.length > 0 && currentTodaysPlayers.length === 0 && (
                  <button
                    onClick={handleSelectAllDefaults}
                    className="text-xs text-blue-400 hover:text-blue-300 underline"
                  >
                    Select All Defaults
                  </button>
                )}
              </div>
              
              {activePlayers.map((player) => {
                const isSelected = selectedPlayers.includes(player.name);
                const isLastSelected = selectedPlayers.length === 1 && isSelected;
                const isDefault = player.isDefault;

                return (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerToggle(player.name)}
                    disabled={isLastSelected}
                    className={`w-full text-left px-4 py-3 rounded-md transition-colors duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600 text-white border-2 border-blue-500'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-gray-600'
                    } ${isLastSelected ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'bg-white border-white' : 'border-gray-400'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {player.name}
                          {isDefault && (
                            <span className="text-xs bg-blue-400 text-blue-900 px-2 py-0.5 rounded font-medium">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        {isDefault && (
                          <div className="text-xs opacity-75">Default Player</div>
                        )}
                      </div>
                    </div>
                    {isLastSelected && (
                      <span className="text-xs opacity-75">Required</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {currentTodaysPlayers.length > 0 && (
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={selectedPlayers.length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {currentTodaysPlayers.length > 0 ? 'Update Session' : 'Start Session'}
          </button>
        </div>

        {selectedPlayers.length > 0 && (
          <div className="mt-4 p-3 bg-gray-700 rounded-md">
            <p className="text-sm text-gray-300 mb-2">Today's Players:</p>
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.map((playerName) => {
                const player = activePlayers.find(p => p.name === playerName);
                return (
                  <span key={playerName} className={`px-2 py-1 text-white text-xs rounded-md flex items-center gap-1 ${
                    player?.isDefault ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    {player?.isDefault && '🌟'}{playerName}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodaysPlayersModal;