// src/components/filters/MapFilter.jsx
import React from 'react';
import FilterDropdown from '../common/FilterDropdown';

const MapFilter = ({ value, onChange, options }) => {
  return (
    <FilterDropdown
      label="Filter by Map"
      value={value}
      onChange={onChange}
      allLabel="All Maps"
      allCount={options.allCount}
      options={options.options.map((map) => ({
        value: map.id.toString(),
        label: map.name,
        count: map.runCount
      }))}
    />
  );
};

export default MapFilter;