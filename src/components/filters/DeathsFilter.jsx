
// src/components/filters/DeathsFilter.jsx
import React from 'react';

const DeathsFilter = ({ value, onChange, options }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Filter by Deaths
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Runs ({options.allCount})</option>
        <option value="none">No Deaths ({options.noDeathsCount})</option>
        <option value="any">Any Deaths ({options.anyDeathsCount})</option>
        {options.playerDeaths.map((playerDeath) => (
          <option key={playerDeath.name} value={playerDeath.name}>
            {playerDeath.name} Died ({playerDeath.deathCount})
          </option>
        ))}
      </select>
    </div>
  );
};

export default DeathsFilter;