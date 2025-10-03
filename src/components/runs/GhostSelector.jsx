// components/AddRun/GhostSelector.jsx - Updated to handle excluded evidence
const GhostSelector = ({
  ghosts,
  evidence,
  selectedEvidenceIds,
  excludedEvidenceIds = [],
  selectedGhost,
  actualGhost,
  excludedGhosts,
  onGhostSelect,
  onActualGhostSelect,
  onGhostExclude
}) => {
  // Filter ghosts based on selected AND excluded evidence
  const filteredGhosts = ghosts.filter(ghost => {
    const ghostEvidenceIds = ghost.evidenceIds || [];
    
    // Ghost must have all selected evidence
    const hasAllSelectedEvidence = selectedEvidenceIds.length === 0 || 
      selectedEvidenceIds.every(evidenceId => ghostEvidenceIds.includes(evidenceId));
    
    // Ghost must NOT have any excluded evidence
    const hasNoExcludedEvidence = excludedEvidenceIds.length === 0 ||
      !excludedEvidenceIds.some(evidenceId => ghostEvidenceIds.includes(evidenceId));
    
    return hasAllSelectedEvidence && hasNoExcludedEvidence;
  });

  const handleGhostClick = (ghost) => {
    const isSelected = selectedGhost?.id === ghost.id;
    const isExcluded = excludedGhosts.includes(ghost.id);

    if (isSelected) {
      // Selected → Excluded
      onGhostSelect(null);
      onGhostExclude(ghost.id, true);
    } else if (isExcluded) {
      // Excluded → Unselected
      onGhostExclude(ghost.id, false);
    } else {
      // Unselected → Selected
      onGhostSelect(ghost);
    }
  };

  const handleGhostRightClick = (e, ghost) => {
    e.preventDefault();
    const isActual = actualGhost?.id === ghost.id;
    onActualGhostSelect(isActual ? null : ghost);
  };

  if (ghosts.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Ghosts *
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No ghosts configured. Please go to Manage → Ghosts to add ghosts first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='flex gap-2'>
        <label className="block text-sm font-medium text-gray-300 mb-2 flex-1">
          Select Ghosts
        </label>
        <p className="text-xs text-gray-400 align-middle">
          {selectedEvidenceIds.length === 0 && excludedEvidenceIds.length === 0
            ? `All ${ghosts.length} ghosts available`
            : `${filteredGhosts.length} ghosts match evidence criteria`
          }
        </p>
      </div>

      {/* Ghost Grid - 3 columns, up to 8 rows */}
      <div className="grid grid-cols-3 gap-1.5 border border-gray-600 rounded-lg p-2 bg-gray-800">
        {ghosts.map((ghost) => {
          const isGuessed = selectedGhost?.id === ghost.id;
          const isActual = actualGhost?.id === ghost.id;
          const isExcluded = excludedGhosts.includes(ghost.id);
          const isBoth = isGuessed && isActual;
          
          // Check if ghost matches evidence criteria
          const ghostEvidenceIds = ghost.evidenceIds || [];
          const hasMatchingEvidence = selectedEvidenceIds.length === 0 ||
            selectedEvidenceIds.every(evidenceId => ghostEvidenceIds.includes(evidenceId));
          const hasExcludedEvidence = excludedEvidenceIds.length > 0 &&
            excludedEvidenceIds.some(evidenceId => ghostEvidenceIds.includes(evidenceId));
          
          const meetsEvidenceCriteria = hasMatchingEvidence && !hasExcludedEvidence;

          // Determine styling based on selection state
          let buttonStyle = '';
          let nameStyle = '';
          let evidenceStyle = '';

          if (isBoth) {
            // Both guessed and actual - split styling
            buttonStyle = 'border-gray-900 text-gray-900 bg-gradient-to-r from-gray-500 to-green-600';
            nameStyle = 'text-white';
            evidenceStyle = 'bg-gray-600/50';
          } else if (isGuessed) {
            // Only guessed
            buttonStyle = 'bg-green-600 border-green-500 text-white';
            nameStyle = 'text-white';
            evidenceStyle = 'bg-green-700/50';
          } else if (isActual) {
            // Only actual
            buttonStyle = 'bg-purple-600 border-purple-500 text-white';
            nameStyle = 'text-white';
            evidenceStyle = 'bg-purple-700/50';
          } else if (isExcluded) {
            // Excluded - red with strikethrough
            buttonStyle = 'bg-gray-900 border-gray-600 text-gray-500';
            nameStyle = 'text-gray-500 line-through';
            evidenceStyle = 'bg-gray-900/50';
          } else if (meetsEvidenceCriteria) {
            // Default - matches evidence criteria
            buttonStyle = 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600';
            nameStyle = 'text-gray-300';
            evidenceStyle = 'bg-gray-800/50';
          } else {
            // Doesn't match evidence criteria - darkened and disabled
            buttonStyle = 'bg-gray-900 border-gray-600 text-gray-500 cursor-default';
            nameStyle = 'text-gray-500';
            evidenceStyle = 'bg-gray-900/50';
          }

          // Get evidence names for display
          const ghostEvidenceNames = (ghost.evidenceIds || [])
            .map(id => evidence.find(e => e.id === id)?.name)
            .filter(name => name)
            .slice(0, 3);

          return (
            <button
              key={ghost.id}
              type="button"
              onClick={() => meetsEvidenceCriteria && handleGhostClick(ghost)}
              onContextMenu={(e) => handleGhostRightClick(e, ghost)}
              disabled={!meetsEvidenceCriteria && !isGuessed && !isActual && !isExcluded}
              className={`p-0 text-xs rounded-md border transition-all duration-200 min-h-[70px] flex overflow-hidden ${buttonStyle}`}
            >
              {/* Left: Ghost Name - 70% width, centered */}
              <div className="w-[70%] flex items-center justify-center p-2">
                <div className={`font-medium text-center leading-tight ${nameStyle}`}>
                  {ghost.name}
                </div>
              </div>

              {/* Right: Evidence Types - 30% width, right aligned with different background */}
              <div className={`w-[30%] flex flex-col items-end justify-center space-y-0.5 px-2 py-2 ${evidenceStyle}`}>
                {ghostEvidenceNames.length > 0 ? (
                  ghostEvidenceNames.map((evidenceName, index) => (
                    <div
                      key={index}
                      className="text-[9px] leading-tight text-right truncate max-w-full"
                      title={evidenceName}
                    >
                      {evidenceName}
                    </div>
                  ))
                ) : (
                  <div className="text-[9px] text-gray-400 text-right">
                    No evidence
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>    
    </div>
  );
};

export default GhostSelector;