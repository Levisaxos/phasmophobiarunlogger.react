
// src/components/filters/PlayerFilter.jsx
import React from 'react';
import FilterDropdown from '../../common/FilterDropdown';

const PlayerFilter = ({ value, onChange, options }) => {
  return (
    <FilterDropdown
      label="Filter by Player"
      value={value}
      onChange={onChange}
      allLabel="All Players"
      allCount={options.allCount}
      options={options.options.map(({ name, runCount }) => ({
        value: name,
        label: name,
        count: runCount
      }))}
    />
  );
};

export default PlayerFilter;
