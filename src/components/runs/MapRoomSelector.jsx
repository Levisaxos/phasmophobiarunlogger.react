// components/AddRun/MapRoomSelector.jsx - Updated with floor support and floor dropdown
import React from 'react';
import { mapsService } from '../../services/api/mapsService';

const MapRoomSelector = ({
  maps,
  selectedMap,
  onMapChange,
  selectedFloor,
  onFloorChange,
  selectedRoom,
  onRoomChange
}) => {
  // Get available rooms with floor information, handling both new and legacy formats
  const roomsWithFloors = selectedMap ? mapsService.getAllRoomsFromMap(selectedMap) : [];
  
  // Group rooms by floor and sort by floor order
  const roomsByFloor = roomsWithFloors.reduce((acc, roomData) => {
    const floorName = roomData.floorName;
    if (!acc[floorName]) {
      acc[floorName] = {
        order: roomData.floorOrder,
        rooms: []
      };
    }
    acc[floorName].rooms.push(roomData.name);
    return acc;
  }, {});

  // Sort floors by order and rooms alphabetically within each floor
  const sortedFloors = Object.entries(roomsByFloor)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([floorName, floorData]) => ({
      name: floorName,
      order: floorData.order,
      rooms: floorData.rooms.sort((a, b) => a.localeCompare(b))
    }));

  // Get rooms for the selected floor
  const selectedFloorRooms = selectedFloor ? 
    sortedFloors.find(floor => floor.name === selectedFloor)?.rooms || [] : [];
  
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
      <div className="flex items-center justify-between mb-2 gap-4">
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
              // Reset floor and room when map changes
              onFloorChange('');
              onRoomChange('');
            }}
            className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

        {/* Floor Selection */}
        <div className='flex-1'>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Floor
          </label>
          <select
            disabled={!selectedMap}
            value={selectedFloor}
            onChange={(e) => {
              onFloorChange(e.target.value);
              // Reset room when floor changes
              onRoomChange('');
            }}
            className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">{selectedMap ? "Choose a floor (optional)..." : "Select a map first"}</option>
            {sortedFloors.map((floor) => (
              <option key={floor.name} value={floor.name}>
                {floor.name} ({floor.rooms.length} rooms)
              </option>
            ))}
          </select>
        </div>

        {/* Room Selection */}
        <div className='flex-1'>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Room
          </label>
          <select
            disabled={!selectedMap}
            value={selectedRoom}
            onChange={(e) => onRoomChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!selectedMap ? "Select a map first" : 
               !selectedFloor ? "All rooms (optional)..." : 
               selectedFloorRooms.length === 0 ? "No rooms on this floor" :
               "Choose a room (optional)..."}
            </option>
            {selectedFloor ? (
              // Show only rooms from selected floor
              selectedFloorRooms.map((roomName) => (
                <option key={roomName} value={roomName}>
                  {roomName}
                </option>
              ))
            ) : (
              // Show all rooms grouped by floor
              sortedFloors.map((floor) => (
                <optgroup key={floor.name} label={floor.name}>
                  {floor.rooms.map((roomName) => (
                    <option key={`${floor.name}-${roomName}`} value={roomName}>
                      {roomName}
                    </option>
                  ))}
                </optgroup>
              ))
            )}
          </select>
        </div>
      </div>
    </>
  );
};

export default MapRoomSelector;