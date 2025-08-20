// components/AddRun/CursedPossessionSelector.jsx
import React from 'react';

const CursedPossessionSelector = ({
  cursedPossessions,
  selectedCursedPossession,
  onCursedPossessionChange
}) => {
  const handlePossessionClick = (possessionId) => {
    if (selectedCursedPossession === possessionId) {
      // Deselect if already selected
      onCursedPossessionChange('');
    } else {
      // Select the new possession
      onCursedPossessionChange(possessionId);
    }
  };

  if (cursedPossessions.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Cursed Possession (Optional)
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No cursed possessions configured. Please go to Manage → Cursed Possessions to add them first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1'>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Cursed Possession (Optional)
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {cursedPossessions.map((possession) => {
          const isSelected = selectedCursedPossession === possession.id;
          
          return (
            <button
              key={possession.id}
              type="button"
              onClick={() => handlePossessionClick(possession.id)}
              className={`px-4 py-3 text-left border rounded-md transition-colors duration-200 ${
                isSelected
                  ? 'bg-purple-600 border-purple-500 text-white'
                  : 'bg-gray-800 border-gray-500 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{possession.name}</span>
                {isSelected && (
                  <span className="text-purple-200">✓</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CursedPossessionSelector;