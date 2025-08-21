// src/components/filters/DateFilter.jsx
import React from 'react';
import FilterDropdown from '../common/FilterDropdown';

const DateFilter = ({ value, onChange, options }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <FilterDropdown
      label="Filter by Date"
      value={value}
      onChange={onChange}
      allLabel="All Dates"
      allCount={options.allCount}
      options={options.options.map(({ date, runCount }) => ({
        value: date,
        label: formatDate(date),
        count: runCount
      }))}
    />
  );
};

export default DateFilter;


