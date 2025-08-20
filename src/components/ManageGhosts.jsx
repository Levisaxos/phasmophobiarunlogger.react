import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';

const ManageGhostsPage = () => {
  const { ghosts, evidence, loading, error, createGhost, updateGhost, deleteGhost } = useData();
  
  const [selectedGhost, setSelectedGhost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingGhost, setEditingGhost] = useState({
    name: '',
    evidenceIds: []
  });

  // Get active evidence sorted by sequence
  const availableEvidence = useMemo(() => {
    return evidence
      .filter(e => e.isActive)
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
  }, [evidence]);

  const handleAddNew = () => {
    setEditingGhost({
      name: '',
      evidenceIds: []
    });
    setSelectedGhost(null);
    setIsEditing(true);
  };

  const handleEditGhost = (ghost) => {
    setEditingGhost({ 
      ...ghost,
      evidenceIds: ghost.evidenceIds || []
    });
    setSelectedGhost(ghost);
    setIsEditing(true);
  };

  const handleSaveGhost = async () => {
    try {
      // Also save legacy evidence field for backward compatibility
      const evidenceNames = editingGhost.evidenceIds.map(id => {
        const evidenceItem = evidence.find(e => e.id === id);
        return evidenceItem ? evidenceItem.name : '';
      }).filter(name => name);

      const ghostData = {
        ...editingGhost,
        evidence: evidenceNames // Legacy field
      };

      if (selectedGhost) {
        // Editing existing ghost
        await updateGhost(selectedGhost.id, ghostData);
      } else {
        // Adding new ghost
        await createGhost(ghostData);
      }
      setIsEditing(false);
      setSelectedGhost(null);
    } catch (err) {
      console.error('Error saving ghost:', err);
      alert('Error saving ghost: ' + err.message);
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
          evidenceIds: []
        });
      } catch (err) {
        console.error('Error deleting ghost:', err);
        alert('Error deleting ghost: ' + err.message);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedGhost(null);
    setEditingGhost({
      name: '',
      evidenceIds: []
    });
  };

  const handleEvidenceToggle = (evidenceId) => {
    const currentEvidenceIds = editingGhost.evidenceIds || [];
    const isSelected = currentEvidenceIds.includes(evidenceId);
    
    if (isSelected) {
      // Remove evidence
      setEditingGhost({
        ...editingGhost,
        evidenceIds: currentEvidenceIds.filter(id => id !== evidenceId)
      });
    } else if (currentEvidenceIds.length < 3) {
      // Add evidence (max 3)
      setEditingGhost({
        ...editingGhost,
        evidenceIds: [...currentEvidenceIds, evidenceId]
      });
    }
  };

  // Helper function to get evidence names for display
  const getEvidenceNames = (evidenceIds) => {
    return (evidenceIds || [])
      .map(id => evidence.find(e => e.id === id)?.name)
      .filter(name => name);
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
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
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
              {ghosts.map((ghost) => {
                const evidenceCount = (ghost.evidenceIds || ghost.evidence || []).length;
                return (
                  <button
                    key={ghost.id}
                    onClick={() => handleEditGhost(ghost)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                      selectedGhost?.id === ghost.id && isEditing
                        ? 'bg-gray-500 text-gray-900'
                        : 'text-gray-300 hover:bg-gray-800 border border-gray-500'
                    }`}
                  >
                    <div className="font-medium">{ghost.name}</div>
                    <div className="text-xs text-gray-300">
                      {evidenceCount} evidence types
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Ghost Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
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
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ghost Name *
                  </label>
                  <input
                    type="text"
                    value={editingGhost.name}
                    onChange={(e) => setEditingGhost({ ...editingGhost, name: e.target.value })}
                    className="w-full text-gray-300 bg-gray-800 px-3 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter ghost name"
                  />
                </div>

                {/* Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Evidence ({(editingGhost.evidenceIds || []).length}/3)
                    </label>
                    <span className="text-xs text-gray-400">
                      Select up to 3 evidence types
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {availableEvidence.map((evidenceItem) => {
                      const isSelected = (editingGhost.evidenceIds || []).includes(evidenceItem.id);
                      const canSelect = (editingGhost.evidenceIds || []).length < 3;
                      
                      return (
                        <button
                          key={evidenceItem.id}
                          onClick={() => handleEvidenceToggle(evidenceItem.id)}
                          disabled={!isSelected && !canSelect}
                          className={`px-4 py-3 text-left border rounded-md transition-colors duration-200 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : canSelect
                              ? 'bg-gray-800 border-gray-500 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-900 border-gray-600 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{evidenceItem.name}</span>
                            {isSelected && (
                              <span className="text-blue-200">✓</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Evidence Summary */}
                {(editingGhost.evidenceIds || []).length > 0 && (
                  <div className="bg-gray-800 p-4 rounded-md">
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Selected Evidence:</h4>
                    <div className="flex flex-wrap gap-2">
                      {getEvidenceNames(editingGhost.evidenceIds).map((evidenceName) => (
                        <span
                          key={evidenceName}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md"
                        >
                          {evidenceName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={handleSaveGhost}
                    disabled={!editingGhost.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {selectedGhost ? 'Update Ghost' : 'Create Ghost'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  {selectedGhost && (
                    <button
                      onClick={handleDeleteGhost}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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