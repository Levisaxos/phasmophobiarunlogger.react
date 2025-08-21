// src/components/session/SessionSetup.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../hooks/useData';

const SessionSetup = ({ onStartSession }) => {
  const { maps, players: allPlayers, gameModes, loading, error } = useData();
  
  // Session setup state
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);

  // Get active data with proper sorting
  const activeMaps = useMemo(() => {
    const filtered = maps.filter(map => !map.isArchived);
    
    // Sort by size: small, medium, large, then by name within each size
    const sizeOrder = { 'small': 1, 'medium': 2, 'large': 3 };
    
    return filtered.sort((a, b) => {
      const sizeA = sizeOrder[a.size] || 999;
      const sizeB = sizeOrder[b.size] || 999;
      
      if (sizeA !== sizeB) {
        return sizeA - sizeB;
      }
      
      // If same size, sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [maps]);
  
  const activeGameModes = useMemo(() => gameModes.filter(gm => gm.isActive), [gameModes]);
  const activePlayers = useMemo(() => allPlayers.filter(p => p.isActive), [allPlayers]);

  // Load saved session preferences on mount
  useEffect(() => {
    const savedPreferences = localStorage.getItem('phasmophobia-session-preferences');
    let hasLoadedPreferences = false;
    
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        
        // Restore players
        if (preferences.players && Array.isArray(preferences.players)) {
          setSelectedPlayers(preferences.players);
          hasLoadedPreferences = true;
        }
        
        // Restore game mode
        if (preferences.gameModeId && activeGameModes.find(gm => gm.id === preferences.gameModeId)) {
          setSelectedGameMode(preferences.gameModeId);
        }
      } catch (error) {
        console.error('Failed to load session preferences:', error);
      }
    }

    // Only load default players if no preferences were loaded and no players are currently selected
    if (!hasLoadedPreferences && selectedPlayers.length === 0) {
      const defaultPlayers = activePlayers.filter(p => p.isDefault);
      if (defaultPlayers.length > 0) {
        setSelectedPlayers(defaultPlayers.map(p => p.name));
      }
    }
  }, [activeGameModes]); // Removed selectedPlayers.length and activePlayers dependencies

  // Save preferences when they change
  useEffect(() => {
    if (selectedPlayers.length > 0 || selectedGameMode) {
      const preferences = {
        players: selectedPlayers,
        gameModeId: selectedGameMode
      };
      localStorage.setItem('phasmophobia-session-preferences', JSON.stringify(preferences));
    }
  }, [selectedPlayers, selectedGameMode]);

  const handlePlayerToggle = (playerName) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerName)) {
        // Don't allow removing the last player
        if (prev.length > 1) {
          return prev.filter(name => name !== playerName);
        }
        return prev;
      } else {
        return [...prev, playerName];
      }
    });
  };

  const handleStartSession = () => {
    if (!selectedMap || !selectedGameMode || selectedPlayers.length === 0) {
      return;
    }

    const sessionData = {
      players: selectedPlayers,
      gameMode: activeGameModes.find(gm => gm.id === selectedGameMode),
      map: selectedMap
    };

    onStartSession(sessionData);
  };

  const canStartSession = selectedMap && selectedGameMode && selectedPlayers.length > 0;
  const selectedGameModeObj = selectedGameMode ? activeGameModes.find(gm => gm.id === selectedGameMode) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading session setup...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading session setup: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow p-4 max-w-6xl mx-auto">
      <div className="space-y-6">
        {/* Players Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Players ({selectedPlayers.length})</h3>
          
          {activePlayers.length === 0 ? (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
              <p className="text-yellow-400 text-sm">
                No active players configured. Please go to Manage → Players to add players first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {activePlayers.map((player) => {
                const isSelected = selectedPlayers.includes(player.name);
                const isLastSelected = selectedPlayers.length === 1 && isSelected;

                return (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerToggle(player.name)}
                    disabled={isLastSelected}
                    className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 flex items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-blue-600 text-white border-2 border-blue-500'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border-2 border-gray-600'
                    } ${isLastSelected ? 'opacity-75 cursor-not-allowed' : ''}`}
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

        {/* Game Mode and Map in a row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Game Mode Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Difficulty</h3>
            {activeGameModes.length === 0 ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
                <p className="text-yellow-400 text-sm">
                  No game modes configured. Please go to Manage → Game Modes to add game modes first.
                </p>
              </div>
            ) : (
              <select
                value={selectedGameMode || ''}
                onChange={(e) => setSelectedGameMode(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {!selectedGameMode && (<option value="">Select difficulty...</option>)}
                {activeGameModes.map((gameMode) => (
                  <option key={gameMode.id} value={gameMode.id}>
                    {gameMode.name} (Max {gameMode.maxEvidence || 0} evidence)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Session Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Session Summary</h3>
            {canStartSession ? (
              <div className="bg-gray-800 border border-gray-600 rounded-md p-3 text-sm">
                <div className="space-y-1">
                  <div>
                    <span className="text-gray-400">Players:</span>
                    <span className="text-gray-200 font-medium ml-2">{selectedPlayers.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Difficulty:</span>
                    <span className="text-gray-200 font-medium ml-2">{selectedGameModeObj?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Map:</span>
                    <span className="text-gray-200 font-medium ml-2">{selectedMap?.name} ({selectedMap?.size})</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 border border-gray-600 rounded-md p-3 text-sm text-gray-400">
                Complete setup to see summary
              </div>
            )}
          </div>
        </div>

        {/* Map Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-3">Select Map</h3>
          {activeMaps.length === 0 ? (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
              <p className="text-yellow-400 text-sm">
                No maps configured. Please go to Manage → Maps to add maps first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Group maps by size */}
              {['small', 'medium', 'large'].map(size => {
                const mapsOfSize = activeMaps.filter(map => map.size === size);
                
                if (mapsOfSize.length === 0) return null;
                
                return (
                  <div key={size}>
                    <h4 className="text-base font-medium text-gray-200 mb-2 capitalize flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        size === 'small' ? 'bg-green-500' : 
                        size === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      {size} ({mapsOfSize.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                      {mapsOfSize.map((map) => {
                        const isSelected = selectedMap?.id === map.id;
                        const roomCount = map.rooms ? map.rooms.length : 0;
                        const hasNoRooms = roomCount === 0;
                        
                        return (
                          <button
                            key={map.id}
                            onClick={() => !hasNoRooms && setSelectedMap(map)}
                            disabled={hasNoRooms}
                            className={`p-3 text-left border-2 rounded-md transition-colors duration-200 text-sm ${
                              hasNoRooms
                                ? 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                : isSelected
                                ? 'bg-green-600 border-green-500 text-white'
                                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            <div className={`font-medium truncate ${hasNoRooms ? 'line-through' : ''}`}>
                              {map.name}
                            </div>
                            <div className="text-xs opacity-75">
                              {hasNoRooms ? 'No rooms configured' : `${roomCount} rooms`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Start Session Button */}
        <div className="text-center pt-4 border-t border-gray-600">
          <button
            onClick={handleStartSession}
            disabled={!canStartSession}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2 mx-auto"
          >
            <span className="text-xl">🎯</span>
            {canStartSession ? 'Start Session' : 'Complete Setup to Start'}
          </button>
          
          {!canStartSession && (
            <p className="mt-2 text-xs text-gray-400">
              Please select players, difficulty, and map to start your session
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionSetup;