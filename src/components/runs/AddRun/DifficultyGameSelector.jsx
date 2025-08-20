// components/AddRun/DifficultyGameSelector.jsx
import React from 'react';

const DifficultyGameSelector = ({
  gameModes,
  selectedGameMode,
  onGameModeChange,
  isPerfectGame,
  onPerfectGameToggle
}) => {
  const activeGameModes = gameModes.filter(gm => gm.isActive);
  const selectedGameModeObj = selectedGameMode ? gameModes.find(gm => gm.id === selectedGameMode) : null;

  return (
    <div className="flex gap-10">
      {/* Game Mode Selection */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Game Mode / Difficulty
        </label>
        {activeGameModes.length === 0 ? (
          <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
            <p className="text-yellow-400 text-sm">
              No game modes configured. Please go to Manage → Game Modes to add game modes first.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <select
              value={selectedGameMode || ''}
              onChange={(e) => onGameModeChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {!selectedGameMode && (<option value="">Select game mode...</option>)}
              {activeGameModes.map((gameMode) => (
                <option key={gameMode.id} value={gameMode.id}>
                  {gameMode.name} (Max {gameMode.maxEvidence || 0} evidence)
                </option>
              ))}
            </select>
          </div>

        )}
      </div>
      {/* Perfect Game Toggle */}
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Perfect Game
        </label>
        <button
          type="button"
          onClick={() => onPerfectGameToggle(!isPerfectGame)}
          className={`px-6 py-2 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 h-[42px] ${isPerfectGame
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border border-gray-500'
            }`}
        >
          <span className="text-lg">{isPerfectGame ? '⭐' : '☆'}</span>
          {isPerfectGame ? 'Perfect!' : 'Regular'}
        </button>
      </div>

    </div>
  );
};

export default DifficultyGameSelector;