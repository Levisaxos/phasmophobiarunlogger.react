// === STATISTICS CARD COMPONENT ===
// src/components/runs/statistics/StatisticsCard.jsx

import React, { useState } from 'react';

const StatisticsCard = ({ statistic, data, className = '' }) => {
  const [showMostTooltip, setShowMostTooltip] = useState(false);
  const [showLeastTooltip, setShowLeastTooltip] = useState(false);

  // Helper function to format time
  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '--:--';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  if (!data) {
    return (
      <div className={`bg-gray-800 rounded-lg p-3 border-l-4 border-gray-500 ${className}`}>
        <div className="text-sm font-medium text-gray-300 mb-2">
          {statistic.name}
        </div>
        <div className="text-lg font-bold text-gray-500 mb-2">
          No Data
        </div>
        <div className="text-xs text-gray-400">
          {statistic.description}
        </div>
      </div>
    );
  }

  const renderMainContent = () => {
    // Timing statistics (fastest/slowest runs)
    if (statistic.type === 'timing-extreme') {
      return (
        <div className="space-y-3">
          {/* Fastest */}
          <div>
            <div className="text-xs text-green-400 font-medium mb-1">FASTEST</div>
            <div className="text-lg font-bold text-green-400 font-mono">
              {formatTime(data.fastest.time)}
            </div>
            <div className="text-xs text-gray-400">
              {data.fastest.mapName} • {data.fastest.ghostName}
            </div>
          </div>
          
          {/* Slowest */}
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-red-400 font-medium mb-1">SLOWEST</div>
            <div className="text-lg font-bold text-red-400 font-mono">
              {formatTime(data.slowest.time)}
            </div>
            <div className="text-xs text-gray-400">
              {data.slowest.mapName} • {data.slowest.ghostName}
            </div>
          </div>
        </div>
      );
    }

    // Count-based statistics (most/least seen)
    if (statistic.type === 'count-both') {
      return (
        <div className="space-y-3">
          {/* Most */}
          <div>
            <div className="text-xs text-green-400 font-medium mb-1">MOST</div>
            <div className="text-lg font-bold text-green-400 truncate">
              {data.most.name}
              {data.most.hasMore && (
                <span 
                  className="text-sm text-gray-400 ml-1 cursor-help"
                  onMouseEnter={() => setShowMostTooltip(true)}
                  onMouseLeave={() => setShowMostTooltip(false)}
                >
                  (+{data.most.moreCount})
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {data.most.count} time{data.most.count !== 1 ? 's' : ''}
              {data.most.rate && (
                <span> • {data.most.rate}% rate</span>
              )}
            </div>
          </div>
          
          {/* Least */}
          <div className="pt-2 border-t border-gray-700">
            <div className="text-xs text-red-400 font-medium mb-1">LEAST</div>
            <div className="text-lg font-bold text-red-400 truncate">
              {data.least.name}
              {data.least.hasMore && (
                <span 
                  className="text-sm text-gray-400 ml-1 cursor-help"
                  onMouseEnter={() => setShowLeastTooltip(true)}
                  onMouseLeave={() => setShowLeastTooltip(false)}
                >
                  (+{data.least.moreCount})
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400">
              {data.least.count} time{data.least.count !== 1 ? 's' : ''}
              {data.least.rate && (
                <span> • {data.least.rate}% rate</span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="text-lg font-bold text-gray-400">
        Unknown stat type
      </div>
    );
  };

  return (
    <div 
      className={`bg-gray-800 rounded-lg p-2 border-l-4 ${statistic.category.borderColor} ${className} relative`}
    >
      <div className="text-xs font-medium text-gray-300 mb-2">
        {statistic.name}
      </div>
      
      {renderMainContent()}

      {/* Tooltip for Most tied results */}
      {showMostTooltip && data?.most?.hasMore && data?.most?.allTied && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg border border-gray-600 z-10 max-w-xs">
          <div className="font-medium mb-1">Most tied with {data.most.count}:</div>
          <div className="space-y-1">
            {data.most.allTied.map((name, index) => (
              <div key={index} className="truncate">{name}</div>
            ))}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}

      {/* Tooltip for Least tied results */}
      {showLeastTooltip && data?.least?.hasMore && data?.least?.allTied && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded shadow-lg border border-gray-600 z-10 max-w-xs">
          <div className="font-medium mb-1">Least tied with {data.least.count}:</div>
          <div className="space-y-1">
            {data.least.allTied.map((name, index) => (
              <div key={index} className="truncate">{name}</div>
            ))}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default StatisticsCard;