// services/api/challengeModesService.js
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
    
    // Validate that the map exists
    const mapExists = data.maps && data.maps.find(map => map.id === challengeModeData.mapId);
    if (!mapExists) {
      throw new Error('Selected map does not exist');
    }
    
    const newChallengeMode = {
      ...challengeModeData,
      id: baseService.getNextId(data.challengeModes)
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
      
      // Validate that the map exists
      const mapExists = data.maps && data.maps.find(map => map.id === challengeModeData.mapId);
      if (!mapExists) {
        throw new Error('Selected map does not exist');
      }
      
      const updatedChallengeMode = {
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
  }
};