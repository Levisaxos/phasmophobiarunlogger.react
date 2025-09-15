// src/components/session/MapSelectionSection.jsx
import React, { useMemo } from 'react';

const MapSelectionSection = ({ 
  maps, 
  mapCollections, 
  selectedMap, 
  selectedMapCollection, 
  onMapEntrySelect,
  filterMaps = null // Optional filter function to customize which maps to show
}) => {
  // Create combined map entries for display
  const mapEntries = useMemo(() => {
    const mapEntriesArray = [];
    
    // Get map IDs that are part of collections
    const collectionMapIds = new Set();
    mapCollections.forEach(collection => {
      if (collection.isActive !== false && collection.mapIds) {
        collection.mapIds.forEach(mapId => collectionMapIds.add(mapId));
      }
    });
    
    // Filter maps if filter function provided, otherwise use all non-archived maps
    const filteredMaps = filterMaps ? filterMaps(maps) : maps.filter(m => !m.isArchived);
    
    // Add individual maps that are NOT part of any collection
    filteredMaps.forEach(map => {
      if (!collectionMapIds.has(map.id)) {
        mapEntriesArray.push({
          ...map,
          type: 'map'
        });
      }
    });
    
    // Add active map collections
    const activeMapCollections = mapCollections.filter(mc => mc.isActive !== false);
    activeMapCollections.forEach(collection => {
      mapEntriesArray.push({
        ...collection,
        type: 'collection'
      });
    });
    
    return mapEntriesArray.sort((a, b) => a.name.localeCompare(b.name));
  }, [maps, mapCollections, filterMaps]);

  // Helper function to get room count from map
  const getRoomCount = (map) => {
    let roomCount = 0;
    if (map.floors && Array.isArray(map.floors)) {
      map.floors.forEach(floor => {
        if (floor.rooms && Array.isArray(floor.rooms)) {
          roomCount += floor.rooms.length;
        }
      });
    }
    return roomCount;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-100 mb-3">Select Map</h3>
      
      {mapEntries.length === 0 ? (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-3">
          <p className="text-yellow-400 text-sm">
            No maps or map collections available. Please go to Manage → Maps to add maps first.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Group maps by size */}
          {['Small', 'Medium', 'Large'].map(size => {
            const sizeMaps = mapEntries.filter(entry => {
              // For both individual maps and collections, match by size (case insensitive)
              if (entry.size) {
                return entry.size.toLowerCase() === size.toLowerCase();
              }
              // Fallback: if no size specified, put in Small category
              return size === 'Small';
            });

            if (sizeMaps.length === 0) return null;

            // Separate individual maps and collections for better display
            const individualMaps = sizeMaps.filter(entry => entry.type === 'map');
            const collections = sizeMaps.filter(entry => entry.type === 'collection');
            const totalCount = individualMaps.length + collections.length;

            // Color indicator for each size
            const colorClass = size === 'Small' ? 'text-green-400' : 
                              size === 'Medium' ? 'text-yellow-400' : 'text-red-400';
            const dotClass = size === 'Small' ? 'bg-green-400' : 
                            size === 'Medium' ? 'bg-yellow-400' : 'bg-red-400';

            return (
              <div key={size}>
                <h4 className="text-md font-medium text-gray-200 mb-2 flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${dotClass}`}></div>
                  <span className={colorClass}>{size} ({totalCount})</span>
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                  {/* Show individual maps first */}
                  {individualMaps.map((entry) => {
                    const isSelected = selectedMap?.id === entry.id;
                    const roomCount = getRoomCount(entry);
                    const hasNoRooms = roomCount === 0;
                    const subtitle = hasNoRooms ? 'No rooms configured' : `${roomCount} rooms`;
                    const buttonColor = isSelected 
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600';
                    
                    return (
                      <button
                        key={`map-${entry.id}`}
                        onClick={() => !hasNoRooms && onMapEntrySelect(entry)}
                        disabled={hasNoRooms}
                        className={`p-3 text-left border-2 rounded-md transition-colors duration-200 text-sm ${
                          hasNoRooms
                            ? 'bg-gray-900 border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                            : buttonColor
                        }`}
                      >
                        <div className={`font-medium truncate ${hasNoRooms ? 'line-through' : ''}`}>
                          {entry.name}
                        </div>
                        <div className="text-xs opacity-75">
                          {subtitle}
                        </div>
                      </button>
                    );
                  })}
                  
                  {/* Show collections in their appropriate size category */}
                  {collections.map((entry) => {
                    const isSelected = selectedMapCollection?.id === entry.id;
                    const subtitle = `${entry.mapIds?.length || 0} ${entry.selectionLabel?.toLowerCase() || 'map'}s`;
                    const buttonColor = isSelected
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-600';
                    
                    return (
                      <button
                        key={`collection-${entry.id}`}
                        onClick={() => onMapEntrySelect(entry)}
                        className={`p-3 text-left border-2 rounded-md transition-colors duration-200 text-sm ${buttonColor}`}
                      >
                        <div className="font-medium truncate">
                          {entry.name}
                          <span className="ml-1 text-xs opacity-75">📁</span>
                        </div>
                        <div className="text-xs opacity-75">
                          {subtitle}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapSelectionSection;