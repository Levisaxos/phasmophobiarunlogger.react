// src/services/api/challengeModesService.js - Enhanced with map collection support (Clean version)
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const challengeModesService = {
  async getChallengeModes() {
    await delay(100);
    const data = await baseService.loadData();
    return [...(data.challengeModes || [])];
  },

  async getChallengeModeById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return (data.challengeModes || []).find(challengeMode => challengeMode.id === id);
  },

  async getChallengeModesWithoutArchived() {
    await delay(100);
    const data = await baseService.loadData();
    return (data.challengeModes || []).filter(cm => !cm.isArchived);
  },

  async getChallengeModesForGameMode(gameModeId) {
    await delay(50);
    const data = await baseService.loadData();
    // For now, return all active challenge modes
    // Could be enhanced to filter by game mode if needed
    return (data.challengeModes || []).filter(cm => !cm.isArchived);
  },

  async getChallengeModesForMap(mapId) {
    await delay(50);
    const data = await baseService.loadData();
    return (data.challengeModes || []).filter(cm => 
      !cm.isArchived && cm.mapId === mapId
    );
  },

  async getChallengeModesForMapCollection(mapCollectionId) {
    await delay(50);
    const data = await baseService.loadData();
    return (data.challengeModes || []).filter(cm => 
      !cm.isArchived && cm.mapCollectionId === mapCollectionId
    );
  },

  async getChallengeModById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return (data.challengeModes || []).find(challengeMode => challengeMode.id === id);
  },

  async createChallengeMode(challengeModeData) {
    await delay(100);
    const data = await baseService.loadData();
    
    if (!data.challengeModes) {
      data.challengeModes = [];
    }
    
    // Check for duplicate names
    const existingChallengeMode = data.challengeModes.find(cm => 
      cm.name.toLowerCase() === challengeModeData.name.toLowerCase()
    );
    if (existingChallengeMode) {
      throw new Error('Challenge mode with this name already exists');
    }
    
    // Validate that either map or mapCollection exists, but not both
    const hasMap = challengeModeData.mapId;
    const hasMapCollection = challengeModeData.mapCollectionId;
    
    if (!hasMap && !hasMapCollection) {
      throw new Error('Challenge mode must have either a map or map collection');
    }
    
    if (hasMap && hasMapCollection) {
      throw new Error('Challenge mode cannot have both a map and map collection');
    }
    
    // Validate that the map exists (if provided)
    if (hasMap) {
      const mapExists = data.maps && data.maps.find(map => map.id === challengeModeData.mapId);
      if (!mapExists) {
        throw new Error('Selected map does not exist');
      }
    }
    
    // Validate that the map collection exists (if provided)
    if (hasMapCollection) {
      const mapCollectionExists = data.mapCollections && 
        data.mapCollections.find(mc => mc.id === challengeModeData.mapCollectionId);
      if (!mapCollectionExists) {
        throw new Error('Selected map collection does not exist');
      }
    }
    
    const newChallengeMode = {
      ...challengeModeData,
      id: baseService.getNextId(data.challengeModes),
      isArchived: false
    };
    
    data.challengeModes.push(newChallengeMode);
    await baseService.saveData(data);
    return newChallengeMode;
  },

  async updateChallengeMode(id, challengeModeData) {
    await delay(100);
    const data = await baseService.loadData();
    
    if (!data.challengeModes) {
      data.challengeModes = [];
    }
    
    const index = data.challengeModes.findIndex(challengeMode => challengeMode.id === id);
    
    if (index !== -1) {
      // Check for duplicate names (excluding current challenge mode)
      const existingChallengeMode = data.challengeModes.find(cm => 
        cm.id !== id && cm.name.toLowerCase() === challengeModeData.name.toLowerCase()
      );
      if (existingChallengeMode) {
        throw new Error('Challenge mode with this name already exists');
      }
      
      // Validate that either map or mapCollection exists, but not both
      const hasMap = challengeModeData.mapId;
      const hasMapCollection = challengeModeData.mapCollectionId;
      
      if (!hasMap && !hasMapCollection) {
        throw new Error('Challenge mode must have either a map or map collection');
      }
      
      if (hasMap && hasMapCollection) {
        throw new Error('Challenge mode cannot have both a map and map collection');
      }
      
      // Validate that the map exists (if provided)
      if (hasMap) {
        const mapExists = data.maps && data.maps.find(map => map.id === challengeModeData.mapId);
        if (!mapExists) {
          throw new Error('Selected map does not exist');
        }
      }
      
      // Validate that the map collection exists (if provided)
      if (hasMapCollection) {
        const mapCollectionExists = data.mapCollections && 
          data.mapCollections.find(mc => mc.id === challengeModeData.mapCollectionId);
        if (!mapCollectionExists) {
          throw new Error('Selected map collection does not exist');
        }
      }
      
      const updatedChallengeMode = {
        ...data.challengeModes[index],
        ...challengeModeData,
        id
      };
      
      data.challengeModes[index] = updatedChallengeMode;
      await baseService.saveData(data);
      return data.challengeModes[index];
    }
    
    throw new Error('Challenge mode not found');
  },

  async deleteChallengeMode(id) {
    await delay(100);
    const data = await baseService.loadData();
    
    if (!data.challengeModes) {
      data.challengeModes = [];
    }
    
    const index = data.challengeModes.findIndex(challengeMode => challengeMode.id === id);
    
    if (index !== -1) {
      data.challengeModes.splice(index, 1);
      await baseService.saveData(data);
      return true;
    }
    
    throw new Error('Challenge mode not found');
  },

  async archiveChallengeMode(id) {
    await delay(100);
    const data = await baseService.loadData();
    
    if (!data.challengeModes) {
      data.challengeModes = [];
    }
    
    const index = data.challengeModes.findIndex(challengeMode => challengeMode.id === id);
    
    if (index !== -1) {
      data.challengeModes[index].isArchived = true;
      await baseService.saveData(data);
      return data.challengeModes[index];
    }
    
    throw new Error('Challenge mode not found');
  },

  async unarchiveChallengeMode(id) {
    await delay(100);
    const data = await baseService.loadData();
    
    if (!data.challengeModes) {
      data.challengeModes = [];
    }
    
    const index = data.challengeModes.findIndex(challengeMode => challengeMode.id === id);
    
    if (index !== -1) {
      data.challengeModes[index].isArchived = false;
      await baseService.saveData(data);
      return data.challengeModes[index];
    }
    
    throw new Error('Challenge mode not found');
  }
};