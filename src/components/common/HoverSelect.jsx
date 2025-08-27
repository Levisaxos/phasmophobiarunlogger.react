// src/components/common/HoverSelect.jsx - Drop-in replacement for select with hover
import React, { useState, useRef, useEffect } from 'react';

const HoverSelect = ({
  value,
  onChange,
  children,
  className = "",
  disabled = false,
  enableSearch = false, // New prop to enable search functionality
  searchPlaceholder = "Type to search...",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const timeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  // Extract options from children and filter by search term
  const allOptions = React.Children.toArray(children).map((child, index) => ({
    value: child.props.value,
    label: child.props.children,
    disabled: child.props.disabled,
    index,
    isEmpty: !child.props.value || child.props.value === '' // Mark empty/placeholder options
  }));

  const options = enableSearch && searchTerm
    ? allOptions.filter(option => 
        !option.isEmpty && // Exclude placeholder options from search results
        option.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allOptions;

  const handleMouseEnter = () => {
    if (disabled || allOptions.length === 0) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
    
    // Focus search input if search is enabled
    if (enableSearch) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  };

  const handleMouseLeave = () => {
    if (disabled) return;
    
    // Add a small delay to prevent flickering
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
      setSearchTerm(''); // Clear search when closing
    }, 150);
  };

  const handleOptionClick = (optionValue) => {
    if (disabled) return;
    
    // Create synthetic event to match native select behavior
    const syntheticEvent = {
      target: { value: optionValue },
      preventDefault: () => {},
      stopPropagation: () => {}
    };
    
    onChange(syntheticEvent);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setSearchTerm(''); // Clear search when selecting
  };

  const handleKeyDown = (e) => {
    if (disabled || allOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(prev => {
            const nextIndex = prev < options.length - 1 ? prev + 1 : 0;
            return options[nextIndex]?.disabled ? prev : nextIndex;
          });
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setHighlightedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : options.length - 1;
            return options[nextIndex]?.disabled ? prev : nextIndex;
          });
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0 && !options[highlightedIndex]?.disabled) {
          handleOptionClick(options[highlightedIndex].value);
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        setSearchTerm('');
        break;
    }
  };

  // Get display value
  const getDisplayValue = () => {
    const selectedOption = allOptions.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : (allOptions[0]?.label || '');
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`${className} transition-colors duration-200 flex items-center justify-between ${
          isOpen ? 'ring-2 ring-blue-500 border-blue-500' : ''
        }`}
        {...props}
      >
        <span>{getDisplayValue()}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ml-2 ${
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
        <div className="absolute top-full left-0 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-50 max-h-120 overflow-hidden flex flex-col">
          {/* Search input */}
          {enableSearch && (
            <div className="p-2 border-b border-gray-600">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setHighlightedIndex(-1); // Reset highlight when searching
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                    handleKeyDown(e);
                  } else if (e.key === 'Escape') {
                    setSearchTerm('');
                    setIsOpen(false);
                  }
                }}
                placeholder={searchPlaceholder}
                className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-500 text-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          
          {/* Options list */}
          <div className="overflow-y-auto max-h-96">
            {options.length === 0 && enableSearch && searchTerm ? (
              <div className="px-3 py-2 text-sm text-gray-400 italic">
                No matches found for "{searchTerm}"
              </div>
            ) : (
              options.map((option, index) => {
                const isSelected = option.value === value;
                const isHighlighted = index === highlightedIndex;
                const isDisabled = option.disabled;

                return (
                  <button
                    key={`${option.value}-${index}`}
                    type="button"
                    onClick={() => !isDisabled && handleOptionClick(option.value)}
                    onMouseEnter={() => !isDisabled && setHighlightedIndex(index)}
                    disabled={isDisabled}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors duration-200 ${
                      index === 0 && !enableSearch ? 'rounded-t-md' : ''
                    } ${
                      index === options.length - 1 ? 'rounded-b-md' : ''
                    } ${
                      isDisabled
                        ? 'text-gray-500 cursor-not-allowed opacity-50'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : isHighlighted
                        ? 'bg-gray-600 text-white'
                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                    }`}
                  >
                    {/* Highlight search term in the label */}
                    {enableSearch && searchTerm ? (
                      <HighlightedText text={option.label.toString()} searchTerm={searchTerm} />
                    ) : (
                      option.label
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component to highlight search terms in text
const HighlightedText = ({ text, searchTerm }) => {
  if (!searchTerm) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return parts.map((part, index) => 
    part.toLowerCase() === searchTerm.toLowerCase() ? (
      <mark key={index} className="bg-yellow-400 text-black font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export default HoverSelect;