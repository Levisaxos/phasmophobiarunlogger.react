import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { UI_CONSTANTS } from '../../constants';

const ManageMapsPage = () => {
  const { maps, loading, error, createMap, updateMap, deleteMap, toggleMapArchived } = useData();
  
  const [selectedMap, setSelectedMap] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMap, setEditingMap] = useState({
    name: '',
    size: 'medium',
    floors: [
      {
        id: 1,
        name: 'Ground Floor',
        order: 1,
        rooms: ['']
      }
    ]
  });

  const handleAddNew = () => {
    setEditingMap({
      name: '',
      size: 'medium',
      floors: [
        {
          id: 1,
          name: 'Ground Floor',
          order: 0, // Ground floor is order 0
          rooms: ['']
        }
      ]
    });
    setSelectedMap(null);
    setIsEditing(true);
  };

  const handleEditMap = (map) => {
    let floorsForEditing = [];
    
    if (map.floors && Array.isArray(map.floors) && map.floors.length > 0) {
      // New format: map already has floors
      floorsForEditing = map.floors.map(floor => ({
        ...floor,
        rooms: floor.rooms || ['']
      })).sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      // Legacy format: convert existing rooms to a single floor
      let roomsForEditing = [];
      if (map.rooms && Array.isArray(map.rooms) && map.rooms.length > 0 && typeof map.rooms[0] === 'object') {
        // New room format: extract names
        roomsForEditing = map.rooms.map(room => room.name).sort((a, b) => a.localeCompare(b));
      } else if (map.rooms && Array.isArray(map.rooms)) {
        // Legacy room format: array of strings
        roomsForEditing = [...map.rooms].sort((a, b) => a.localeCompare(b));
      } else if (map.roomsLegacy && Array.isArray(map.roomsLegacy)) {
        // Fallback to legacy rooms
        roomsForEditing = [...map.roomsLegacy].sort((a, b) => a.localeCompare(b));
      }
      
      if (roomsForEditing.length === 0) {
        roomsForEditing = [''];
      }
      
      floorsForEditing = [
        {
          id: 1,
          name: 'Ground Floor',
          order: 0, // Ground floor is order 0
          rooms: roomsForEditing
        }
      ];
    }
    
    setEditingMap({ ...map, floors: floorsForEditing });
    setSelectedMap(map);
    setIsEditing(true);
  };

  const handleSaveMap = async () => {
    try {
      // Clean up empty rooms before saving
      const cleanedFloors = editingMap.floors.map(floor => ({
        ...floor,
        rooms: floor.rooms.filter(room => room.trim())
      })).filter(floor => floor.rooms.length > 0 || floor.name.trim());

      const mapToSave = {
        ...editingMap,
        floors: cleanedFloors
      };

      if (selectedMap) {
        await updateMap(selectedMap.id, mapToSave);
      } else {
        await createMap(mapToSave);
      }
      setIsEditing(false);
      setSelectedMap(null);
    } catch (err) {
      console.error('Error saving map:', err);
      alert('Error saving map: ' + err.message);
    }
  };

  const handleDeleteMap = async () => {
    if (selectedMap && window.confirm(`Are you sure you want to delete "${selectedMap.name}"? This action cannot be undone and will also delete all associated runs.`)) {
      try {
        await deleteMap(selectedMap.id);
        setIsEditing(false);
        setSelectedMap(null);
        setEditingMap({
          name: '',
          size: 'medium',
          floors: [
            {
              id: 1,
              name: 'Ground Floor',
              order: 0, // Ground floor is order 0
              rooms: ['']
            }
          ]
        });
      } catch (err) {
        console.error('Error deleting map:', err);
        alert('Error deleting map: ' + err.message);
      }
    }
  };

  const handleToggleArchived = async (map) => {
    try {
      await toggleMapArchived(map.id);
    } catch (err) {
      console.error('Error toggling map archive status:', err);
      alert('Error updating map: ' + err.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedMap(null);
    setEditingMap({
      name: '',
      size: 'medium',
      floors: [
        {
          id: 1,
          name: 'Ground Floor',
          order: 0, // Ground floor is order 0
          rooms: ['']
        }
      ]
    });
  };

  // Floor management functions
  const addFloor = () => {
    // Calculate total rooms across all floors
    const totalRooms = editingMap.floors.reduce((total, floor) => {
      return total + (floor.rooms ? floor.rooms.length : 0);
    }, 0);
    
    // Only allow adding floor if we haven't reached the room limit
    if (totalRooms < UI_CONSTANTS.MAX_ROOMS_PER_MAP) {
      const newFloorId = Math.max(...editingMap.floors.map(f => f.id || 0), 0) + 1;
      // Default to adding an upper floor (positive order)
      const maxOrder = Math.max(...editingMap.floors.map(f => f.order || 0), 0);
      const newOrder = maxOrder + 1;
      
      setEditingMap({
        ...editingMap,
        floors: [
          ...editingMap.floors,
          {
            id: newFloorId,
            name: '',
            order: newOrder,
            rooms: ['']
          }
        ]
      });
    }
  };

  const removeFloor = (floorId) => {
    if (editingMap.floors.length > 1) {
      setEditingMap({
        ...editingMap,
        floors: editingMap.floors.filter(floor => floor.id !== floorId)
      });
    }
  };

  const updateFloor = (floorId, updates) => {
    setEditingMap({
      ...editingMap,
      floors: editingMap.floors.map(floor =>
        floor.id === floorId ? { ...floor, ...updates } : floor
      )
    });
  };

  const addRoom = (floorId) => {
    // Calculate total rooms across all floors
    const totalRooms = editingMap.floors.reduce((total, floor) => {
      return total + (floor.rooms ? floor.rooms.length : 0);
    }, 0);
    
    if (totalRooms < UI_CONSTANTS.MAX_ROOMS_PER_MAP) {
      const floor = editingMap.floors.find(f => f.id === floorId);
      if (floor) {
        updateFloor(floorId, {
          rooms: [...floor.rooms, '']
        });
      }
    }
  };

  const removeRoom = (floorId, roomIndex) => {
    const floor = editingMap.floors.find(f => f.id === floorId);
    if (floor && floor.rooms.length > 1) {
      updateFloor(floorId, {
        rooms: floor.rooms.filter((_, index) => index !== roomIndex)
      });
    }
  };

  const updateRoom = (floorId, roomIndex, value) => {
    const floor = editingMap.floors.find(f => f.id === floorId);
    if (floor) {
      const newRooms = [...floor.rooms];
      newRooms[roomIndex] = value;
      updateFloor(floorId, { rooms: newRooms });
    }
  };

  // Helper function to get total room count for display
  const getRoomCount = (map) => {
    if (map.floors && Array.isArray(map.floors)) {
      return map.floors.reduce((total, floor) => {
        return total + (floor.rooms ? floor.rooms.length : 0);
      }, 0);
    } else if (map.rooms && Array.isArray(map.rooms)) {
      return map.rooms.length;
    } else if (map.roomsLegacy && Array.isArray(map.roomsLegacy)) {
      return map.roomsLegacy.length;
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading maps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading maps: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Maps List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">Maps</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={handleAddNew}
                className="w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 border-2 border-dashed border-green-300"
              >
                + Add New Map
              </button>
              
              {/* Existing Maps */}
              {maps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => handleEditMap(map)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    selectedMap?.id === map.id && isEditing
                      ? 'bg-gray-500 text-gray-900'
                      : map.isArchived
                      ? 'text-gray-500 hover:bg-gray-800 border border-gray-600 opacity-60'
                      : 'text-gray-300 hover:bg-gray-800 border border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {map.name}
                        {map.isArchived && (
                          <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                            ARCHIVED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 capitalize">
                        {map.size} • {getRoomCount(map)} rooms
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Map Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">
            {isEditing ? (selectedMap ? 'Edit Map' : 'Add New Map') : 'Map Details'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Map Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Map Name
                  </label>
                  <input
                    type="text"
                    value={editingMap.name}
                    onChange={(e) => setEditingMap({ ...editingMap, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter map name"
                  />
                </div>

                {/* Map Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Map Size
                  </label>
                  <select
                    value={editingMap.size}
                    onChange={(e) => setEditingMap({ ...editingMap, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-500 text-gray-300 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Floors */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Floors ({editingMap.floors.length}) - Total Rooms: {editingMap.floors.reduce((total, floor) => total + (floor.rooms ? floor.rooms.length : 0), 0)}/{UI_CONSTANTS.MAX_ROOMS_PER_MAP}
                    </label>
                    <button
                      onClick={addFloor}
                      disabled={editingMap.floors.reduce((total, floor) => total + (floor.rooms ? floor.rooms.length : 0), 0) >= UI_CONSTANTS.MAX_ROOMS_PER_MAP}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      Add Floor
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingMap.floors
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((floor, floorIndex) => (
                      <div key={floor.id} className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1">
                            <input
                              type="text"
                              value={floor.name}
                              onChange={(e) => updateFloor(floor.id, { name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Floor ${floorIndex + 1} name`}
                            />
                          </div>
                          <div className="w-20">
                            <input
                              type="number"
                              value={floor.order}
                              onChange={(e) => updateFloor(floor.id, { order: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Order"
                              title="Floor order: 0 = Ground Floor, negative = basement levels, positive = upper floors"
                            />
                          </div>
                          {editingMap.floors.length > 1 && (
                            <button
                              onClick={() => removeFloor(floor.id)}
                              className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-md"
                            >
                              ×
                            </button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-400">
                              Rooms ({floor.rooms.length})
                            </label>
                            <button
                              onClick={() => addRoom(floor.id)}
                              disabled={editingMap.floors.reduce((total, f) => total + (f.rooms ? f.rooms.length : 0), 0) >= UI_CONSTANTS.MAX_ROOMS_PER_MAP}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                              Add Room
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {floor.rooms.map((room, roomIndex) => (
                              <div key={roomIndex} className="flex gap-2">
                                <input
                                  type="text"
                                  value={room}
                                  onChange={(e) => updateRoom(floor.id, roomIndex, e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Tab' && !e.shiftKey) {
                                      // Only add a new room if we're on the LAST room input
                                      if (roomIndex === floor.rooms.length - 1) {
                                        e.preventDefault();
                                        // Check if we can add more rooms (map-wide limit)
                                        const totalRooms = editingMap.floors.reduce((total, f) => {
                                          return total + (f.rooms ? f.rooms.length : 0);
                                        }, 0);
                                        
                                        if (totalRooms < UI_CONSTANTS.MAX_ROOMS_PER_MAP) {
                                          addRoom(floor.id);
                                          // Focus the new input after a brief delay
                                          setTimeout(() => {
                                            const inputs = e.target.closest('.grid').querySelectorAll('input[type="text"]');
                                            const nextInput = inputs[roomIndex + 1];
                                            if (nextInput) {
                                              nextInput.focus();
                                            }
                                          }, 50);
                                        }
                                      }
                                      // For all other inputs, let Tab work normally (move to next input)
                                    }
                                  }}
                                  className="flex-1 px-2 py-1 border border-gray-500 bg-gray-700 text-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  placeholder={`Room ${roomIndex + 1}`}
                                />
                                {floor.rooms.length > 1 && (
                                  <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => removeRoom(floor.id, roomIndex)}
                                    className="px-2 py-1 text-red-400 hover:bg-red-900/20 rounded text-sm"
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={handleSaveMap}
                    disabled={!editingMap.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {selectedMap ? 'Update Map' : 'Create Map'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  {selectedMap && (
                    <>
                      <button
                        onClick={() => handleToggleArchived(selectedMap)}
                        className={`px-4 py-2 rounded-md ${
                          selectedMap.isArchived
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        {selectedMap.isArchived ? 'Unarchive Map' : 'Archive Map'}
                      </button>
                      <button
                        onClick={handleDeleteMap}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete Map
                      </button>
                    </>
                  )}
                </div>

                {/* Archive Information */}
                {selectedMap?.isArchived && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
                    <p className="text-yellow-400 text-sm">
                      ⚠️ This map is archived. It won't appear in new run creation but will still be available for filtering existing runs.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-lg">Select a map to edit or add a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageMapsPage;