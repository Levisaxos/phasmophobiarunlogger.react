// services/api/mapCollectionsService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mapCollectionsService = {
  async getMapCollections() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.mapCollections];
  },

  async getMapCollectionById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.mapCollections.find(collection => collection.id === id);
  },

  async getActiveMapCollections() {
    await delay(50);
    const data = await baseService.loadData();
    return data.mapCollections.filter(collection => collection.isActive !== false);
  },

  async createMapCollection(collectionData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Check for duplicate names
    const existingCollection = data.mapCollections.find(c => 
      c.name.toLowerCase() === collectionData.name.toLowerCase()
    );
    if (existingCollection) {
      throw new Error('Map collection with this name already exists');
    }
    
    // Validate that all mapIds exist
    const invalidMapIds = collectionData.mapIds.filter(mapId => 
      !data.maps.find(map => map.id === mapId)
    );
    if (invalidMapIds.length > 0) {
      throw new Error(`Invalid map IDs: ${invalidMapIds.join(', ')}`);
    }
    
    // Auto-determine size from first map if not provided
    let processedData = { ...collectionData };
    if (collectionData.mapIds.length > 0) {
      const firstMap = data.maps.find(map => map.id === collectionData.mapIds[0]);
      if (firstMap && !processedData.size) {
        processedData.size = firstMap.size;
      }
    }
    
    const newCollection = {
      ...processedData,
      id: baseService.getNextId(data.mapCollections),
      isActive: collectionData.isActive !== undefined ? collectionData.isActive : true
    };
    
    data.mapCollections.push(newCollection);
    await baseService.saveData(data);
    return newCollection;
  },

  async updateMapCollection(id, collectionData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.mapCollections.findIndex(collection => collection.id === id);
    
    if (index !== -1) {
      // Check for duplicate names (excluding current collection)
      const existingCollection = data.mapCollections.find(c => 
        c.id !== id && c.name.toLowerCase() === collectionData.name.toLowerCase()
      );
      if (existingCollection) {
        throw new Error('Map collection with this name already exists');
      }
      
      // Validate that all mapIds exist
      const invalidMapIds = collectionData.mapIds.filter(mapId => 
        !data.maps.find(map => map.id === mapId)
      );
      if (invalidMapIds.length > 0) {
        throw new Error(`Invalid map IDs: ${invalidMapIds.join(', ')}`);
      }
      
      // Auto-determine size from first map if not provided
      let processedData = { ...collectionData };
      if (collectionData.mapIds.length > 0) {
        const firstMap = data.maps.find(map => map.id === collectionData.mapIds[0]);
        if (firstMap && !processedData.size) {
          processedData.size = firstMap.size;
        }
      }
      
      data.mapCollections[index] = { ...processedData, id };
      await baseService.saveData(data);
      return data.mapCollections[index];
    }
    
    throw new Error('Map collection not found');
  },

  async deleteMapCollection(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.mapCollections.findIndex(collection => collection.id === id);
    
    if (index !== -1) {
      const deleted = data.mapCollections.splice(index, 1)[0];
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Map collection not found');
  },

  async toggleMapCollectionActive(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.mapCollections.findIndex(collection => collection.id === id);
    
    if (index !== -1) {
      data.mapCollections[index].isActive = !data.mapCollections[index].isActive;
      await baseService.saveData(data);
      return data.mapCollections[index];
    }
    
    throw new Error('Map collection not found');
  },

  // Helper methods
  async getMapsInCollection(collectionId) {
    await delay(50);
    const data = await baseService.loadData();
    const collection = data.mapCollections.find(c => c.id === collectionId);
    if (!collection) {
      throw new Error('Map collection not found');
    }
    
    return data.maps.filter(map => collection.mapIds.includes(map.id));
  },

  async getIndividualMaps() {
    await delay(50);
    const data = await baseService.loadData();
    
    // Get all map IDs that are part of collections
    const collectionMapIds = new Set();
    data.mapCollections.forEach(collection => {
      collection.mapIds.forEach(mapId => collectionMapIds.add(mapId));
    });
    
    // Return maps that are NOT part of any collection
    return data.maps.filter(map => !collectionMapIds.has(map.id));
  },

  async isMapInCollection(mapId) {
    await delay(50);
    const data = await baseService.loadData();
    
    return data.mapCollections.some(collection => 
      collection.mapIds.includes(mapId)
    );
  },

  async getCollectionForMap(mapId) {
    await delay(50);
    const data = await baseService.loadData();
    
    return data.mapCollections.find(collection => 
      collection.mapIds.includes(mapId)
    );
  }
};