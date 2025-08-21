// utils/formatUtils.js - Updated to work with floors structure only

/**
 * Get room name from run data using floors structure
 * @param {Object} run - Run object
 * @param {Object} map - Map object
 * @returns {string} Room name
 */
export const getRoomName = (run, map) => {
  if (run.roomId && run.floorId && map?.floors) {
    // Search the specific floor first (more efficient)
    const floor = map.floors.find(f => f.id === run.floorId);
    if (floor?.rooms && Array.isArray(floor.rooms)) {
      const room = floor.rooms.find(r => r.id === run.roomId);
      if (room) {
        return room.name;
      }
    }
  } else if (run.roomId && map?.floors) {
    // Fallback: Search through all floors to find the room by ID
    for (const floor of map.floors) {
      if (floor.rooms && Array.isArray(floor.rooms)) {
        const room = floor.rooms.find(r => r.id === run.roomId);
        if (room) {
          return room.name;
        }
      }
    }
  }
  return 'Unknown Room';
};

/**
 * Format players with status for display
 * @param {Object} run - Run object
 * @returns {Object} Formatted players data
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
 * Get available rooms from map using floors structure
 * @param {Object} selectedMap - Map object
 * @returns {Array} Array of room objects with id and name
 */
export const getAvailableRooms = (selectedMap) => {
  if (!selectedMap || !selectedMap.floors || !Array.isArray(selectedMap.floors)) {
    return [];
  }
  
  // Collect all rooms from all floors
  const allRooms = [];
  selectedMap.floors.forEach(floor => {
    if (floor.rooms && Array.isArray(floor.rooms)) {
      floor.rooms.forEach(room => {
        if (room.name && room.name.trim()) {
          allRooms.push({
            id: room.id,
            name: room.name,
            floorId: floor.id,
            floorName: floor.name
          });
        }
      });
    }
  });
  
  return allRooms.sort((a, b) => a.name.localeCompare(b.name));
};