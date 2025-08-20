// components/runs/AddRun.jsx - Fixed import paths and structure
import React, { useEffect, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { useAddRunForm } from '../../hooks/useAddRunForm';
import { useToast } from '../../hooks/useToast';
import { TodaysPlayersModal } from '../modals';

// Import from AddRun subdirectory
import MapRoomSelector from './MapRoomSelector';
import CursedPossessionSelector from './CursedPossessionSelector';
import EvidenceSelector from './EvidenceSelector';
import GhostSelector from './GhostSelector';
import PlayerStatus from './PlayerStatus';
import DifficultyGameSelector from './DifficultyGameSelector';

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

  const {
    // State
    todaysPlayers,
    showPlayersModal,
    selectedMap,
    selectedRoom,
    selectedCursedPossession,
    selectedEvidenceIds,
    selectedGhost,
    actualGhost,
    excludedGhosts,
    playerStates,
    selectedGameMode,
    isPerfectGame,
    isSaving,
    
    // Setters
    setShowPlayersModal,
    setSelectedEvidenceIds,
    setIsSaving,
    
    // Handlers
    handleTodaysPlayersConfirm,
    handleChangePlayersClick,
    handleMapChange,
    handleRoomChange,
    handleCursedPossessionChange,
    handleEvidenceToggle,
    handleGhostSelect,
    handleActualGhostSelect,
    handleGhostExclude,
    handlePlayerStatusToggle,
    handleGameModeChange,
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

  // Get the maximum evidence allowed by the selected game mode
  const selectedGameModeObj = selectedGameMode ? gameModes.find(gm => gm.id === selectedGameMode) : null;
  const maxEvidence = selectedGameModeObj?.maxEvidence ?? 3;

  // Show players modal on component mount if no today's players are set
  useEffect(() => {
    if (!loading && allPlayers.length > 0 && todaysPlayers.length === 0) {
      setShowPlayersModal(true);
    }
  }, [loading, allPlayers, todaysPlayers, setShowPlayersModal]);

  // Clear evidence when game mode changes and new limit is lower
  useEffect(() => {
    if (selectedEvidenceIds.length > maxEvidence) {
      setSelectedEvidenceIds(prev => prev.slice(0, maxEvidence));
    }
  }, [maxEvidence, selectedEvidenceIds.length, setSelectedEvidenceIds]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedMap || !selectedRoom || !selectedGhost) {
      warning('Please fill in all required fields');
      return;
    }

    if (todaysPlayers.length === 0) {
      warning('Please set up today\'s players first');
      return;
    }

    setIsSaving(true);

    try {
      const selectedCursedPossessionObj = selectedCursedPossession ?
        availableCursedPossessions.find(p => p.id === selectedCursedPossession) : null;

      // Create normalized run data
      const runData = createRunData(allPlayers, selectedGameModeObj, selectedCursedPossessionObj);

      const newRun = await createRun(runData);
      resetForm();

      success(`Run saved successfully! Run #${newRun.runNumber} for ${todaysPlayers.length} player${todaysPlayers.length > 1 ? 's' : ''} today.`);

    } catch (err) {
      console.error('Error saving run:', err);
      showError('Failed to save run: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const canSubmit = selectedMap && selectedRoom && todaysPlayers.length > 0;

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

  return (
    <>
      <div className="bg-gray-700 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <MapRoomSelector
            maps={maps}
            selectedMap={selectedMap}
            onMapChange={handleMapChange}
            selectedRoom={selectedRoom}
            onRoomChange={handleRoomChange}
          />
          
          <DifficultyGameSelector
            gameModes={gameModes}
            selectedGameMode={selectedGameMode}
            onGameModeChange={handleGameModeChange}
            isPerfectGame={isPerfectGame}
            onPerfectGameToggle={handlePerfectGameToggle}
          />
          
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
            todaysPlayers={todaysPlayers}
            playerStates={playerStates}
            onPlayerStatusToggle={handlePlayerStatusToggle}
            onChangePlayersClick={handleChangePlayersClick}
          />

          <div className="pt-4 border-t border-gray-600">
            <button
              type="submit"
              disabled={!canSubmit || isSaving}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isSaving ? 'Saving Run...' : 'Save Run'}
            </button>

            {!canSubmit && (
              <p className="mt-2 text-sm text-gray-400 text-center">
                Please fill in all required fields to save the run
              </p>
            )}
          </div>
        </form>
      </div>

      <TodaysPlayersModal
        isOpen={showPlayersModal}
        onClose={() => setShowPlayersModal(false)}
        onConfirm={handleTodaysPlayersConfirm}
        allPlayers={allPlayers}
        currentTodaysPlayers={todaysPlayers}
      />
    </>
  );
};

export default AddRun;