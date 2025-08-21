// components/AddRun/EvidenceSelector.jsx - Enhanced with exclude functionality
import React from 'react';

const EvidenceSelector = ({
  evidence,
  selectedEvidenceIds,
  excludedEvidenceIds = [],
  maxEvidence = 3,
  onEvidenceToggle,
  onEvidenceExclude,
  ghosts = [] // Add ghosts prop to calculate which evidence is impossible
}) => {
  // Calculate which ghosts are still possible based on current evidence selection
  const possibleGhosts = ghosts.filter(ghost => {
    const ghostEvidenceIds = ghost.evidenceIds || [];
    
    // Ghost must have all selected evidence
    const hasAllSelectedEvidence = selectedEvidenceIds.length === 0 || 
      selectedEvidenceIds.every(evidenceId => ghostEvidenceIds.includes(evidenceId));
    
    // Ghost must NOT have any excluded evidence
    const hasNoExcludedEvidence = excludedEvidenceIds.length === 0 ||
      !excludedEvidenceIds.some(evidenceId => ghostEvidenceIds.includes(evidenceId));
    
    return hasAllSelectedEvidence && hasNoExcludedEvidence;
  });

  // Get all evidence IDs that are possible (used by at least one remaining ghost)
  const possibleEvidenceIds = new Set();
  possibleGhosts.forEach(ghost => {
    const ghostEvidenceIds = ghost.evidenceIds || [];
    ghostEvidenceIds.forEach(evidenceId => {
      possibleEvidenceIds.add(evidenceId);
    });
  });

  const handleEvidenceClick = (evidenceId) => {
    const isSelected = selectedEvidenceIds.includes(evidenceId);
    const isExcluded = excludedEvidenceIds.includes(evidenceId);

    if (isSelected) {
      // Selected → Excluded
      onEvidenceToggle(evidenceId, false);
      onEvidenceExclude(evidenceId, true);
    } else if (isExcluded) {
      // Excluded → Unselected
      onEvidenceExclude(evidenceId, false);
    } else {
      // Unselected → Selected (if within limit)
      if (selectedEvidenceIds.length < maxEvidence) {
        onEvidenceToggle(evidenceId, true);
      }
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
          {maxEvidence === 0 ? 'No evidence available in this game mode' : `Click: Select → Exclude → Clear`}
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
            const isExcluded = excludedEvidenceIds.includes(evidenceItem.id);
            const canSelect = selectedEvidenceIds.length < maxEvidence;
            const isImpossible = !isSelected && !isExcluded && !possibleEvidenceIds.has(evidenceItem.id) && possibleGhosts.length > 0;
            
            // Determine styling based on selection state
            let buttonStyle = '';
            let nameStyle = '';
            
            if (isSelected) {
              // Selected evidence - blue
              buttonStyle = 'bg-blue-600 border-blue-500 text-white';
              nameStyle = 'text-white';
            } else if (isExcluded) {
              // Excluded evidence - red with strikethrough
              buttonStyle = 'bg-gray-900 border-gray-600 text-gray-500';
              nameStyle = 'text-gray-500 line-through';
            } else if (isImpossible) {
              // Impossible evidence based on remaining ghosts - darkened with different styling
              buttonStyle = 'bg-gray-900 border-gray-700 text-gray-600 cursor-not-allowed opacity-50';
              nameStyle = 'text-gray-600 italic';
            } else if (canSelect) {
              // Available for selection - gray
              buttonStyle = 'bg-gray-800 border-gray-500 text-gray-300 hover:bg-gray-600';
              nameStyle = 'text-gray-300';
            } else {
              // Cannot select (limit reached) - darkened
              buttonStyle = 'bg-gray-900 border-gray-600 text-gray-500 cursor-not-allowed';
              nameStyle = 'text-gray-500';
            }
            
            return (
              <button
                key={evidenceItem.id}
                type="button"
                onClick={() => !isImpossible && handleEvidenceClick(evidenceItem.id)}
                disabled={(!isSelected && !isExcluded && !canSelect) || isImpossible}
                className={`px-4 py-3 text-left border rounded-md transition-colors duration-200 ${buttonStyle}`}
                title={isImpossible ? "No remaining ghosts have this evidence" : ""}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${nameStyle}`}>{evidenceItem.name}</span>
                  {isSelected && (
                    <span className="text-blue-200">✓</span>
                  )}
                  {isExcluded && (
                    <span className="text-red-400">✗</span>
                  )}
                  {isImpossible && (
                    <span className="text-gray-500">⊘</span>
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