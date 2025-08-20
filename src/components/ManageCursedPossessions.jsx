import React, { useState } from 'react';
import { useData } from '../hooks/useData';

const ManageCursedPossessions = () => {
  const { cursedPossessions, loading, error, createCursedPossession, updateCursedPossession, deleteCursedPossession, toggleCursedPossessionActive } = useData();
  
  const [selectedPossession, setSelectedPossession] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPossession, setEditingPossession] = useState({
    name: '',
    sequence: 1,
    isActive: true
  });

  const handleAddNew = () => {
    setEditingPossession({
      name: '',
      sequence: Math.max(...cursedPossessions.map(p => p.sequence || 0), 0) + 1,
      isActive: true
    });
    setSelectedPossession(null);
    setIsEditing(true);
  };

  const handleEditPossession = (possession) => {
    setEditingPossession({ ...possession });
    setSelectedPossession(possession);
    setIsEditing(true);
  };

  const handleSavePossession = async () => {
    try {
      if (selectedPossession) {
        await updateCursedPossession(selectedPossession.id, editingPossession);
      } else {
        await createCursedPossession(editingPossession);
      }
      setIsEditing(false);
      setSelectedPossession(null);
    } catch (err) {
      console.error('Error saving cursed possession:', err);
      alert('Error saving cursed possession: ' + err.message);
    }
  };

  const handleDeletePossession = async () => {
    if (selectedPossession && window.confirm(`Are you sure you want to delete "${selectedPossession.name}"? This action cannot be undone.`)) {
      try {
        await deleteCursedPossession(selectedPossession.id);
        setIsEditing(false);
        setSelectedPossession(null);
        setEditingPossession({
          name: '',
          sequence: 1,
          isActive: true
        });
      } catch (err) {
        console.error('Error deleting cursed possession:', err);
        alert('Error deleting cursed possession: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (possession) => {
    try {
      await toggleCursedPossessionActive(possession.id);
    } catch (err) {
      console.error('Error toggling possession status:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedPossession(null);
    setEditingPossession({
      name: '',
      sequence: 1,
      isActive: true
    });
  };

  const sortedPossessions = [...cursedPossessions].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading cursed possessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading cursed possessions: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Cursed Possessions List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">Cursed Possessions</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={handleAddNew}
                className="w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 border-2 border-dashed border-green-300"
              >
                + Add New Cursed Possession
              </button>
              
              {/* Existing Cursed Possessions */}
              {sortedPossessions.map((possession) => (
                <button
                  key={possession.id}
                  onClick={() => handleEditPossession(possession)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    selectedPossession?.id === possession.id && isEditing
                      ? 'bg-gray-500 text-gray-900'
                      : 'text-gray-300 hover:bg-gray-800 border border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{possession.name}</div>
                      <div className="text-xs text-gray-400">
                        Sequence: {possession.sequence || 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${possession.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {possession.isActive ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Cursed Possession Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">
            {isEditing ? (selectedPossession ? 'Edit Cursed Possession' : 'Add New Cursed Possession') : 'Cursed Possession Details'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Possession Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cursed Possession Name *
                  </label>
                  <input
                    type="text"
                    value={editingPossession.name}
                    onChange={(e) => setEditingPossession({ ...editingPossession, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter cursed possession name"
                  />
                </div>

                {/* Sequence */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Sequence
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingPossession.sequence}
                    onChange={(e) => setEditingPossession({ ...editingPossession, sequence: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Controls the order this possession appears in lists
                  </p>
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingPossession({ ...editingPossession, isActive: !editingPossession.isActive })}
                    className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                      editingPossession.isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    <span className="text-lg">{editingPossession.isActive ? '✓' : '✗'}</span>
                    {editingPossession.isActive ? 'Active Possession' : 'Inactive Possession'}
                  </button>
                  <p className="mt-1 text-xs text-gray-400">
                    Inactive possessions won't appear in selection when adding runs
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={handleSavePossession}
                    disabled={!editingPossession.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {selectedPossession ? 'Update Possession' : 'Create Possession'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeletePossession}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Possession
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-lg">Select a cursed possession to edit or add a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCursedPossessions;