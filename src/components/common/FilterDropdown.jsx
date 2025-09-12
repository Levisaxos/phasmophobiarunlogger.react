// src/components/common/FilterDropdown.jsx - Updated with hover functionality

import React, { useState, useRef, useEffect } from 'react';
import  HoverSelect  from './HoverSelect';

const FilterDropdown = ({
  label,
  value,
  onChange,
  allLabel = "All",
  allCount = 0,
  options = [],
  className = "",
  enableHover = false // New prop to enable hover functionality
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (!enableHover) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (!enableHover) return;
    
    // Add a small delay to prevent flickering when moving between trigger and dropdown
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 150);
  };

  const handleSelectClick = (e) => {
    if (enableHover) {
      e.preventDefault();
      return;
    }
    // Let browser handle normal select behavior when hover is disabled
  };

  const handleOptionClick = (optionValue) => {
    if (!enableHover) return;
    
    onChange(optionValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!enableHover) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          const allOptions = [{ value: "", label: `${allLabel} (${allCount})` }, ...options];
          setHighlightedIndex(prev => 
            prev < allOptions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          const allOptions = [{ value: "", label: `${allLabel} (${allCount})` }, ...options];
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : allOptions.length - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          const allOptions = [{ value: "", label: `${allLabel} (${allCount})` }, ...options];
          handleOptionClick(allOptions[highlightedIndex].value);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get display value
  const getDisplayValue = () => {
    if (!value) return `${allLabel} (${allCount})`;
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : value;
  };

  if (!enableHover) {
    // Render as normal select dropdown when hover is disabled
    return (
      <div className={className}>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
        <HoverSelect
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">{allLabel} ({allCount})</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.count})
            </option>
          ))}
        </HoverSelect>
      </div>
    );
  }

  // Render as custom hover dropdown
  const allOptions = [
    { value: "", label: `${allLabel} (${allCount})`, count: allCount },
    ...options
  ];

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          className={`w-full px-3 py-2 text-left border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 flex items-center justify-between ${
            isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
          }`}
        >
          <span>{getDisplayValue()}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {allOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <button
                  key={option.value || 'all'}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors duration-200 first:rounded-t-md last:rounded-b-md ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : isHighlighted
                      ? 'bg-gray-600 text-white'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                >
                  {option.label} {option.count !== undefined && `(${option.count})`}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterDropdown;