// components/runs/FloorRoomSelector.jsx - Floor and room selection for runs
import React from 'react';

const FloorRoomSelector = ({
  selectedMap,
  selectedFloor,
  onFloorChange = () => {}, // Default empty function
  selectedRoom,
  onRoomChange = () => {} // Default empty function
}) => {
  // Get available floors from the map
  const availableFloors = selectedMap?.floors || [];
  
  // Get available rooms from the selected floor
  const availableRooms = selectedFloor?.rooms || [];

  const handleFloorChange = (e) => {
    const floorId = e.target.value;
    if (floorId === '') {
      onFloorChange(null);
    } else {
      const floor = availableFloors.find(f => f.id === parseInt(floorId));
      onFloorChange(floor || null);
    }
  };

  const handleRoomChange = (e) => {
    const roomId = e.target.value;
    if (roomId === '') {
      onRoomChange(null);
    } else {
      const room = availableRooms.find(r => r.id === parseInt(roomId));
      onRoomChange(room || null);
    }
  };

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
        </label>
        <select
          value={selectedFloor?.id || ''}
          onChange={handleFloorChange}
          className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {!selectedFloor && (<option value="">Choose a floor...</option>)}
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
        </label>
        <select
          disabled={!selectedFloor}
          value={selectedRoom?.id || ''}
          onChange={handleRoomChange}
          className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!selectedRoom && (
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