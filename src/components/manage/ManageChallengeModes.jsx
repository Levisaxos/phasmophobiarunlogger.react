// src/components/manage/ManageChallengeModes.jsx - Enhanced with map collection support
import React, { useState, useEffect } from 'react';
import { challengeModesService } from '../../services/api/challengeModesService';
import { mapsService } from '../../services/api/mapsService';
import { dataService } from '../../services/dataService';
import ManageLayout from '../common/ManageLayout';

const ManageChallengeModes = () => {
  const [challengeModes, setChallengeModes] = useState([]);
  const [maps, setMaps] = useState([]);
  const [mapCollections, setMapCollections] = useState([]);
  const [selectedChallengeMode, setSelectedChallengeMode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingChallengeMode, setEditingChallengeMode] = useState({
    name: '',
    description: '',
    mapId: null,
    mapCollectionId: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [challengeModesData, mapsData, mapCollectionsData] = await Promise.all([
        challengeModesService.getChallengeModes(),
        mapsService.getActiveMaps(),
        dataService.getActiveMapCollections()
      ]);
      setChallengeModes(challengeModesData);
      setMaps(mapsData);
      setMapCollections(mapCollectionsData);
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
      mapId: null,
      mapCollectionId: null
    });
    setSelectedChallengeMode(null);
    setIsEditing(true);
  };

  const handleSelect = (challengeMode) => {
    setEditingChallengeMode({
      name: challengeMode.name,
      description: challengeMode.description || '',
      mapId: challengeMode.mapId || null,
      mapCollectionId: challengeMode.mapCollectionId || null
    });
    setSelectedChallengeMode(challengeMode);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingChallengeMode.name.trim()) {
      alert('Please enter a name for the challenge mode');
      return;
    }

    // Must have either a map or map collection, but not both
    const hasMap = editingChallengeMode.mapId;
    const hasMapCollection = editingChallengeMode.mapCollectionId;
    
    if (!hasMap && !hasMapCollection) {
      alert('Please select either a map or a map collection for the challenge mode');
      return;
    }
    
    if (hasMap && hasMapCollection) {
      alert('Please select either a map OR a map collection, not both');
      return;
    }

    try {
      const challengeModeData = {
        name: editingChallengeMode.name.trim(),
        description: editingChallengeMode.description.trim(),
        mapId: editingChallengeMode.mapId ? parseInt(editingChallengeMode.mapId) : null,
        mapCollectionId: editingChallengeMode.mapCollectionId ? parseInt(editingChallengeMode.mapCollectionId) : null
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
      mapId: null,
      mapCollectionId: null
    });
  };

  const getMapName = (mapId) => {
    const map = maps.find(m => m.id === mapId);
    return map ? map.name : 'Unknown Map';
  };

  const getMapCollectionName = (mapCollectionId) => {
    const mapCollection = mapCollections.find(mc => mc.id === mapCollectionId);
    return mapCollection ? mapCollection.name : 'Unknown Collection';
  };

  const handleMapSelectionChange = (e) => {
    const value = e.target.value;
    if (value.startsWith('map-')) {
      const mapId = parseInt(value.replace('map-', ''));
      setEditingChallengeMode({
        ...editingChallengeMode,
        mapId: mapId,
        mapCollectionId: null
      });
    } else if (value.startsWith('collection-')) {
      const mapCollectionId = parseInt(value.replace('collection-', ''));
      setEditingChallengeMode({
        ...editingChallengeMode,
        mapId: null,
        mapCollectionId: mapCollectionId
      });
    } else {
      setEditingChallengeMode({
        ...editingChallengeMode,
        mapId: null,
        mapCollectionId: null
      });
    }
  };

  const getSelectedValue = () => {
    if (editingChallengeMode.mapId) {
      return `map-${editingChallengeMode.mapId}`;
    } else if (editingChallengeMode.mapCollectionId) {
      return `collection-${editingChallengeMode.mapCollectionId}`;
    }
    return '';
  };

  const renderListItem = (challengeMode) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{challengeMode.name}</div>
        <div className="text-xs text-gray-400">
          {challengeMode.mapId 
            ? `Map: ${getMapName(challengeMode.mapId)}`
            : challengeMode.mapCollectionId
            ? `Collection: ${getMapCollectionName(challengeMode.mapCollectionId)} 📁`
            : 'No map assigned'
          }
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
              <label htmlFor="challengeModeMapSelection" className="block text-sm font-medium text-gray-300 mb-2">
                Map or Map Collection *
              </label>
              <select
                id="challengeModeMapSelection"
                value={getSelectedValue()}
                onChange={handleMapSelectionChange}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select a map or map collection...</option>
                
                {/* Individual Maps */}
                {maps.length > 0 && (
                  <optgroup label="Individual Maps">
                    {maps.map((map) => (
                      <option key={`map-${map.id}`} value={`map-${map.id}`}>
                        {map.name} ({map.size})
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Map Collections */}
                {mapCollections.length > 0 && (
                  <optgroup label="Map Collections">
                    {mapCollections.map((collection) => (
                      <option key={`collection-${collection.id}`} value={`collection-${collection.id}`}>
                        📁 {collection.name} ({collection.mapIds?.length || 0} {collection.selectionLabel?.toLowerCase() || 'map'}s)
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              {maps.length === 0 && mapCollections.length === 0 && (
                <p className="text-sm text-yellow-400 mt-1">
                  No maps or map collections available. Please create them first in Manage → Maps or Manage → Map Collections.
                </p>
              )}
              
              {/* Info about selection */}
              <div className="mt-2 p-3 bg-blue-900/20 border border-blue-600/30 rounded-md">
                <h4 className="text-sm font-medium text-blue-300 mb-1">Selection Info:</h4>
                <ul className="text-xs text-blue-200 space-y-1">
                  <li>• <strong>Individual Map:</strong> Always uses the same specific map</li>
                  <li>• <strong>Map Collection:</strong> Auto-selects the collection, then auto-selects the first map/wing when starting a run</li>
                </ul>
              </div>
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