import React, { useState } from 'react';
import { useData } from '../../hooks/useData';

const ManageEvidence = () => {
  const { evidence, loading, error, createEvidence, updateEvidence, deleteEvidence, toggleEvidenceActive } = useData();
  
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState({
    name: '',
    sequence: 1,
    isActive: true
  });

  const handleAddNew = () => {
    setEditingEvidence({
      name: '',
      sequence: Math.max(...evidence.map(e => e.sequence || 0), 0) + 1,
      isActive: true
    });
    setSelectedEvidence(null);
    setIsEditing(true);
  };

  const handleEditEvidence = (evidenceItem) => {
    setEditingEvidence({ ...evidenceItem });
    setSelectedEvidence(evidenceItem);
    setIsEditing(true);
  };

  const handleSaveEvidence = async () => {
    try {
      if (selectedEvidence) {
        await updateEvidence(selectedEvidence.id, editingEvidence);
      } else {
        await createEvidence(editingEvidence);
      }
      setIsEditing(false);
      setSelectedEvidence(null);
    } catch (err) {
      console.error('Error saving evidence:', err);
      alert('Error saving evidence: ' + err.message);
    }
  };

  const handleDeleteEvidence = async () => {
    if (selectedEvidence && window.confirm(`Are you sure you want to delete "${selectedEvidence.name}"? This action cannot be undone and will remove this evidence from all ghosts and runs.`)) {
      try {
        await deleteEvidence(selectedEvidence.id);
        setIsEditing(false);
        setSelectedEvidence(null);
        setEditingEvidence({
          name: '',
          sequence: 1,
          isActive: true
        });
      } catch (err) {
        console.error('Error deleting evidence:', err);
        alert('Error deleting evidence: ' + err.message);
      }
    }
  };

  const handleToggleActive = async (evidenceItem) => {
    try {
      await toggleEvidenceActive(evidenceItem.id);
    } catch (err) {
      console.error('Error toggling evidence status:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedEvidence(null);
    setEditingEvidence({
      name: '',
      sequence: 1,
      isActive: true
    });
  };

  const sortedEvidence = [...evidence].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading evidence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading evidence: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6" style={{ height: 'calc(100vh - 140px)' }}>
      {/* Left Sidebar - Evidence List */}
      <div className="w-80 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-4 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-100">Evidence Types</h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-4">
            <div className="space-y-2">
              {/* Add New Button */}
              <button
                onClick={handleAddNew}
                className="w-full text-left px-3 py-3 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200 border-2 border-dashed border-green-300"
              >
                + Add New Evidence Type
              </button>
              
              {/* Existing Evidence */}
              {sortedEvidence.map((evidenceItem) => (
                <button
                  key={evidenceItem.id}
                  onClick={() => handleEditEvidence(evidenceItem)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    selectedEvidence?.id === evidenceItem.id && isEditing
                      ? 'bg-gray-500 text-gray-900'
                      : 'text-gray-300 hover:bg-gray-800 border border-gray-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{evidenceItem.name}</div>
                      <div className="text-xs text-gray-400">
                        Sequence: {evidenceItem.sequence || 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs ${evidenceItem.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {evidenceItem.isActive ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Evidence Editor */}
      <div className="flex-1 bg-gray-700 rounded-lg shadow flex flex-col h-full">
        <div className="p-6 border-b border-gray-600 flex-shrink-0">
          <h3 className="text-xl font-semibold text-gray-100">
            {isEditing ? (selectedEvidence ? 'Edit Evidence Type' : 'Add New Evidence Type') : 'Evidence Details'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Evidence Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Evidence Name *
                  </label>
                  <input
                    type="text"
                    value={editingEvidence.name}
                    onChange={(e) => setEditingEvidence({ ...editingEvidence, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter evidence name"
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
                    value={editingEvidence.sequence}
                    onChange={(e) => setEditingEvidence({ ...editingEvidence, sequence: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Controls the order this evidence appears in lists
                  </p>
                </div>

                {/* Active Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingEvidence({ ...editingEvidence, isActive: !editingEvidence.isActive })}
                    className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
                      editingEvidence.isActive
                        ? 'bg-green-600 text-white'
                        : 'bg-red-600 text-white'
                    }`}
                  >
                    <span className="text-lg">{editingEvidence.isActive ? '✓' : '✗'}</span>
                    {editingEvidence.isActive ? 'Active Evidence' : 'Inactive Evidence'}
                  </button>
                  <p className="mt-1 text-xs text-gray-400">
                    Inactive evidence won't appear in evidence selection when adding runs
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-600">
                  <button
                    onClick={handleSaveEvidence}
                    disabled={!editingEvidence.name.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    {selectedEvidence ? 'Update Evidence' : 'Create Evidence'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteEvidence}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete Evidence
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-lg">Select evidence to edit or add a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageEvidence;