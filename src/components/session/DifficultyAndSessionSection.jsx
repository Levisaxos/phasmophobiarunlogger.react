// src/components/session/DifficultyAndSessionSection.jsx
import React from 'react';

const DifficultyAndSessionSection = ({
  activeGameModes,
  selectedGameMode,
  onGameModeChange,
  selectedPlayers,
  selectedMap,
  selectedMapCollection,
  selectedGameModeObj,
  // Challenge mode props
  isChallengeModeSelected,
  availableChallengeModes,
  selectedChallengeMode,
  onChallengeModeChange
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Difficulty Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Difficulty</h3>
        {activeGameModes.length === 0 ? (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
            <p className="text-yellow-400 text-sm">
              No game modes configured. Please go to Manage → Game Modes to add game modes first.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {activeGameModes.map((gameMode) => {
              const isSelected = selectedGameMode === gameMode.id;
              const evidenceText = gameMode.maxEvidence === 0 
                ? 'No evidence' 
                : `${gameMode.maxEvidence} evidence`;
              
              return (
                <button
                  key={gameMode.id}
                  onClick={() => onGameModeChange(gameMode.id)}
                  className={`p-3 text-left border-2 rounded-md transition-colors duration-200 text-sm ${
                    isSelected
                      ? 'bg-orange-600 border-orange-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium truncate">
                    {gameMode.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {evidenceText}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Session Summary */}
      <div>
        <h3 className="text-lg font-semibold text-gray-100 mb-3">Session Summary</h3>
        <div className="bg-gray-800 border border-gray-600 rounded-md p-3 text-sm">
          <div className="space-y-1">
            <div>
              <span className="text-gray-400">Players:</span>
              <span className="text-gray-200 font-medium ml-2">
                {selectedPlayers.length > 0 ? selectedPlayers.join(', ') : 'None selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Difficulty:</span>
              <span className="text-gray-200 font-medium ml-2">
                {selectedGameModeObj?.name || 'None selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Map:</span>
              <span className="text-gray-200 font-medium ml-2">
                {selectedMap 
                  ? `${selectedMap.name} (${selectedMap.size})`
                  : selectedMapCollection
                  ? `${selectedMapCollection.name} collection`
                  : 'None selected'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Challenge Mode Dropdown - Only show when Challenge Mode difficulty is selected */}
        {isChallengeModeSelected && (
          <div className="mt-4">
            <label htmlFor="challengeMode" className="block text-sm font-medium text-gray-300 mb-2">
              Challenge Mode
            </label>
            {availableChallengeModes.length === 0 ? (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-2">
                <p className="text-yellow-400 text-xs">
                  No challenge modes available. Go to Manage → Challenge Modes to add some.
                </p>
              </div>
            ) : (
              <select
                id="challengeMode"
                value={selectedChallengeMode || ''}
                onChange={(e) => onChallengeModeChange(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select Challenge Mode...</option>
                {availableChallengeModes.map((challengeMode) => (
                  <option key={challengeMode.id} value={challengeMode.id}>
                    {challengeMode.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DifficultyAndSessionSection;