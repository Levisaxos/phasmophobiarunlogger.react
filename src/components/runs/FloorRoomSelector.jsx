// components/runs/FloorRoomSelector.jsx - Fixed auto-selection and room dropdown updates
import React, { useEffect, useCallback, useMemo } from 'react';

const FloorRoomSelector = ({
  selectedMap,
  selectedFloor,
  onFloorChange = () => {}, // Default empty function
  selectedRoom,
  onRoomChange = () => {} // Default empty function
}) => {
  // Get available floors from the map
  const availableFloors = useMemo(() => selectedMap?.floors || [], [selectedMap?.floors]);
  
  // Get available rooms from the selected floor, sorted by name
  const availableRooms = useMemo(() => {
    if (!selectedFloor?.rooms) return [];
    
    return [...selectedFloor.rooms].sort((a, b) => {
      const nameA = typeof a === 'string' ? a : a.name;
      const nameB = typeof b === 'string' ? b : b.name;
      return nameA.localeCompare(nameB);
    });
  }, [selectedFloor?.rooms]);

  // Use useCallback to create stable handlers
  const handleFloorChange = useCallback((e) => {
    const floorId = e.target.value;
    if (floorId === '') {
      onFloorChange(null);
    } else {
      const floor = availableFloors.find(f => f.id === parseInt(floorId));
      onFloorChange(floor || null);
    }
  }, [availableFloors, onFloorChange]);

  const handleRoomChange = useCallback((e) => {
    const roomId = e.target.value;
    if (roomId === '') {
      onRoomChange(null);
    } else {
      const room = availableRooms.find(r => r.id === parseInt(roomId));
      onRoomChange(room || null);
    }
  }, [availableRooms, onRoomChange]);

  // Auto-select floor if there's only one available
  useEffect(() => {
    if (availableFloors.length === 1 && !selectedFloor) {
      onFloorChange(availableFloors[0]);
    }
  }, [availableFloors, selectedFloor, onFloorChange]);

  // Auto-select room if there's only one available on the selected floor
  // Use a separate useEffect with selectedFloor as dependency to ensure it runs after floor selection
  useEffect(() => {
    if (selectedFloor && availableRooms.length === 1 && !selectedRoom) {
      onRoomChange(availableRooms[0]);
    }
  }, [selectedFloor, availableRooms, selectedRoom, onRoomChange]);

  if (!selectedMap) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Floor & Room
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No map selected. Please select a map first.
          </p>
        </div>
      </div>
    );
  }

  if (availableFloors.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Floor & Room
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No floors configured for this map. Please edit the map to add floors and rooms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-4">
      {/* Floor Selection */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Floor
          {availableFloors.length === 1 && (
            <span className="ml-2 text-xs text-green-400">(auto-selected)</span>
          )}
        </label>
        <select
          value={selectedFloor?.id || ''}
          onChange={handleFloorChange}
          disabled={availableFloors.length === 1}
          className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedFloor && availableFloors.length > 1 && (
            <option value="">Choose a floor...</option>
          )}
          {availableFloors
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((floor) => {
              const roomCount = floor.rooms ? floor.rooms.length : 0;
              return (
                <option key={floor.id} value={floor.id}>
                  {floor.name} ({roomCount} rooms)
                </option>
              );
            })}
        </select>
      </div>

      {/* Room Selection */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Room
          {availableRooms.length === 1 && selectedFloor && (
            <span className="ml-2 text-xs text-green-400">(auto-selected)</span>
          )}
        </label>
        <select
          disabled={!selectedFloor || availableRooms.length === 1}
          value={selectedRoom?.id || ''}
          onChange={handleRoomChange}
          className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedRoom && availableRooms.length > 1 && (
            <option value="">
              {selectedFloor ? "Choose a room (optional)..." : "Select a floor first"}
            </option>
          )}
          {availableRooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FloorRoomSelector;