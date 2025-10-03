import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import  HoverSelect  from '../common/HoverSelect';

const ManageGameModes = () => {
  const { gameModes, loading, error, createGameMode, updateGameMode, deleteGameMode, toggleGameModeActive } = useData();
  
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGameMode, setEditingGameMode] = useState({
    name: '',
    maxEvidence: 3,
    isActive: true
  });

  const handleAddNew = () => {
    setEditingGameMode({
      name: '',
      maxEvidence: 3,
      isActive: true
    });
    setSelectedGameMode(null);
    setIsEditing(true);
  };

  const handleEditGameMode = (gameMode) => {
    setEditingGameMode({ ...gameMode });
    setSelectedGameMode(gameMode);
    setIsEditing(true);
  };

  const handleSaveGameMode = async () => {
    try {
      if (selectedGameMode) {
        await updateGameMode(selectedGameMode.id, editingGameMode);
      } else {
        await createGameMode(editingGameMode);
      }
      setIsEditing(false);
      setSelectedGameMode(null);
    } catch (err) {
      console.error('Error saving game mode:', err);
      alert('Error saving game mode: ' + err.message);
    }
  };

  const handleDeleteGameMode = async () => {
    if (selectedGameMode && window.confirm(`Are you sure you want to delete "${selectedGameMode.name}"? This action cannot be undone.`)) {
      try {
        await deleteGameMode(selectedGameMode.id);
        setIsEditing(false);
        setSelectedGameMode(null);
        setEditingGameMode({
          name: '',
          maxEvidence: 3,
          isActive: true
        });
      } catch (err) {
        console.error('Error deleting game mode:', err);
        alert('Error deleting game mode: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedGameMode(null);
    setEditingGameMode({
      name: '',
      maxEvidence: 3,
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading game modes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading game modes: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Game Modes List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">Game Modes</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={handleAddNew}
                className="w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 border-2 border-dashed border-green-300"
              >
                + Add New Game Mode
              </button>
              
              {/* Existing Game Modes */}
              {gameModes.map((gameMode) => (
                <button
                  key={gameMode.id}
                  onClick={() => handleEditGameMode(gameMode)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    selectedGameMode?.id === gameMode.id && isEditing
                      ? 'bg-gray-500 text-gray-900'
                      : 'text-gray-300 hover:bg-gray-800 border border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{gameMode.name}</div>
                      <div className="text-xs text-gray-400">
                        Max Evidence: {gameMode.maxEvidence || 3}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${gameMode.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {gameMode.isActive ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Game Mode Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">
            {isEditing ? (selectedGameMode ? 'Edit Game Mode' : 'Add New Game Mode') : 'Game Mode Details'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Game Mode Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Game Mode Name *
                  </label>
                  <input
                    type="text"
                    value={editingGameMode.name}
                    onChange={(e) => setEditingGameMode({ ...editingGameMode, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter game mode name (e.g., Amateur, Professional, Nightmare)"
                  />
                </div>

                {/* Max Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Maximum Evidence Count *
                  </label>
                  <HoverSelect
                    value={editingGameMode.maxEvidence}
                    onChange={(e) => setEditingGameMode({ ...editingGameMode, maxEvidence: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>0 Evidence (No evidence available)</option>
                    <option value={1}>1 Evidence Maximum</option>
                    <option value={2}>2 Evidence Maximum</option>
                    <option value={3}>3 Evidence Maximum (Standard)</option>
                  </HoverSelect>
                  <p className="mt-1 text-xs text-gray-400">
                    Controls how many evidence types players can find in this game mode
                  </p>
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingGameMode({ ...editingGameMode, isActive: !editingGameMode.isActive })}
                    className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                      editingGameMode.isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    <span className="text-lg">{editingGameMode.isActive ? '✓' : '✗'}</span>
                    {editingGameMode.isActive ? 'Active Game Mode' : 'Inactive Game Mode'}
                  </button>
                  <p className="mt-1 text-xs text-gray-400">
                    Inactive game modes won't appear in the game mode selection when adding runs
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={handleSaveGameMode}
                    disabled={!editingGameMode.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {selectedGameMode ? 'Update Game Mode' : 'Create Game Mode'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteGameMode}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Game Mode
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-lg">Select a game mode to edit or add a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageGameModes;