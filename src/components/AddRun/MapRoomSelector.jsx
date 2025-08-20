// components/AddRun/MapRoomSelector.jsx
import React from 'react';

const MapRoomSelector = ({
  maps,
  selectedMap,
  onMapChange,
  selectedRoom,
  onRoomChange
}) => {
  // Get available rooms, handling both new and legacy formats
  const availableRooms = selectedMap ? (() => {
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
  })() : [];
  
  const activeMaps = maps.filter(map => !map.isArchived);

  if (activeMaps.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Map *
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No maps configured. Please go to Manage → Maps to add maps first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Map Selection */}
      <div className="flex items-center justify-between mb-2 gap-10">
        <div className='flex-1'>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Map *
          </label>
          <select
            value={selectedMap?.id || ''}
            onChange={(e) => {
              const mapId = parseInt(e.target.value);
              const map = activeMaps.find(m => m.id === mapId);
              onMapChange(map || null);
            }}
            className="flex-fill w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            {!selectedMap && (<option value="">Choose a map...</option>)}
            {activeMaps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name} ({map.size})
              </option>
            ))}
          </select>
        </div>

        {/* Room Selection */}
        <div className='flex-1'>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Room *
          </label>
          <select
            disabled={selectedMap == null}
            value={selectedRoom}
            onChange={(e) => onRoomChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            required
          >
            {!selectedRoom && (<option value="">{selectedMap ? "Choose a room..." : "Select a map first"}</option>)}
            {availableRooms.map((room) => (
              <option key={room.id || room.name} value={room.name}>
                {room.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default MapRoomSelector;