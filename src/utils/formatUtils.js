// utils/formatUtils.js

/**
 * Get room name from run data, handling both legacy and new formats
 * @param {Object} run - Run object
 * @param {Object} map - Map object
 * @returns {string} Room name
 */
export const getRoomName = (run, map) => {
  if (run.roomName) {
    return run.roomName;
  } else if (run.roomId && map?.rooms) {
    if (typeof map.rooms[0] === 'object') {
      // New format: rooms with IDs
      const room = map.rooms.find(r => r.id === run.roomId);
      return room?.name || 'Unknown Room';
    }
  }
  return 'Unknown Room';
};

/**
 * Format players with status for display
 * @param {Object} run - Run object
 * @returns {JSX.Element} Formatted players component
 */
export const formatPlayersWithStatus = (run) => {
  // Handle both new and legacy player data formats
  let playersData = [];
  
  if (run.players && Array.isArray(run.players) && typeof run.players[0] === 'object') {
    // New format: players is array of objects with id, name, status
    playersData = run.players;
  } else if (run.players && Array.isArray(run.players)) {
    // Legacy format: players is array of names, use playerStates for status
    const playerStates = run.playerStates || {};
    playersData = run.players.map(playerName => ({
      name: playerName,
      status: playerStates[playerName] || 'alive'
    }));
  } else if (run.playersLegacy) {
    // Fallback to legacy players field
    const playerStates = run.playerStates || {};
    playersData = run.playersLegacy.map(playerName => ({
      name: playerName,
      status: playerStates[playerName] || 'alive'
    }));
  }

  if (playersData.length === 0) {
    return { count: 0, elements: null };
  }
  
  return {
    count: playersData.length,
    playersData
  };
};

/**
 * Get evidence names from evidence IDs
 * @param {Array} evidenceIds - Array of evidence IDs
 * @param {Array} evidence - Array of evidence objects
 * @returns {Array} Array of evidence names
 */
export const getEvidenceNames = (evidenceIds, evidence) => {
  return (evidenceIds || [])
    .map(id => evidence.find(e => e.id === id)?.name)
    .filter(name => name);
};

/**
 * Get available rooms from map, handling both legacy and new formats
 * @param {Object} selectedMap - Map object
 * @returns {Array} Array of room objects with id and name
 */
export const getAvailableRooms = (selectedMap) => {
  if (!selectedMap) return [];
  
  if (selectedMap.rooms && Array.isArray(selectedMap.rooms) && selectedMap.rooms.length > 0 && typeof selectedMap.rooms[0] === 'object') {
    // New format: rooms with IDs
    return selectedMap.rooms
      .filter(room => room.name && room.name.trim())
      .sort((a, b) => a.name.localeCompare(b.name));
  } else if (selectedMap.rooms && Array.isArray(selectedMap.rooms)) {
    // Legacy format: array of strings
    return selectedMap.rooms
      .filter(room => room && room.trim())
      .sort((a, b) => a.localeCompare(b))
      .map((roomName, index) => ({ id: index + 1, name: roomName }));
  } else if (selectedMap.roomsLegacy && Array.isArray(selectedMap.roomsLegacy)) {
    // Fallback to legacy rooms
    return selectedMap.roomsLegacy
      .filter(room => room && room.trim())
      .sort((a, b) => a.localeCompare(b))
      .map((roomName, index) => ({ id: index + 1, name: roomName }));
  }
  return [];
};