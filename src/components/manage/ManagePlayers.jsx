import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { UI_CONSTANTS } from '../../constants';

const ManagePlayers = () => {
  const { players, loading, error, createPlayer, updatePlayer, deletePlayer, togglePlayerActive } = useData();
  
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState({
    name: '',
    isActive: true,
    isDefault: false
  });

  const handleAddNew = () => {
    setEditingPlayer({
      name: '',
      isActive: true,
      isDefault: false
    });
    setSelectedPlayer(null);
    setIsEditing(true);
  };

  const handleEditPlayer = (player) => {
    setEditingPlayer({ ...player });
    setSelectedPlayer(player);
    setIsEditing(true);
  };

  const handleSavePlayer = async () => {
    try {
      // Check default player limit when setting as default
      if (editingPlayer.isDefault) {
        const currentDefaultCount = players.filter(p => p.isDefault && p.id !== selectedPlayer?.id).length;
        if (currentDefaultCount >= 4) {
          alert('Maximum of 4 players can be set as default.');
          return;
        }
      }
      
      if (selectedPlayer) {
        await updatePlayer(selectedPlayer.id, editingPlayer);
      } else {
        await createPlayer(editingPlayer);
      }
      setIsEditing(false);
      setSelectedPlayer(null);
    } catch (err) {
      console.error('Error saving player:', err);
      alert('Error saving player: ' + err.message);
    }
  };

  const handleDeletePlayer = async () => {
    if (selectedPlayer && window.confirm(`Are you sure you want to delete "${selectedPlayer.name}"? This action cannot be undone.`)) {
      try {
        await deletePlayer(selectedPlayer.id);
        setIsEditing(false);
        setSelectedPlayer(null);
        setEditingPlayer({
          name: '',
          isActive: true,
          isDefault: false
        });
      } catch (err) {
        console.error('Error deleting player:', err);
        alert('Error deleting player: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPlayer(null);
    setEditingPlayer({
      name: '',
      isActive: true,
      isDefault: false
    });
  };

  const handleToggleDefault = async (player) => {
    try {
      const currentDefaultCount = players.filter(p => p.isDefault && p.id !== player.id).length;
      
      // Check if trying to set as default when already at limit
      if (!player.isDefault && currentDefaultCount >= 4) {
        alert('Maximum of 4 players can be set as default.');
        return;
      }
      
      // Toggle the default status
      const updatedPlayerData = {
        ...player,
        isDefault: !player.isDefault
      };
      await updatePlayer(player.id, updatedPlayerData);
    } catch (err) {
      console.error('Error toggling default status:', err);
      alert('Error updating player: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading players...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading players: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Players List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">Players</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={handleAddNew}
                className="w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 border-2 border-dashed border-green-300"
              >
                + Add New Player
              </button>
              
              {/* Existing Players */}
              {players.map((player) => (
                <div key={player.id} className="space-y-1">
                  <button
                    onClick={() => handleEditPlayer(player)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                      selectedPlayer?.id === player.id && isEditing
                        ? 'bg-gray-500 text-gray-900'
                        : 'text-gray-300 hover:bg-gray-800 border border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {player.name}
                          {player.isDefault && (
                            <span className="text-blue-400 text-xs">✔️</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.isDefault ? 'Default Player' : 'Custom Player'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        
                        <span className={`text-xs ${player.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {player.isActive ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>

                  </button>                                  
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Player Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">
            {isEditing ? (selectedPlayer ? 'Edit Player' : 'Add New Player') : 'Player Details'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Player Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Player Name *
                  </label>
                  <input
                    type="text"
                    value={editingPlayer.name}
                    onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter player name"
                  />
                </div>

                {/* Default Player Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default Player
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const currentDefaultCount = players.filter(p => p.isDefault && p.id !== selectedPlayer?.id).length;
                      if (!editingPlayer.isDefault && currentDefaultCount >= UI_CONSTANTS.MAX_DEFAULT_PLAYERS) {
                        alert('Maximum of 4 players can be set as default.');
                        return;
                      }
                      setEditingPlayer({ ...editingPlayer, isDefault: !editingPlayer.isDefault });
                    }}
                    disabled={!editingPlayer.isDefault && players.filter(p => p.isDefault && p.id !== selectedPlayer?.id).length >= UI_CONSTANTS.MAX_DEFAULT_PLAYERS}
                    className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                      editingPlayer.isDefault
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    <span className="text-lg">{editingPlayer.isDefault ? '🏠' : '👤'}</span>
                    {editingPlayer.isDefault ? 'Default Player' : 'Regular Player'}
                  </button>
                  <p className="mt-1 text-xs text-gray-400">
                    Default players will be automatically selected when starting a new gaming session. Maximum {UI_CONSTANTS.MAX_DEFAULT_PLAYERS} players can be set as default.
                    {players.filter(p => p.isDefault).length > 0 && (
                      <span className="block mt-1">
                        Current default players: {players.filter(p => p.isDefault).length}/{UI_CONSTANTS.MAX_DEFAULT_PLAYERS}
                      </span>
                    )}
                  </p>
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingPlayer({ ...editingPlayer, isActive: !editingPlayer.isActive })}
                    className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                      editingPlayer.isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    <span className="text-lg">{editingPlayer.isActive ? '✓' : '✗'}</span>
                    {editingPlayer.isActive ? 'Active Player' : 'Inactive Player'}
                  </button>
                  <p className="mt-1 text-xs text-gray-400">
                    Inactive players won't appear in the player selection when adding runs
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={handleSavePlayer}
                    disabled={!editingPlayer.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {selectedPlayer ? 'Update Player' : 'Create Player'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  {selectedPlayer && (
                    <button
                      onClick={handleDeletePlayer}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete Player
                    </button>
                  )}
                </div>

                {/* Information about default players */}
                {editingPlayer.isDefault && (
                  <div className="bg-blue-900/20 border border-blue-600/30 rounded-md p-4">
                    <p className="text-blue-400 text-sm">
                      ℹ️ This player will be automatically selected when starting a new gaming session along with other default players.
                    </p>
                  </div>
                )}

                {/* Show current defaults count */}
                {players.filter(p => p.isDefault).length > 0 && (
                  <div className="bg-gray-800 border border-gray-600 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Current Default Players ({players.filter(p => p.isDefault).length}/{UI_CONSTANTS.MAX_DEFAULT_PLAYERS}):</h4>
                    <div className="flex flex-wrap gap-2">
                      {players.filter(p => p.isDefault).map((defaultPlayer) => (
                        <span key={defaultPlayer.id} className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md flex items-center gap-1">
                          🏠 {defaultPlayer.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-lg">Select a player to edit or add a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePlayers;