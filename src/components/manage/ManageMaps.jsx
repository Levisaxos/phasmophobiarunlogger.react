import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../../hooks/useData';
import { UI_CONSTANTS } from '../../constants';
import  HoverSelect  from '../common/HoverSelect';

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
        name: 'First Floor',
        order: 0,
        rooms: ['']
      }
    ]
  });

  // Refs for auto-focusing on newly created room inputs
  const roomInputRefs = useRef({});
  
  // State to track when we should focus a new room (to avoid auto-focusing on other changes)
  const [focusNewRoom, setFocusNewRoom] = useState(null);

  // Effect to focus on a specific new room when needed
  useEffect(() => {
    if (focusNewRoom) {
      const { floorId, roomIndex } = focusNewRoom;
      const refKey = `${floorId}-${roomIndex}`;
      if (roomInputRefs.current[refKey]) {
        roomInputRefs.current[refKey].focus();
      }
      setFocusNewRoom(null); // Clear the focus request
    }
  }, [focusNewRoom]);

  const handleAddNew = () => {
    setEditingMap({
      name: '',
      size: 'medium',
      floors: [
        {
          id: 1,
          name: 'First Floor',
          order: 0,
          rooms: ['']
        }
      ]
    });
    setSelectedMap(null);
    setIsEditing(true);
  };

  const handleEditMap = (map) => {
    // Convert map data to editing format
    let floorsForEditing;
    
    if (map.floors && Array.isArray(map.floors)) {
      floorsForEditing = map.floors.map(floor => ({
        ...floor,
        rooms: floor.rooms && Array.isArray(floor.rooms) 
          ? floor.rooms.map(room => typeof room === 'string' ? room : room.name)
          : ['']
      }));
    } else {
      // No floors structure, create default
      floorsForEditing = [
        {
          id: 1,
          name: 'First Floor',
          order: 0,
          rooms: ['']
        }
      ];
    }
    
    setEditingMap({ 
      ...map, 
      floors: floorsForEditing 
    });
    setSelectedMap(map);
    setIsEditing(true);
  };

  const handleSaveMap = async () => {
    try {
      // Convert editing format back to proper format
      const mapDataToSave = {
        ...editingMap,
        floors: editingMap.floors.map(floor => ({
          ...floor,
          rooms: floor.rooms.filter(room => room.trim()) // Filter out empty rooms
        }))
      };
      
      if (selectedMap) {
        await updateMap(selectedMap.id, mapDataToSave);
      } else {
        await createMap(mapDataToSave);
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
              name: 'First Floor',
              order: 0,
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
          name: 'First Floor',
          order: 0,
          rooms: ['']
        }
      ]
    });
  };

  // Floor management functions
  const addFloor = () => {
    const newFloorId = Math.max(...editingMap.floors.map(f => f.id), 0) + 1;
    const newFloor = {
      id: newFloorId,
      name: `Floor ${newFloorId}`,
      order: editingMap.floors.length,
      rooms: ['']
    };
    setEditingMap({
      ...editingMap,
      floors: [...editingMap.floors, newFloor]
    });
  };

  const removeFloor = (floorId) => {
    if (editingMap.floors.length > 1) {
      setEditingMap({
        ...editingMap,
        floors: editingMap.floors.filter(floor => floor.id !== floorId)
      });
    }
  };

  const updateFloorName = (floorId, newName) => {
    setEditingMap({
      ...editingMap,
      floors: editingMap.floors.map(floor =>
        floor.id === floorId ? { ...floor, name: newName } : floor
      )
    });
  };

  // Room management functions
  const addRoom = (floorId) => {
    const floor = editingMap.floors.find(f => f.id === floorId);
    const newRoomIndex = floor ? floor.rooms.length : 0;
    
    setEditingMap({
      ...editingMap,
      floors: editingMap.floors.map(floor =>
        floor.id === floorId
          ? { ...floor, rooms: [...floor.rooms, ''] }
          : floor
      )
    });

    // Request focus for the new room
    setFocusNewRoom({ floorId, roomIndex: newRoomIndex });
  };

  const removeRoom = (floorId, roomIndex) => {
    setEditingMap({
      ...editingMap,
      floors: editingMap.floors.map(floor =>
        floor.id === floorId && floor.rooms.length > 1
          ? { ...floor, rooms: floor.rooms.filter((_, i) => i !== roomIndex) }
          : floor
      )
    });
  };

  const updateRoom = (floorId, roomIndex, newRoomName) => {
    setEditingMap({
      ...editingMap,
      floors: editingMap.floors.map(floor =>
        floor.id === floorId
          ? {
              ...floor,
              rooms: floor.rooms.map((room, i) =>
                i === roomIndex ? newRoomName : room
              )
            }
          : floor
      )
    });
  };

  // Handle Enter key press in room input
  const handleRoomKeyDown = (e, floorId, roomIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Add a new room after the current one
      const floor = editingMap.floors.find(f => f.id === floorId);
      if (floor) {
        const newRooms = [...floor.rooms];
        newRooms.splice(roomIndex + 1, 0, ''); // Insert empty room after current
        
        setEditingMap({
          ...editingMap,
          floors: editingMap.floors.map(f =>
            f.id === floorId
              ? { ...f, rooms: newRooms }
              : f
          )
        });

        // Request focus for the new room
        setFocusNewRoom({ floorId, roomIndex: roomIndex + 1 });
      }
    }
  };

  // Helper function to get total room count for display from floors
  const getRoomCount = (map) => {
    if (map.floors && Array.isArray(map.floors)) {
      let totalRooms = 0;
      map.floors.forEach(floor => {
        if (floor.rooms && Array.isArray(floor.rooms)) {
          totalRooms += floor.rooms.length;
        }
      });
      return totalRooms;
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
                        {map.size} • {getRoomCount(map)} rooms • {map.floors?.length || 0} floors
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
                  <HoverSelect
                    value={editingMap.size}
                    onChange={(e) => setEditingMap({ ...editingMap, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-500 text-gray-300 bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </HoverSelect>
                </div>

                {/* Floors */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Floors ({editingMap.floors.length})
                      </label>
                      <div className="text-xs text-gray-400">
                        {editingMap.floors.map((floor, index) => (
                          <span key={floor.id}>
                            {floor.name}: {floor.rooms.filter(room => room.trim()).length} rooms
                            {index < editingMap.floors.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={addFloor}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add Floor
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingMap.floors.map((floor, floorIndex) => (
                      <div key={floor.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            value={floor.name}
                            onChange={(e) => updateFloorName(floor.id, e.target.value)}
                            className="font-medium bg-gray-700 text-gray-300 px-2 py-1 rounded border border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Floor name"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addRoom(floor.id)}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Add Room
                            </button>
                            {editingMap.floors.length > 1 && (
                              <button
                                onClick={() => removeFloor(floor.id)}
                                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                              >
                                Remove Floor
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs text-gray-400 mb-2">
                            Rooms ({floor.rooms.length})
                          </div>
                          {floor.rooms.map((room, roomIndex) => (
                            <div key={roomIndex} className="flex gap-2">
                              <input
                                ref={(el) => {
                                  if (el) {
                                    roomInputRefs.current[`${floor.id}-${roomIndex}`] = el;
                                  }
                                }}
                                type="text"
                                value={room}
                                onChange={(e) => updateRoom(floor.id, roomIndex, e.target.value)}
                                onKeyDown={(e) => handleRoomKeyDown(e, floor.id, roomIndex)}
                                className="flex-1 px-3 py-2 border border-gray-500 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`Room ${roomIndex + 1}`}
                              />
                              {floor.rooms.length > 1 && (
                                <button
                                  onClick={() => removeRoom(floor.id, roomIndex)}
                                  className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-md"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
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