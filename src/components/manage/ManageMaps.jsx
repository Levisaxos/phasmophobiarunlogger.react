import React, { useState } from 'react';
import { useData } from '../../hooks/useData';

const ManageMapsPage = () => {
  const { maps, loading, error, createMap, updateMap, deleteMap, toggleMapArchived } = useData();
  
  const [selectedMap, setSelectedMap] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMap, setEditingMap] = useState({
    name: '',
    size: 'medium',
    rooms: ['']
  });

  const handleAddNew = () => {
    setEditingMap({
      name: '',
      size: 'medium',
      rooms: ['']
    });
    setSelectedMap(null);
    setIsEditing(true);
  };

  const handleEditMap = (map) => {
    // Convert rooms to legacy format for editing (array of strings)
    let roomsForEditing = [];
    if (map.rooms && Array.isArray(map.rooms) && map.rooms.length > 0 && typeof map.rooms[0] === 'object') {
      // New format: extract names from room objects
      roomsForEditing = map.rooms.map(room => room.name).sort((a, b) => a.localeCompare(b));
    } else if (map.rooms && Array.isArray(map.rooms)) {
      // Legacy format: already array of strings
      roomsForEditing = [...map.rooms].sort((a, b) => a.localeCompare(b));
    } else if (map.roomsLegacy && Array.isArray(map.roomsLegacy)) {
      // Fallback to legacy rooms
      roomsForEditing = [...map.roomsLegacy].sort((a, b) => a.localeCompare(b));
    } else {
      // No rooms found, start with empty array
      roomsForEditing = [''];
    }
    
    setEditingMap({ ...map, rooms: roomsForEditing });
    setSelectedMap(map);
    setIsEditing(true);
  };

  const handleSaveMap = async () => {
    try {
      if (selectedMap) {
        await updateMap(selectedMap.id, editingMap);
      } else {
        await createMap(editingMap);
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
          rooms: ['']
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
      rooms: ['']
    });
  };

  const handleRoomChange = (index, value) => {
    const newRooms = [...editingMap.rooms];
    newRooms[index] = value;
    setEditingMap({ ...editingMap, rooms: newRooms });
  };

  const addRoom = () => {
    if (editingMap.rooms.length < 69) {
      setEditingMap({ 
        ...editingMap, 
        rooms: [...editingMap.rooms, ''] 
      });
    }
  };

  const removeRoom = (index) => {
    if (editingMap.rooms.length > 1) {
      const newRooms = editingMap.rooms.filter((_, i) => i !== index);
      setEditingMap({ ...editingMap, rooms: newRooms });
    }
  };

  // Helper function to get room count for display
  const getRoomCount = (map) => {
    if (map.rooms && Array.isArray(map.rooms) && map.rooms.length > 0 && typeof map.rooms[0] === 'object') {
      return map.rooms.length;
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

                {/* Rooms */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Rooms ({editingMap.rooms.length}/69)
                    </label>
                    <button
                      onClick={addRoom}
                      disabled={editingMap.rooms.length >= 69}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                      Add Room
                    </button>
                  </div>
                  <div className="space-y-2 max-h-100 overflow-y-auto">
                    {editingMap.rooms.map((room, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={room}
                          onChange={(e) => handleRoomChange(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Room ${index + 1}`}
                        />
                        {editingMap.rooms.length > 1 && (
                          <button
                            onClick={() => removeRoom(index)}
                            className="px-3 py-2 text-red-400 hover:bg-red-900/20 rounded-md"
                            tabIndex={-1}
                          >
                            ×
                          </button>
                        )}
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