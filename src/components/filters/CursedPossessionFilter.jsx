


// src/components/filters/CursedPossessionFilter.jsx
import React from 'react';
import { HoverSelect } from '../common';

const CursedPossessionFilter = ({ value, onChange, options }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Filter by Cursed Possession
      </label>
      <HoverSelect
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">All Possessions ({options.allCount})</option>
        <option value="none">No Possession Found ({options.noneCount})</option>
        {options.possessions.map((possession) => (
          <option key={possession.id} value={possession.id}>
            {possession.name} ({possession.runCount})
          </option>
        ))}
      </HoverSelect>
    </div>
  );
};

export default CursedPossessionFilter;
