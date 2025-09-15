// components/manage/ManageChallengeModes.jsx
import React, { useState, useEffect } from 'react';
import {  challengeModesService} from '../../services/api/challengeModesService'
 import { mapsService } from '../../services/api/mapsService';
import  ManageLayout  from '../common/ManageLayout';

const ManageChallengeModes = () => {
  const [challengeModes, setChallengeModes] = useState([]);
  const [maps, setMaps] = useState([]);
  const [selectedChallengeMode, setSelectedChallengeMode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingChallengeMode, setEditingChallengeMode] = useState({
    name: '',
    description: '',
    mapId: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [challengeModesData, mapsData] = await Promise.all([
        challengeModesService.getChallengeModes(),
        mapsService.getActiveMaps()
      ]);
      setChallengeModes(challengeModesData);
      setMaps(mapsData);
    } catch (err) {
      console.error('Error loading data:', err);
      alert('Error loading data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingChallengeMode({
      name: '',
      description: '',
      mapId: null
    });
    setSelectedChallengeMode(null);
    setIsEditing(true);
  };

  const handleSelect = (challengeMode) => {
    setEditingChallengeMode({
      name: challengeMode.name,
      description: challengeMode.description || '',
      mapId: challengeMode.mapId || null
    });
    setSelectedChallengeMode(challengeMode);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingChallengeMode.name.trim()) {
      alert('Please enter a name for the challenge mode');
      return;
    }

    if (!editingChallengeMode.mapId) {
      alert('Please select a map for the challenge mode');
      return;
    }

    try {
      const challengeModeData = {
        name: editingChallengeMode.name.trim(),
        description: editingChallengeMode.description.trim(),
        mapId: parseInt(editingChallengeMode.mapId)
      };

      if (selectedChallengeMode) {
        await challengeModesService.updateChallengeMode(selectedChallengeMode.id, challengeModeData);
      } else {
        await challengeModesService.createChallengeMode(challengeModeData);
      }
      
      await loadData();
      handleCancel();
    } catch (err) {
      console.error('Error saving challenge mode:', err);
      alert('Error saving challenge mode: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedChallengeMode) return;
    
    if (window.confirm(`Are you sure you want to delete "${selectedChallengeMode.name}"? This action cannot be undone.`)) {
      try {
        await challengeModesService.deleteChallengeMode(selectedChallengeMode.id);
        await loadData();
        handleCancel();
      } catch (err) {
        console.error('Error deleting challenge mode:', err);
        alert('Error deleting challenge mode: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedChallengeMode(null);
    setEditingChallengeMode({
      name: '',
      description: '',
      mapId: null
    });
  };

  const getMapName = (mapId) => {
    const map = maps.find(m => m.id === mapId);
    return map ? map.name : 'Unknown Map';
  };

  const renderListItem = (challengeMode) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{challengeMode.name}</div>
        <div className="text-xs text-gray-400">
          Map: {getMapName(challengeMode.mapId)}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading challenge modes...</div>
      </div>
    );
  }

  return (
    <ManageLayout
      title="Challenge Modes"
      items={challengeModes}
      selectedItem={selectedChallengeMode}
      onItemSelect={handleSelect}
      onAddNew={handleAddNew}
      isEditing={isEditing}
      renderListItem={renderListItem}
    >
      {/* Challenge Mode Editor */}
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label htmlFor="challengeModeName" className="block text-sm font-medium text-gray-300 mb-2">
                Challenge Mode Name *
              </label>
              <input
                id="challengeModeName"
                type="text"
                value={editingChallengeMode.name}
                onChange={(e) => setEditingChallengeMode({
                  ...editingChallengeMode,
                  name: e.target.value
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter challenge mode name"
              />
            </div>

            <div>
              <label htmlFor="challengeModeDescription" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="challengeModeDescription"
                value={editingChallengeMode.description}
                onChange={(e) => setEditingChallengeMode({
                  ...editingChallengeMode,
                  description: e.target.value
                })}
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                placeholder="Enter challenge mode description (optional)"
              />
            </div>

            <div>
              <label htmlFor="challengeModeMap" className="block text-sm font-medium text-gray-300 mb-2">
                Map *
              </label>
              <select
                id="challengeModeMap"
                value={editingChallengeMode.mapId || ''}
                onChange={(e) => setEditingChallengeMode({
                  ...editingChallengeMode,
                  mapId: e.target.value ? parseInt(e.target.value) : null
                })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a map...</option>
                {maps.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.name} ({map.size})
                  </option>
                ))}
              </select>
              {maps.length === 0 && (
                <p className="text-sm text-yellow-400 mt-1">
                  No maps available. Please create maps first in Manage → Maps.
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-600">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
            >
              {selectedChallengeMode ? 'Update Challenge Mode' : 'Create Challenge Mode'}
            </button>
            
            {selectedChallengeMode && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Delete
              </button>
            )}
            
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </ManageLayout>
  );
};

export default ManageChallengeModes;