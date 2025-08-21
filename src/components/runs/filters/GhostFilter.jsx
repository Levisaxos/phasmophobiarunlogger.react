// src/components/filters/GhostFilter.jsx
import React from 'react';
import FilterDropdown from '../../common/FilterDropdown';

const GhostFilter = ({ value, onChange, options }) => {
  return (
    <FilterDropdown
      label="Filter by Ghost"
      value={value}
      onChange={onChange}
      allLabel="All Ghosts"
      allCount={options.allCount}
      options={options.options.map((ghost) => ({
        value: ghost.id.toString(),
        label: ghost.name,
        count: ghost.runCount
      }))}
    />
  );
};

export default GhostFilter;