// components/runs/CollectionMapSelector.jsx - Map selection from a collection
import React from 'react';

const CollectionMapSelector = ({
  mapCollection,
  availableMaps,
  selectedMap,
  onMapChange
}) => {
  // Get maps that belong to this collection
  const collectionMaps = availableMaps.filter(map => 
    mapCollection.mapIds.includes(map.id)
  );

  const handleMapChange = (e) => {
    const mapId = e.target.value;
    if (mapId === '') {
      onMapChange(null);
    } else {
      const map = collectionMaps.find(m => m.id === parseInt(mapId));
      onMapChange(map || null);
    }
  };

  if (collectionMaps.length === 0) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select {mapCollection.selectionLabel}
        </label>
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-md p-4">
          <p className="text-yellow-400 text-sm">
            No maps found for this collection. Please check your map collection configuration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Select {mapCollection.selectionLabel}
      </label>
      <select
        value={selectedMap?.id || ''}
        onChange={handleMapChange}
        className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {!selectedMap && (
          <option value="">Choose a {mapCollection.selectionLabel.toLowerCase()}...</option>
        )}
        {collectionMaps
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((map) => {
            // Count rooms from floors structure
            let roomCount = 0;
            if (map.floors && Array.isArray(map.floors)) {
              map.floors.forEach(floor => {
                if (floor.rooms && Array.isArray(floor.rooms)) {
                  roomCount += floor.rooms.length;
                }
              });
            }
            
            return (
              <option key={map.id} value={map.id}>
                {map.name} ({roomCount} rooms)
              </option>
            );
          })}
      </select>
    </div>
  );
};

export default CollectionMapSelector;