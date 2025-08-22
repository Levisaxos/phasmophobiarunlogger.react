// src/components/session/SessionSetup.jsx - Updated with map collections support
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { dataService } from '../../services/dataService';

const SessionSetup = ({ onStartSession, initialData = null }) => {
  const { maps, players: allPlayers, gameModes, mapCollections, loading, error } = useData();
  
  // Session setup state
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedMapCollection, setSelectedMapCollection] = useState(null);

  // Get individual maps (not part of any collection) and active collections, then combine them
  const { allMapEntries } = useMemo(() => {
    // Get map IDs that are part of collections
    const collectionMapIds = new Set();
    mapCollections.forEach(collection => {
      if (collection.isActive !== false) {
        collection.mapIds.forEach(mapId => collectionMapIds.add(mapId));
      }
    });
    
    // Filter individual maps that are not archived and not part of collections
    const individualMaps = maps.filter(map => 
      !map.isArchived && !collectionMapIds.has(map.id)
    ).map(map => ({
      ...map,
      type: 'map',
      sortOrder: map.id
    }));
    
    // Get active collections and mark them as collections
    // Use the first map ID as the sort order
    const activeCollections = mapCollections.filter(collection => 
      collection.isActive !== false
    ).map(collection => ({
      ...collection,
      type: 'collection',
      sortOrder: collection.mapIds.length > 0 ? collection.mapIds[0] : 999999
    }));
    
    // Combine all entries
    const allEntries = [...individualMaps, ...activeCollections];
    
    return {
      allMapEntries: allEntries
    };
  }, [maps, mapCollections]);

  // Sort all map entries by size and sortOrder (which is the map ID or first map ID for collections)
  const sortedMapEntries = useMemo(() => {
    const sizeOrder = { 'small': 1, 'medium': 2, 'large': 3 };
    
    return allMapEntries.sort((a, b) => {
      const sizeA = sizeOrder[a.size] || 999;
      const sizeB = sizeOrder[b.size] || 999;
      
      if (sizeA !== sizeB) {
        return sizeA - sizeB;
      }
      
      // Within same size, sort by sortOrder (map ID or first map ID for collections)
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [allMapEntries]);

  const activeGameModes = useMemo(() => gameModes.filter(gm => gm.isActive), [gameModes]);
  const activePlayers = useMemo(() => allPlayers.filter(p => p.isActive), [allPlayers]);

  // Load initial data or saved session preferences on mount
  useEffect(() => {
    if (initialData) {
      // Use initial data (from previous session)
      if (initialData.players && Array.isArray(initialData.players)) {
        setSelectedPlayers(initialData.players);
      }
      if (initialData.gameMode && activeGameModes.find(gm => gm.id === initialData.gameMode.id)) {
        setSelectedGameMode(initialData.gameMode.id);
      }
      
      // Handle map collections in initial data
      if (initialData.mapCollection) {
        setSelectedMapCollection(initialData.mapCollection);
        setSelectedMap(null);
      } else if (initialData.map) {
        setSelectedMap(initialData.map);
        setSelectedMapCollection(null);
      }
    } else {
      // Load saved preferences
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
    }
  }, [activeGameModes, initialData]);

  // Save preferences when they change (but not when loading initial data)
  useEffect(() => {
    if (!initialData && (selectedPlayers.length > 0 || selectedGameMode)) {
      const preferences = {
        players: selectedPlayers,
        gameModeId: selectedGameMode
      };
      localStorage.setItem('phasmophobia-session-preferences', JSON.stringify(preferences));
    }
  }, [selectedPlayers, selectedGameMode, initialData]);

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

  const handleMapEntrySelect = (entry) => {
    if (entry.type === 'map') {
      setSelectedMap(entry);
      setSelectedMapCollection(null);
    } else if (entry.type === 'collection') {
      setSelectedMapCollection(entry);
      setSelectedMap(null);
    }
  };

  const handleStartSession = () => {
    if ((!selectedMap && !selectedMapCollection) || !selectedGameMode || selectedPlayers.length === 0) {
      return;
    }

    const sessionData = {
      players: selectedPlayers,
      gameMode: activeGameModes.find(gm => gm.id === selectedGameMode),
      map: selectedMap,
      mapCollection: selectedMapCollection
    };

    console.log('Starting session with data:', sessionData); // Debug log
    onStartSession(sessionData);
  };

  const canStartSession = (selectedMap || selectedMapCollection) && selectedGameMode && selectedPlayers.length > 0;
  const selectedGameModeObj = selectedGameMode ? activeGameModes.find(gm => gm.id === selectedGameMode) : null;

  // Helper function to get room count from map
  const getRoomCount = (map) => {
    let roomCount = 0;
    if (map.floors && Array.isArray(map.floors)) {
      map.floors.forEach(floor => {
        if (floor.rooms && Array.isArray(floor.rooms)) {
          roomCount += floor.rooms.length;
        }
      });
    }
    return roomCount;
  };

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
      {/* Header message if continuing session */}
      {initialData && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-md">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">🎯 Continue Session</h3>
          <p className="text-blue-300 text-sm">
            Run completed! Your players and game mode have been preserved. 
            {selectedMapCollection 
              ? 'Select a new map to start your next run.'
              : 'Select a new map to start your next run.'
            }
          </p>
        </div>
      )}

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

        {/* Difficulty and Session Summary in a row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Difficulty Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Difficulty</h3>
            {activeGameModes.length === 0 ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
                <p className="text-yellow-400 text-sm">
                  No game modes configured. Please go to Manage → Game Modes to add game modes first.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {activeGameModes.map((gameMode) => {
                  const isSelected = selectedGameMode === gameMode.id;
                  const evidenceText = gameMode.maxEvidence === 0 
                    ? 'No evidence' 
                    : `${gameMode.maxEvidence} evidence`;
                  
                  return (
                    <button
                      key={gameMode.id}
                      onClick={() => setSelectedGameMode(gameMode.id)}
                      className={`p-3 text-left border-2 rounded-md transition-colors duration-200 text-sm ${
                        isSelected
                          ? 'bg-orange-600 border-orange-500 text-white'
                          : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium truncate">
                        {gameMode.name}
                      </div>
                      <div className="text-xs opacity-75">
                        {evidenceText}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-3">Session Summary</h3>
            <div className="bg-gray-800 border border-gray-600 rounded-md p-3 text-sm">
              <div className="space-y-1">
                <div>
                  <span className="text-gray-400">Players:</span>
                  <span className="text-gray-200 font-medium ml-2">
                    {selectedPlayers.length > 0 ? selectedPlayers.join(', ') : 'None selected'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Difficulty:</span>
                  <span className="text-gray-200 font-medium ml-2">
                    {selectedGameModeObj?.name || 'None selected'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Map:</span>
                  <span className="text-gray-200 font-medium ml-2">
                    {selectedMap 
                      ? `${selectedMap.name} (${selectedMap.size})`
                      : selectedMapCollection
                      ? `${selectedMapCollection.name} (${selectedMapCollection.selectionLabel})`
                      : 'None selected'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-100 mb-3">
            Select Map
            {initialData && (
              <span className="ml-2 text-sm font-normal text-blue-400">
                (Choose your next map)
              </span>
            )}
          </h3>
          
          {sortedMapEntries.length === 0 ? (
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
              <p className="text-yellow-400 text-sm">
                No maps configured. Please go to Manage → Maps to add maps first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Group all map entries by size */}
              {['small', 'medium', 'large'].map(size => {
                const entriesOfSize = sortedMapEntries.filter(entry => entry.size === size);
                
                if (entriesOfSize.length === 0) return null;
                
                return (
                  <div key={size}>
                    <h4 className="text-base font-medium text-gray-200 mb-2 capitalize flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        size === 'small' ? 'bg-green-500' : 
                        size === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></span>
                      {size} ({entriesOfSize.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                      {entriesOfSize.map((entry) => {
                        const isSelected = entry.type === 'map' 
                          ? selectedMap?.id === entry.id
                          : selectedMapCollection?.id === entry.id;
                        
                        let roomCount = 0;
                        let hasNoRooms = false;
                        let subtitle = '';
                        let buttonColor = '';
                        
                        if (entry.type === 'map') {
                          // Regular map
                          roomCount = getRoomCount(entry);
                          hasNoRooms = roomCount === 0;
                          subtitle = hasNoRooms ? 'No rooms configured' : `${roomCount} rooms`;
                          buttonColor = isSelected 
                            ? 'bg-green-600 border-green-500 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600';
                        } else {
                          // Map collection
                          subtitle = `${entry.mapIds.length} ${entry.selectionLabel.toLowerCase()}s`;
                          buttonColor = isSelected
                            ? 'bg-green-600 border-green-500 text-white'
                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600';
                        }
                        
                        return (
                          <button
                            key={`${entry.type}-${entry.id}`}
                            onClick={() => !hasNoRooms && handleMapEntrySelect(entry)}
                            disabled={hasNoRooms}
                            className={`p-3 text-left border-2 rounded-md transition-colors duration-200 text-sm ${
                              hasNoRooms
                                ? 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                                : buttonColor
                            }`}
                          >
                            <div className={`font-medium truncate ${hasNoRooms ? 'line-through' : ''}`}>
                              {entry.name}
                              {entry.type === 'collection' && (
                                <span className="ml-1 text-xs opacity-75">📁</span>
                              )}
                            </div>
                            <div className="text-xs opacity-75">
                              {subtitle}
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
            {initialData 
              ? (canStartSession ? 'Start Next Run' : 'Select Map to Continue') 
              : (canStartSession ? 'Start Session' : 'Complete Setup to Start')
            }
          </button>
          
          {!canStartSession && (
            <p className="mt-2 text-xs text-gray-400">
              {initialData 
                ? 'Please select a map to start your next run'
                : 'Please select players, difficulty, and map to start your session'
              }
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionSetup;