// src/components/session/SessionSetup.jsx - Auto-select challenge mode maps (Fixed imports) with map disabling
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import PlayersSection from './PlayersSection';
import DifficultyAndSessionSection from './DifficultyAndSessionSection';
import MapSelectionSection from './MapSelectionSection';

const SessionSetup = ({ onStartSession, initialData }) => {
  const {
    players: allPlayers,
    gameModes: allGameModes,
    maps: allMaps,
    mapCollections: allMapCollections,
    challengeModes: allChallengeModes,
    loading,
    error
  } = useData();

  // Session state
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedChallengeMode, setSelectedChallengeMode] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedMapCollection, setSelectedMapCollection] = useState(null);

  // Get active data
  const activePlayers = useMemo(() => allPlayers.filter(p => p.isActive), [allPlayers]);
  const activeGameModes = useMemo(() => allGameModes.filter(gm => gm.isActive), [allGameModes]);
  const availableChallengeModes = useMemo(() => allChallengeModes.filter(cm => !cm.isArchived), [allChallengeModes]);

  // Check if selected game mode is Challenge Mode (id: 6)
  const isChallengeModeSelected = selectedGameMode === 6;

  // Determine if map selection should be disabled (when challenge mode is selected)
  const isMapSelectionDisabled = isChallengeModeSelected && selectedChallengeMode;

  // Auto-select map/mapCollection when challenge mode is selected
  useEffect(() => {
    if (selectedChallengeMode && availableChallengeModes.length > 0) {
      const challengeModeObj = availableChallengeModes.find(cm => cm.id === selectedChallengeMode);
      if (challengeModeObj) {
        // Check if challenge mode has a mapCollectionId first (prioritize collections)
        if (challengeModeObj.mapCollectionId) {
          // Auto-select map collection
          const mapCollection = allMapCollections.find(mc => mc.id === challengeModeObj.mapCollectionId);
          if (mapCollection) {
            setSelectedMapCollection(mapCollection);
            setSelectedMap(null);
            console.log('Auto-selected map collection:', mapCollection.name);
          }
        } else if (challengeModeObj.mapId) {
          // Auto-select individual map
          const map = allMaps.find(m => m.id === challengeModeObj.mapId);
          if (map) {
            setSelectedMap(map);
            setSelectedMapCollection(null);
            console.log('Auto-selected individual map:', map.name);
          }
        }
      }
    }
  }, [selectedChallengeMode, availableChallengeModes, allMaps, allMapCollections]);

  // Initialize from saved preferences or initial data
  useEffect(() => {
    if (initialData) {
      // Continuing a session - preserve players and game mode
      setSelectedPlayers(initialData.players || []);
      setSelectedGameMode(initialData.gameMode?.id || null);
      setSelectedChallengeMode(initialData.challengeMode?.id || null);
      // Don't set map/collection as user needs to select new one
    } else {
      // Starting fresh - try to load from localStorage
      const savedPreferences = localStorage.getItem('phasmophobia-session-preferences');
      if (savedPreferences) {
        try {
          const preferences = JSON.parse(savedPreferences);
          if (preferences.players && preferences.players.length > 0) {
            setSelectedPlayers(preferences.players);
          }
          if (preferences.gameModeId) {
            setSelectedGameMode(preferences.gameModeId);
          }
          if (preferences.challengeModeId) {
            setSelectedChallengeMode(preferences.challengeModeId);
          }
        } catch (e) {
          console.warn('Error loading saved preferences:', e);
        }
      }
    }
  }, [initialData]);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (!initialData && (selectedPlayers.length > 0 || selectedGameMode)) {
      const preferences = {
        players: selectedPlayers,
        gameModeId: selectedGameMode,
        challengeModeId: selectedChallengeMode
      };
      localStorage.setItem('phasmophobia-session-preferences', JSON.stringify(preferences));
    }
  }, [selectedPlayers, selectedGameMode, selectedChallengeMode, initialData]);

  // Clear challenge mode when game mode changes
  useEffect(() => {
    if (!isChallengeModeSelected) {
      setSelectedChallengeMode(null);
      // Don't auto-clear map selection when switching away from challenge mode
      // as user might want to keep their manual selection
    }
  }, [isChallengeModeSelected]);

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
    // Don't allow map selection if challenge mode is active
    if (isMapSelectionDisabled) {
      return;
    }

    if (entry.type === 'map') {
      setSelectedMap(entry);
      setSelectedMapCollection(null);
    } else if (entry.type === 'collection') {
      setSelectedMapCollection(entry);
      setSelectedMap(null);
    }
  };

  const handleChallengeModeChange = (challengeModeId) => {
    setSelectedChallengeMode(challengeModeId);
    // Map auto-selection will be handled by the useEffect above
  };

  const handleStartSession = () => {
    if ((!selectedMap && !selectedMapCollection) || !selectedGameMode || selectedPlayers.length === 0) {
      return;
    }

    // For challenge mode, require challenge mode selection
    if (isChallengeModeSelected && !selectedChallengeMode) {
      return;
    }

    const sessionData = {
      players: selectedPlayers,
      gameMode: activeGameModes.find(gm => gm.id === selectedGameMode),
      challengeMode: selectedChallengeMode ? availableChallengeModes.find(cm => cm.id === selectedChallengeMode) : null,
      map: selectedMap,
      mapCollection: selectedMapCollection
    };

    console.log('Starting session with data:', sessionData); // Debug log
    onStartSession(sessionData);
  };

  const canStartSession = (selectedMap || selectedMapCollection) &&
    selectedGameMode &&
    selectedPlayers.length > 0 &&
    (!isChallengeModeSelected || selectedChallengeMode);

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
        <PlayersSection
          activePlayers={activePlayers}
          selectedPlayers={selectedPlayers}
          onPlayerToggle={handlePlayerToggle}
        />

        {/* Difficulty and Session Summary Section */}
        <DifficultyAndSessionSection
          activeGameModes={activeGameModes}
          selectedGameMode={selectedGameMode}
          onGameModeChange={setSelectedGameMode}
          selectedPlayers={selectedPlayers}
          selectedMap={selectedMap}
          selectedMapCollection={selectedMapCollection}
          selectedGameModeObj={selectedGameModeObj}
          isChallengeModeSelected={isChallengeModeSelected}
          availableChallengeModes={availableChallengeModes}
          selectedChallengeMode={selectedChallengeMode}
          onChallengeModeChange={handleChallengeModeChange}
        />

        {/* Map Selection Section */}
        <div className={isMapSelectionDisabled ? 'opacity-50 pointer-events-none' : ''}>
          <MapSelectionSection
            maps={allMaps}
            mapCollections={allMapCollections}
            selectedMap={selectedMap}
            selectedMapCollection={selectedMapCollection}
            onMapEntrySelect={handleMapEntrySelect}
          />
          {isMapSelectionDisabled && (
            <div className="mt-2 p-3 bg-orange-900/20 border border-orange-600/30 rounded-md">
              <p className="text-orange-300 text-sm flex items-center gap-2">
                <span>🎯</span>
                <span>Map selection is disabled because this challenge mode has a preset map.</span>
              </p>
            </div>
          )}
        </div>
       
        <div className="text-center pt-4 border-t border-gray-600">
          <button
            onClick={handleStartSession}
            disabled={!canStartSession}
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 mx-auto ${canStartSession
                ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-lg'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'
              }`}
          >
            <span className="text-xl">🎯</span>
            {initialData
              ? (canStartSession ? 'Start Next Run' : 'Complete Setup to Continue')
              : (canStartSession ? 'Start Session' : 'Complete Setup to Start')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSetup;