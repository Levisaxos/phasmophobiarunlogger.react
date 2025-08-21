// src/components/filters/ExactPlayerFilter.jsx
import React from 'react';

const ExactPlayerFilter = ({ 
  allPlayers, 
  selectedPlayerFilter, 
  onPlayerFilterChange, 
  individualPlayerCounts 
}) => {
  return (
    <div className="bg-gray-700 rounded-lg shadow p-4">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">
          Filter by Exact Player Combination
        </h3>
        <p className="text-sm text-gray-400">
          Select players to show only games with that exact player combination.
          Leave empty to show all games.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {allPlayers.map(playerName => {
          const isSelected = selectedPlayerFilter.includes(playerName);
          const playerGameCount = individualPlayerCounts[playerName] || 0;

          return (
            <button
              key={playerName}
              onClick={() => onPlayerFilterChange(playerName)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isSelected
                  ? 'bg-blue-600 text-white border-2 border-blue-500'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border-2 border-gray-600'
              }`}
            >
              {playerName}
              <span className="ml-1 text-xs">({playerGameCount})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ExactPlayerFilter;