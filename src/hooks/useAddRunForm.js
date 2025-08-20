// hooks/useAddRunForm.js
import { useState, useEffect } from 'react';

export const useAddRunForm = () => {
  // Today's players session state
  const [todaysPlayers, setTodaysPlayers] = useState([]);
  const [showPlayersModal, setShowPlayersModal] = useState(false);

  // Form state
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedCursedPossession, setSelectedCursedPossession] = useState('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState([]);
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

  // Reset room when map changes
  useEffect(() => {
    setSelectedRoom('');
  }, [selectedMap]);

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
    setSelectedRoom('');
    setSelectedCursedPossession('');
    setSelectedEvidenceIds([]);
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
  const createRunData = (allPlayers, selectedGameModeObj, selectedCursedPossessionObj) => {
    const finalActualGhost = actualGhost || selectedGhost;
    
    // Convert player names to player data with status
    const playersData = todaysPlayers.map(playerName => {
      const player = allPlayers.find(p => p.name === playerName);
      return {
        id: player?.id || null,
        name: playerName, // Keep name for backward compatibility during transition
        status: playerStates[playerName] || 'alive'
      };
    });

    // Find room ID from selected map
    let roomId = null;
    if (selectedMap && selectedRoom) {
      // Handle both new room format (with IDs) and legacy format (array of strings)
      if (selectedMap.rooms && Array.isArray(selectedMap.rooms) && typeof selectedMap.rooms[0] === 'object') {
        // New format: rooms with IDs
        const room = selectedMap.rooms.find(r => r.name === selectedRoom);
        roomId = room?.id || null;
      } else if (selectedMap.rooms && Array.isArray(selectedMap.rooms)) {
        // Legacy format: find index + 1 as ID
        const roomIndex = selectedMap.rooms.indexOf(selectedRoom);
        roomId = roomIndex >= 0 ? roomIndex + 1 : null;
      }
    }

    return {
      // Core identifiers (IDs only)
      mapId: selectedMap.id,
      roomId: roomId,
      roomName: selectedRoom, // Keep name for backward compatibility during transition
      cursedPossessionId: selectedCursedPossession || null,
      evidenceIds: [...selectedEvidenceIds],
      ghostId: selectedGhost.id,
      actualGhostId: finalActualGhost.id,
      gameModeId: selectedGameModeObj?.id || null,
      
      // Player data with embedded status
      players: playersData,
      
      // Game outcome
      wasCorrect: selectedGhost.id === finalActualGhost.id,
      isPerfectGame: isPerfectGame,
      
      // Timestamp (date will be derived from this)
      timestamp: new Date().toISOString()
    };
  };

  return {
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
    setTodaysPlayers,
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
  };
};