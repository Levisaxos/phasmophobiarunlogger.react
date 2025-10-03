// hooks/useAddRunForm.js - Updated with improved auto-selection handling and challenge mode support
import { useState, useEffect } from 'react';

export const useAddRunForm = () => {
  // Today's players session state
  const [todaysPlayers, setTodaysPlayers] = useState([]);
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  // Form state
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedCursedPossession, setSelectedCursedPossession] = useState('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState([]);
  const [excludedEvidenceIds, setExcludedEvidenceIds] = useState([]);
  const [selectedGhost, setSelectedGhost] = useState(null);
  const [actualGhost, setActualGhost] = useState(null);
  const [excludedGhosts, setExcludedGhosts] = useState([]);
  const [playerStates, setPlayerStates] = useState({});
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [isPerfectGame, setIsPerfectGame] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize player states when today's players change
  useEffect(() => {
    const newPlayerStates = {};
    todaysPlayers.forEach(player => {
      newPlayerStates[player] = 'alive';
    });
    setPlayerStates(newPlayerStates);
  }, [todaysPlayers]);

  // Reset floor and room when map changes
  useEffect(() => {
    setSelectedFloor(null);
    setSelectedRoom(null);
  }, [selectedMap]);

  // Reset room when floor changes (but allow auto-selection to work)
  useEffect(() => {
    // Only reset if we're changing to a different floor, not on initial auto-selection
    if (selectedFloor) {
      setSelectedRoom(null);
    }
  }, [selectedFloor?.id]); // Use selectedFloor?.id to avoid resetting on auto-selection

  // Event handlers
  const handleTodaysPlayersConfirm = (players) => {
    setTodaysPlayers(players);
    setShowPlayersModal(false);
  };

  const handleChangePlayersClick = () => {
    setShowPlayersModal(true);
  };

  const handleMapChange = (map) => {
    setSelectedMap(map);
  };

  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
  };

  const handleRoomChange = (room) => {
    setSelectedRoom(room);
  };

  const handleCursedPossessionChange = (possessionId) => {
    setSelectedCursedPossession(possessionId);
  };

  const handleEvidenceToggle = (evidenceId, isAdding) => {
    if (isAdding) {
      setSelectedEvidenceIds(prev => [...prev, evidenceId]);
    } else {
      setSelectedEvidenceIds(prev => prev.filter(id => id !== evidenceId));
    }
  };

  const handleEvidenceExclude = (evidenceId, isExcluding) => {
    if (isExcluding) {
      setExcludedEvidenceIds(prev => [...prev, evidenceId]);
    } else {
      setExcludedEvidenceIds(prev => prev.filter(id => id !== evidenceId));
    }
  };

  const handleGhostSelect = (ghost) => {
    setSelectedGhost(ghost);
  };

  const handleActualGhostSelect = (ghost) => {
    setActualGhost(ghost);
  };

  const handleGhostExclude = (ghostId, isExcluding) => {
    if (isExcluding) {
      setExcludedGhosts(prev => [...prev, ghostId]);
    } else {
      setExcludedGhosts(prev => prev.filter(id => id !== ghostId));
    }
  };

  const handlePlayerStatusToggle = (player, newStatus) => {
    setPlayerStates(prev => ({
      ...prev,
      [player]: newStatus
    }));
  };

  const handleGameModeChange = (gameModeId) => {
    setSelectedGameMode(gameModeId);
  };

  const handlePerfectGameToggle = (value) => {
    setIsPerfectGame(value);
  };

  const resetForm = () => {
    setSelectedMap(null);
    setSelectedFloor(null);
    setSelectedRoom(null);
    setSelectedCursedPossession('');
    setSelectedEvidenceIds([]);
    setExcludedEvidenceIds([]);
    setSelectedGhost(null);
    setActualGhost(null);
    setExcludedGhosts([]);
    setSelectedGameMode(null);
    setIsPerfectGame(false);

    // Reset player states to all alive
    const resetPlayerStates = {};
    todaysPlayers.forEach(player => {
      resetPlayerStates[player] = 'alive';
    });
    setPlayerStates(resetPlayerStates);
  };

  // Create normalized run data for saving
  const createRunData = ({
    sessionData,
    map,
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
  }) => {
    const finalActualGhost = actualGhost || selectedGhost;
    
    // Convert player names to player data with status
    const playersData = sessionData.players.map(playerName => {
      return {
        id: null, // We don't have player IDs in this structure
        name: playerName,
        status: playerStates[playerName] || 'alive'
      };
    });

    return {
      // Core identifiers (IDs only) - use session data and map parameter
      mapId: map?.id || null,
      floorId: selectedFloor?.id || null,
      roomId: selectedRoom?.id || null,
      roomName: selectedRoom?.name || null,
      cursedPossessionId: selectedCursedPossessionObj?.id || null,
      evidenceIds: [...selectedEvidenceIds],
      ghostId: selectedGhost?.id || null,
      actualGhostId: finalActualGhost?.id || null,
      gameModeId: sessionData?.gameMode?.id || null,
      challengeModeId: sessionData?.challengeMode?.id || null, // Add challenge mode ID if present
      
      // Player data with embedded status
      players: playersData,
      
      // Game outcome (only meaningful if both ghosts are selected)
      wasCorrect: selectedGhost && finalActualGhost ? selectedGhost.id === finalActualGhost.id : null,
      isPerfectGame: isPerfectGame,
      
      // Timer data
      runTimeSeconds: currentRunTime || null,
      
      // Timestamp (date will be derived from this)
      timestamp: new Date().toISOString()
    };
  };

  return {
    // State
    todaysPlayers,
    showPlayersModal,
    selectedMap,
    selectedFloor,
    selectedRoom,
    selectedCursedPossession,
    selectedEvidenceIds,
    excludedEvidenceIds,
    selectedGhost,
    actualGhost,
    excludedGhosts,
    playerStates,
    selectedGameMode,
    isPerfectGame,
    isSaving,
    
    // Setters
    setTodaysPlayers,
    setShowPlayersModal,
    setSelectedEvidenceIds,
    setIsSaving,
    
    // Handlers
    handleTodaysPlayersConfirm,
    handleChangePlayersClick,
    handleMapChange,
    handleFloorChange,
    handleRoomChange,
    handleCursedPossessionChange,
    handleEvidenceToggle,
    handleEvidenceExclude,
    handleGhostSelect,
    handleActualGhostSelect,
    handleGhostExclude,
    handlePlayerStatusToggle,
    handleGameModeChange,
    handlePerfectGameToggle,
    resetForm,
    
    // Data transformation
    createRunData
  };
};