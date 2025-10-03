// src/components/runs/AddRun.jsx - Fixed to always return to session setup after run ends
import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAddRunForm } from '../../hooks/useAddRunForm';
import { useToast } from '../../hooks/useToast';
import SessionSetup from '../session/SessionSetup';

// Import from AddRun subdirectory
import CursedPossessionSelector from './CursedPossessionSelector';
import EvidenceSelector from './EvidenceSelector';
import GhostSelector from './GhostSelector';
import PlayerStatus from './PlayerStatus';
import FloorRoomSelector from './FloorRoomSelector';
import CollectionMapSelector from './CollectionMapSelector';

const AddRun = () => {
  const {
    maps,
    ghosts,
    evidence,
    cursedPossessions,
    players: allPlayers,
    gameModes,
    loading,
    error,
    createRun
  } = useData();

  const { success, error: showError, warning } = useToast();

  // Session state
  const [sessionData, setSessionData] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [currentRunTime, setCurrentRunTime] = useState(0);
  const [selectedCollectionMap, setSelectedCollectionMap] = useState(null);

  const {
    selectedFloor,
    selectedRoom,
    selectedCursedPossession,
    selectedEvidenceIds,
    excludedEvidenceIds,
    selectedGhost,
    actualGhost,
    excludedGhosts,
    playerStates,
    isPerfectGame,
    isSaving,
    setSelectedEvidenceIds,
    setIsSaving,
    handleFloorChange,
    handleRoomChange,
    handleCursedPossessionChange,
    handleEvidenceToggle,
    handleEvidenceExclude,
    handleGhostSelect,
    handleActualGhostSelect,
    handleGhostExclude,
    handlePlayerStatusToggle,
    handlePerfectGameToggle,
    resetForm,
    createRunData
  } = useAddRunForm();

  // Get active evidence and cursed possessions, sorted by sequence
  const availableEvidence = useMemo(() => {
    return evidence
      .filter(e => e.isActive)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [evidence]);

  const availableCursedPossessions = useMemo(() => {
    return cursedPossessions
      .filter(p => p.isActive)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [cursedPossessions]);

  const maxEvidence = sessionData?.gameMode?.maxEvidence ?? 3;

  // Clear evidence when game mode changes and new limit is lower
  useEffect(() => {
    if (selectedEvidenceIds.length > maxEvidence) {
      setSelectedEvidenceIds(prev => prev.slice(0, maxEvidence));
    }
  }, [maxEvidence, selectedEvidenceIds.length, setSelectedEvidenceIds]);

  // Auto-select collection map for challenge modes when session starts
  useEffect(() => {
    if (sessionData?.mapCollection && sessionData?.challengeMode?.mapCollectionId && !selectedCollectionMap) {
      const collectionMaps = maps.filter(map =>
        sessionData.mapCollection.mapIds.includes(map.id)
      );

      if (collectionMaps.length > 0) {
        const sortedMaps = [...collectionMaps].sort((a, b) => a.name.localeCompare(b.name));
        console.log('Auto-selecting wing/map for challenge mode:', sortedMaps[0].name);
        setSelectedCollectionMap(sortedMaps[0]);
      }
    }
  }, [sessionData, maps, selectedCollectionMap]);

  // Auto-increment timer when session is active
  useEffect(() => {
    if (sessionStartTime) {
      const interval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        setCurrentRunTime(elapsedSeconds);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [sessionStartTime]);

  const handleStartSession = (newSessionData) => {
    setSessionData(newSessionData);
    setSessionStartTime(Date.now());
    setCurrentRunTime(0);
    setSelectedCollectionMap(null);
    resetForm();
  };

  const handleEndSession = () => {
    // FIXED: Completely clear session to force return to setup
    setSessionData(null);
    setSessionStartTime(null);
    setCurrentRunTime(0);
    setSelectedCollectionMap(null);
  };

  const handleEndRun = () => {
    // FIXED: Completely clear ALL session state to force return to setup screen
    // This ensures we go back to the session selection screen
    console.log('handleEndRun: Clearing session data to return to setup');
    setSessionData(null);
    setSessionStartTime(null);
    setCurrentRunTime(0);
    setSelectedCollectionMap(null);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessionData) {
      warning('No active session found');
      return;
    }

    const actualMap = sessionData.mapCollection ? selectedCollectionMap : sessionData.map;
    if (!actualMap) {
      warning(sessionData.mapCollection
        ? `Please select a ${sessionData.mapCollection.selectionLabel.toLowerCase()} first`
        : 'No map selected for this session'
      );
      return;
    }

    setIsSaving(true);

    try {
      const selectedCursedPossessionObj = selectedCursedPossession
        ? availableCursedPossessions.find(p => p.id === selectedCursedPossession)
        : null;

      const runData = createRunData({
        sessionData,
        map: actualMap,
        selectedFloor,
        selectedRoom,
        selectedCursedPossessionObj,
        selectedEvidenceIds,
        excludedEvidenceIds,
        selectedGhost,
        actualGhost,
        excludedGhosts,
        playerStates,
        isPerfectGame,
        currentRunTime
      });

      const newRun = await createRun(runData);
      
      // Show success message BEFORE clearing (so we can still access sessionData)
      success(`Run #${newRun.runNumber} for ${sessionData.players.length} player${sessionData.players.length > 1 ? 's' : ''} today. Time: ${formatTime(currentRunTime)}`);
      
      // NOW clear session - this will trigger re-render and show SessionSetup
      setSessionData(null);

    } catch (err) {
      console.error('Error saving run:', err);
      showError('Failed to save run: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  const canSubmit = sessionData && (sessionData.map || (sessionData.mapCollection && selectedCollectionMap));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  // FIXED: Always show session setup if no active session
  if (!sessionData) {
    console.log('AddRun: No sessionData - showing SessionSetup');
    return <SessionSetup onStartSession={handleStartSession} />;
  }

  console.log('AddRun: Rendering run form with sessionData:', sessionData);

  return (
    <div className="bg-gray-700 rounded-lg shadow pl-6 pr-6 pb-6 pt-2">
      {/* Session Header */}
      <div className="mb-2 pb-2 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              🎮 {sessionData.mapCollection
                ? `${sessionData.mapCollection.name} - ${sessionData.gameMode.name}`
                : `${sessionData.map.name} - ${sessionData.gameMode.name}`
              }
              {sessionData.challengeMode && (
                <span
                  className="ml-2 text-orange-400 text-lg relative group cursor-help"
                  title={sessionData.challengeMode.description || 'No description available'}
                >
                  🎯 {sessionData.challengeMode.name}
                  {sessionData.challengeMode.description && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap max-w-xs z-10">
                      <div className="text-center">
                        {sessionData.challengeMode.description}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </span>
              )}
            </h2>
            <p className="text-gray-400">
              Players: {sessionData.players.join(', ')} • Max {maxEvidence} evidence
              {sessionData.challengeMode && sessionData.mapCollection && selectedCollectionMap && (
                <span className="ml-2 text-blue-400">
                  • Auto-selected: {selectedCollectionMap.name}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm"
          >
            End Session
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Floor/Room Selection and Wing Selection Row */}
        <div className="flex items-end gap-6">
          <div className={`flex-1 grid gap-4 items-end ${sessionData.mapCollection ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {sessionData.mapCollection && (
              <div>
                <CollectionMapSelector
                  mapCollection={sessionData.mapCollection}
                  availableMaps={maps}
                  selectedMap={selectedCollectionMap}
                  onMapChange={setSelectedCollectionMap}
                />
              </div>
            )}

            {(sessionData.map || selectedCollectionMap) && (
              <div className="col-span-2">
                <FloorRoomSelector
                  selectedMap={sessionData.map || selectedCollectionMap}
                  selectedFloor={selectedFloor}
                  onFloorChange={handleFloorChange}
                  selectedRoom={selectedRoom}
                  onRoomChange={handleRoomChange}
                />
              </div>
            )}
          </div>

          {/* Perfect Game and Timer Section */}
          <div className="flex items-end gap-4">
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Perfect
              </label>
              <button
                type="button"
                onClick={() => handlePerfectGameToggle(!isPerfectGame)}
                className={`w-full py-2 rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-1 h-[42px] ${
                  isPerfectGame
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border border-gray-500'
                }`}
              >
                <span className="text-lg">{isPerfectGame ? '⭐' : '☆'}</span>
                {isPerfectGame ? 'Yes' : 'No'}
              </button>
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Session Timer
              </label>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg blur-sm opacity-75"></div>
                <div className="relative bg-gray-900 border-2 border-gray-700 rounded-lg p-3 text-center">
                  <div className="text-xs font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                    {formatTime(currentRunTime)}
                  </div>                                    
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cursed Possession and Evidence Section - Side by Side */}
        <div className="flex gap-6">
          <div className="flex-1">
            <CursedPossessionSelector
              cursedPossessions={availableCursedPossessions}
              selectedCursedPossession={selectedCursedPossession}
              onCursedPossessionChange={handleCursedPossessionChange}
            />
          </div>

          <div className="flex-1">
            <EvidenceSelector
              evidence={availableEvidence}
              selectedEvidenceIds={selectedEvidenceIds}
              excludedEvidenceIds={excludedEvidenceIds}
              onEvidenceToggle={handleEvidenceToggle}
              onEvidenceExclude={handleEvidenceExclude}
              maxEvidence={maxEvidence}
              ghosts={ghosts}
            />
          </div>
        </div>

        {/* Ghost Selection Section */}
        <GhostSelector
          ghosts={ghosts}
          evidence={availableEvidence}
          selectedGhost={selectedGhost}
          actualGhost={actualGhost}
          excludedGhosts={excludedGhosts}
          onGhostSelect={handleGhostSelect}
          onActualGhostSelect={handleActualGhostSelect}
          onGhostExclude={handleGhostExclude}
          selectedEvidenceIds={selectedEvidenceIds}
          excludedEvidenceIds={excludedEvidenceIds}
        />

        {/* Player Status Section */}
        <PlayerStatus
          todaysPlayers={sessionData.players}
          playerStates={playerStates}
          onPlayerStatusToggle={handlePlayerStatusToggle}
        />

        {/* Submit Button and End Run */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-600">
          <button
            type="button"
            onClick={handleEndRun}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            End Run
          </button>

          <button
            type="submit"
            disabled={!canSubmit || isSaving}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
          >
            <span className="text-xl">💾</span>
            {isSaving ? 'Saving Run...' : `Save Run (${formatTime(currentRunTime)})`}
          </button>

          {!canSubmit && (
            <p className="mt-2 text-sm text-gray-400 text-center">
              {sessionData.mapCollection && !selectedCollectionMap
                ? `Please select a ${sessionData.mapCollection.selectionLabel.toLowerCase()} to continue`
                : 'Complete the form to save the run'
              }
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddRun;