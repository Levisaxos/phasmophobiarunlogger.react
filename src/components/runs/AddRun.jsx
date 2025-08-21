// components/runs/AddRun.jsx - Cleaned up version without legacy support
import React, { useEffect, useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { useAddRunForm } from '../../hooks/useAddRunForm';
import { useToast } from '../../hooks/useToast';
import Timer from '../common/Timer';
import SessionSetup from '../session/SessionSetup';

// Import from AddRun subdirectory
import CursedPossessionSelector from './CursedPossessionSelector';
import EvidenceSelector from './EvidenceSelector';
import GhostSelector from './GhostSelector';
import PlayerStatus from './PlayerStatus';
import FloorRoomSelector from './FloorRoomSelector';

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

  const {
    // State
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
    
    // Setters
    setSelectedEvidenceIds,
    setIsSaving,
    
    // Handlers
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
    
    // Data transformation
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

  // Get available rooms from the session map
  const availableRooms = useMemo(() => {
    if (!sessionData?.map?.rooms) return [];
    
    // Current format: rooms with IDs and names
    return sessionData.map.rooms
      .filter(room => room.name && room.name.trim())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sessionData?.map]);

  // Get the maximum evidence allowed by the session game mode
  const maxEvidence = sessionData?.gameMode?.maxEvidence ?? 3;

  // Clear evidence when game mode changes and new limit is lower
  useEffect(() => {
    if (selectedEvidenceIds.length > maxEvidence) {
      setSelectedEvidenceIds(prev => prev.slice(0, maxEvidence));
    }
  }, [maxEvidence, selectedEvidenceIds.length, setSelectedEvidenceIds]);

  const handleStartSession = (newSessionData) => {
    setSessionData(newSessionData);
    setSessionStartTime(Date.now());
    setCurrentRunTime(0);
    // Reset form when starting new session
    resetForm();
  };

  const handleEndSession = () => {
    setSessionData(null);
    setSessionStartTime(null);
    setCurrentRunTime(0);
  };

  const handleEndRun = () => {
    // Keep session data but clear the map to go back to session setup
    setSessionData(prev => ({
      ...prev,
      map: null
    }));
    setSessionStartTime(null);
    setCurrentRunTime(0);
    resetForm();
  };

  const handleTimerUpdate = (timeInSeconds) => {
    setCurrentRunTime(timeInSeconds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!sessionData) {
      warning('No active session found');
      return;
    }

    setIsSaving(true);

    try {
      const selectedCursedPossessionObj = selectedCursedPossession ?
        availableCursedPossessions.find(p => p.id === selectedCursedPossession) : null;

      // Create normalized run data with session information
      const baseRunData = createRunData(allPlayers, sessionData, sessionData.gameMode, selectedCursedPossessionObj);
      
      // Override with session data
      const runData = {
        ...baseRunData,
        players: sessionData.players.map(playerName => {
          const player = allPlayers.find(p => p.name === playerName);
          return {
            id: player?.id || null,
            name: playerName,
            status: playerStates[playerName] || 'alive'
          };
        }),
        runTimeSeconds: currentRunTime // Add run time to the data
      };

      const newRun = await createRun(runData);
      
      // End the current run and go back to session setup
      handleEndRun();

      success(`Run saved successfully! Run #${newRun.runNumber} for ${sessionData.players.length} player${sessionData.players.length > 1 ? 's' : ''} today. Time: ${formatTime(currentRunTime)}`);

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

  const canSubmit = sessionData;

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

  // Show session setup if no session is active OR no map is selected
  if (!sessionData || !sessionData.map) {
    return <SessionSetup onStartSession={handleStartSession} initialData={sessionData} />;
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow p-6">
      {/* Session Header */}
      <div className="mb-6 pb-4 border-b border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              🎮 {sessionData.map.name} - {sessionData.gameMode.name}
            </h2>
            <p className="text-gray-400">
              Players: {sessionData.players.join(', ')} • Max {maxEvidence} evidence
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Floor and Room Selection, Perfect Game, and Timer Row */}
        <div className="flex items-end gap-6">
          {/* Floor and Room Selection - Takes remaining space */}
          <div className="flex-1">
            <FloorRoomSelector
              selectedMap={sessionData.map}
              selectedFloor={selectedFloor}
              onFloorChange={handleFloorChange}
              selectedRoom={selectedRoom}
              onRoomChange={handleRoomChange}
            />
          </div>

          {/* Perfect Game Toggle - Fixed width */}
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

          {/* Timer Display - Fixed width */}
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timer
            </label>
            <div className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 h-[42px] flex items-center justify-center">
              <div className="text-lg font-mono font-bold text-green-400">
                {formatTime(currentRunTime)}
              </div>
            </div>
          </div>
        </div>
        
        <div className='flex flex-column justify-between gap-10'>
          <CursedPossessionSelector
            cursedPossessions={availableCursedPossessions}
            selectedCursedPossession={selectedCursedPossession}
            onCursedPossessionChange={handleCursedPossessionChange}
          />
          <EvidenceSelector
            evidence={availableEvidence}
            selectedEvidenceIds={selectedEvidenceIds}
            excludedEvidenceIds={excludedEvidenceIds}
            maxEvidence={maxEvidence}
            onEvidenceToggle={handleEvidenceToggle}
            onEvidenceExclude={handleEvidenceExclude}
            ghosts={ghosts}
          />
        </div>
        
        <GhostSelector
          ghosts={ghosts}
          evidence={evidence}
          selectedEvidenceIds={selectedEvidenceIds}
          excludedEvidenceIds={excludedEvidenceIds}
          selectedGhost={selectedGhost}
          actualGhost={actualGhost}
          excludedGhosts={excludedGhosts}
          onGhostSelect={handleGhostSelect}
          onActualGhostSelect={handleActualGhostSelect}
          onGhostExclude={handleGhostExclude}
        />
        
        <PlayerStatus
          todaysPlayers={sessionData.players}
          playerStates={playerStates}
          onPlayerStatusToggle={handlePlayerStatusToggle}
          onChangePlayersClick={() => {}} // Disabled during session
        />

        <div className="pt-4 border-t border-gray-600">
          <button
            type="submit"
            disabled={!canSubmit || isSaving}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSaving ? 'Saving Run...' : `Save Run (${formatTime(currentRunTime)})`}
          </button>

          {!canSubmit && (
            <p className="mt-2 text-sm text-gray-400 text-center">
              No active session found
            </p>
          )}
        </div>
      </form>

      {/* Hidden Timer Component for Auto-Running */}
      {sessionStartTime && (
        <Timer
          onTimeUpdate={handleTimerUpdate}
          autoStart={true}
          className="hidden"
        />
      )}
    </div>
  );
};

export default AddRun;