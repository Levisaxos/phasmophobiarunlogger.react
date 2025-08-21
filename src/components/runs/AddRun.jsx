// src/components/runs/AddRun.jsx - Updated with auto-start timer and simplified controls
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
    selectedRoom,
    selectedCursedPossession,
    selectedEvidenceIds,
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
    handleRoomChange,
    handleCursedPossessionChange,
    handleEvidenceToggle,
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
    if (!sessionData?.map) return [];
    
    const map = sessionData.map;
    if (map.rooms && Array.isArray(map.rooms) && map.rooms.length > 0 && typeof map.rooms[0] === 'object') {
      // New format: rooms with IDs
      return map.rooms
        .filter(room => room.name && room.name.trim())
        .sort((a, b) => a.name.localeCompare(b.name));
    } else if (map.rooms && Array.isArray(map.rooms)) {
      // Legacy format: array of strings
      return map.rooms
        .filter(room => room && room.trim())
        .sort((a, b) => a.localeCompare(b))
        .map((roomName, index) => ({ id: index + 1, name: roomName }));
    }
    return [];
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

  const handleTimerUpdate = (timeInSeconds) => {
    setCurrentRunTime(timeInSeconds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoom || !selectedGhost || !sessionData) {
      warning('Please fill in all required fields');
      return;
    }

    setIsSaving(true);

    try {
      const selectedCursedPossessionObj = selectedCursedPossession ?
        availableCursedPossessions.find(p => p.id === selectedCursedPossession) : null;

      // Create normalized run data with session information
      const baseRunData = createRunData(allPlayers, sessionData.gameMode, selectedCursedPossessionObj);
      
      // Override with session data
      const runData = {
        ...baseRunData,
        mapId: sessionData.map.id,
        roomName: selectedRoom,
        // Find room ID from selected map
        roomId: (() => {
          const room = availableRooms.find(r => r.name === selectedRoom);
          return room?.id || null;
        })(),
        gameModeId: sessionData.gameMode.id,
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
      
      // Reset form but keep session active
      resetForm();
      // Reset timer for next run
      setSessionStartTime(Date.now());
      setCurrentRunTime(0);

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

  const canSubmit = selectedRoom && selectedGhost && sessionData;

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

  // Show session setup if no session is active
  if (!sessionData) {
    return <SessionSetup onStartSession={handleStartSession} />;
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
        {/* Room Selection, Perfect Game, and Timer Row */}
        <div className="flex items-end gap-6">
          {/* Room Selection - Takes remaining space */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Room *
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {!selectedRoom && (<option value="">Choose a room...</option>)}
              {availableRooms.map((room) => (
                <option key={room.id || room.name} value={room.name}>
                  {room.name}
                </option>
              ))}
            </select>
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
            maxEvidence={maxEvidence}
            onEvidenceToggle={handleEvidenceToggle}
          />
        </div>
        
        <GhostSelector
          ghosts={ghosts}
          evidence={evidence}
          selectedEvidenceIds={selectedEvidenceIds}
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
              Please fill in all required fields to save the run
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