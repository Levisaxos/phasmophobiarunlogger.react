import React, { useState } from 'react';
import { useData } from '../hooks/useData';

const ManageGhostsPage = () => {
  const { ghosts, loading, error, createGhost, updateGhost, deleteGhost } = useData();
  
  const [selectedGhost, setSelectedGhost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGhost, setEditingGhost] = useState({
    name: '',
    evidence: []
  });

  const availableEvidence = [
    'EMF 5',
    'Ultraviolet',
    'Ghost Writing',
    'Freezing Temperatures',
    'D.O.T.S',
    'Ghost Orbs',
    'Spirit Box'
  ];

  const handleAddNew = () => {
    setEditingGhost({
      name: '',
      evidence: []
    });
    setSelectedGhost(null);
    setIsEditing(true);
  };

  const handleEditGhost = (ghost) => {
    setEditingGhost({ ...ghost });
    setSelectedGhost(ghost);
    setIsEditing(true);
  };

  const handleSaveGhost = async () => {
    try {
      if (selectedGhost) {
        // Editing existing ghost
        await updateGhost(selectedGhost.id, editingGhost);
      } else {
        // Adding new ghost
        await createGhost(editingGhost);
      }
      setIsEditing(false);
      setSelectedGhost(null);
    } catch (err) {
      console.error('Error saving ghost:', err);
      // You could add user-friendly error handling here
    }
  };

  const handleDeleteGhost = async () => {
    if (selectedGhost && window.confirm(`Are you sure you want to delete "${selectedGhost.name}"? This action cannot be undone.`)) {
      try {
        await deleteGhost(selectedGhost.id);
        setIsEditing(false);
        setSelectedGhost(null);
        setEditingGhost({
          name: '',
          evidence: []
        });
      } catch (err) {
        console.error('Error deleting ghost:', err);
        // You could add user-friendly error handling here
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedGhost(null);
    setEditingGhost({
      name: '',
      evidence: []
    });
  };

  const handleEvidenceToggle = (evidence) => {
    const currentEvidence = editingGhost.evidence || [];
    const isSelected = currentEvidence.includes(evidence);
    
    if (isSelected) {
      // Remove evidence
      setEditingGhost({
        ...editingGhost,
        evidence: currentEvidence.filter(e => e !== evidence)
      });
    } else if (currentEvidence.length < 3) {
      // Add evidence (max 3)
      setEditingGhost({
        ...editingGhost,
        evidence: [...currentEvidence, evidence]
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading ghosts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading ghosts: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Ghosts List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">Ghosts</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={handleAddNew}
                className="w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 border-2 border-dashed border-green-300"
              >
                + Add New Ghost
              </button>
              
              {/* Existing Ghosts */}
              {ghosts.map((ghost) => (
                <button
                  key={ghost.id}
                  onClick={() => handleEditGhost(ghost)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    selectedGhost?.id === ghost.id && isEditing
                      ? 'bg-gray-500 text-gray-900'
                      : 'text-gray-300 hover:bg-gray-800 border border-gray-500 '
                  }`}
                >
                  <div className="font-medium">{ghost.name}</div>
                  <div className="text-xs text-gray-300">
                    {ghost.evidence?.length || 0} evidence types
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Ghost Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">
            {isEditing ? (selectedGhost ? 'Edit Ghost' : 'Add New Ghost') : 'Ghost Details'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Ghost Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Ghost Name
                  </label>
                  <input
                    type="text"
                    value={editingGhost.name}
                    onChange={(e) => setEditingGhost({ ...editingGhost, name: e.target.value })}
                    className="w-full text-gray-300 bg-gray-900 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter ghost name"
                  />
                </div>

                {/* Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-500">
                      Evidence ({editingGhost.evidence?.length || 0}/3)
                    </label>
                    <span className="text-xs text-gray-500">
                      Select up to 3 evidence types
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {availableEvidence.map((evidence) => {
                      const isSelected = editingGhost.evidence?.includes(evidence) || false;
                      const canSelect = (editingGhost.evidence?.length || 0) < 3;
                      
                      return (
                        <button
                          key={evidence}
                          onClick={() => handleEvidenceToggle(evidence)}
                          disabled={!isSelected && !canSelect}
                          className={`px-4 py-3 text-left border rounded-md transition-colors duration-200 ${
                            isSelected
                              ? 'bg-gray-500 border-gray-900 text-gray-900'
                              : canSelect
                              ? 'bg-gray-700 border-gray-900 text-gray-300 hover:bg-gray-800'
                              : 'bg-gray-900 border-gray-900 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{evidence}</span>
                            {isSelected && (
                              <span className="text-gray-500">✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Evidence Summary */}
                {editingGhost.evidence?.length > 0 && (
                  <div className="bg-gray-900 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Evidence:</h4>
                    <div className="flex flex-wrap gap-2">
                      {editingGhost.evidence.map((evidence) => (
                        <span
                          key={evidence}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                        >
                          {evidence}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveGhost}
                    disabled={!editingGhost.name.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {selectedGhost ? 'Update Ghost' : 'Create Ghost'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  {selectedGhost && (
                    <button
                      onClick={handleDeleteGhost}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Delete Ghost
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-lg">Select a ghost to edit or add a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageGhostsPage;