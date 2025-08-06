import React, { useState } from 'react';
import { useData } from '../hooks/useData';

const ManageMapsPage = () => {
  const { maps, loading, error, createMap, updateMap, deleteMap } = useData();
  
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
    // Sort rooms alphabetically when editing
    const sortedRooms = [...map.rooms].sort((a, b) => a.localeCompare(b));
    setEditingMap({ ...map, rooms: sortedRooms });
    setSelectedMap(map);
    setIsEditing(true);
  };

  const handleSaveMap = async () => {
    try {
      if (selectedMap) {
        // Editing existing map
        await updateMap(selectedMap.id, editingMap);
      } else {
        // Adding new map
        await createMap(editingMap);
      }
      setIsEditing(false);
      setSelectedMap(null);
    } catch (err) {
      console.error('Error saving map:', err);
      // You could add user-friendly error handling here
    }
  };

  const handleDeleteMap = async () => {
    if (selectedMap && window.confirm(`Are you sure you want to delete "${selectedMap.name}"? This action cannot be undone.`)) {
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
        // You could add user-friendly error handling here
      }
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

  // Rest of the component remains the same...
  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Maps List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
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
                      : 'text-gray-300 hover:bg-gray-800 border-gray-300 '
                  }`}
                >
                  <div className="font-medium">{map.name}</div>
                  <div className="text-xs text-gray-300 capitalize">
                    {map.size} • {map.rooms.length} rooms
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Map Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-900">
            {isEditing ? (selectedMap ? 'Edit Map' : 'Add New Map') : 'Map Details'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Map Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Map Name
                  </label>
                  <input
                    type="text"
                    value={editingMap.name}
                    onChange={(e) => setEditingMap({ ...editingMap, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 bg-gray-900 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter map name"
                  />
                </div>

                {/* Map Size */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Map Size
                  </label>
                  <select
                    value={editingMap.size}
                    onChange={(e) => setEditingMap({ ...editingMap, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 text-gray-300 bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Rooms */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-500">
                      Rooms ({editingMap.rooms.length}/69)
                    </label>
                    <button
                      onClick={addRoom}
                      disabled={editingMap.rooms.length >= 69}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                          className="flex-1 px-3 py-2 border border-gray-300 bg-gray-900 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder={`Room ${index + 1}`}
                        />
                        {editingMap.rooms.length > 1 && (
                          <button
                            onClick={() => removeRoom(index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
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
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveMap}
                    disabled={!editingMap.name.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {selectedMap ? 'Update Map' : 'Create Map'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  {selectedMap && (
                    <button
                      onClick={handleDeleteMap}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete Map
                    </button>
                  )}
                </div>
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