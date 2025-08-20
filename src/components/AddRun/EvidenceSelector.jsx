// components/AddRun/EvidenceSelector.jsx
import React from 'react';

const EvidenceSelector = ({
  evidence,
  selectedEvidenceIds,
  maxEvidence = 3,
  onEvidenceToggle
}) => {
  const handleEvidenceClick = (evidenceId) => {
    if (selectedEvidenceIds.includes(evidenceId)) {
      // Remove evidence
      onEvidenceToggle(evidenceId, false);
    } else if (selectedEvidenceIds.length < maxEvidence) {
      // Add evidence (up to maxEvidence limit)
      onEvidenceToggle(evidenceId, true);
    }
  };

  if (evidence.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Evidence (0/{maxEvidence}) *
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No evidence types configured. Please go to Manage → Evidence to add evidence types first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1'>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-300">
          Select Evidence ({selectedEvidenceIds.length}/{maxEvidence}) *
        </label>
        <span className="text-xs text-gray-400">
          {maxEvidence === 0 ? 'No evidence available in this game mode' : `Select maximum ${maxEvidence} evidence type${maxEvidence !== 1 ? 's' : ''}`}
        </span>
      </div>
      
      {maxEvidence === 0 ? (
        <div className="bg-blue-900/20 border border-blue-600/30 rounded-md p-4">
          <p className="text-blue-400 text-sm">
            🚫 This game mode doesn't allow any evidence to be found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {evidence.map((evidenceItem) => {
            const isSelected = selectedEvidenceIds.includes(evidenceItem.id);
            const canSelect = selectedEvidenceIds.length < maxEvidence;
            
            return (
              <button
                key={evidenceItem.id}
                type="button"
                onClick={() => handleEvidenceClick(evidenceItem.id)}
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
      )}
    </div>
  );
};

export default EvidenceSelector;