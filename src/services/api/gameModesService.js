// services/gameModesService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const gameModesService = {
  async getGameModes() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.gameModes];
  },

  async getGameModeById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.gameModes.find(gameMode => gameMode.id === id);
  },

  async getActiveGameModes() {
    await delay(50);
    const data = await baseService.loadData();
    return data.gameModes.filter(gameMode => gameMode.isActive);
  },

  async createGameMode(gameModeData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Check for duplicate names
    const existingGameMode = data.gameModes.find(gm => 
      gm.name.toLowerCase() === gameModeData.name.toLowerCase()
    );
    if (existingGameMode) {
      throw new Error('Game mode with this name already exists');
    }
    
    const newGameMode = {
      ...gameModeData,
      id: baseService.getNextId(data.gameModes),
      isActive: gameModeData.isActive !== undefined ? gameModeData.isActive : true
    };
    
    data.gameModes.push(newGameMode);
    await baseService.saveData(data);
    return newGameMode;
  },

  async updateGameMode(id, gameModeData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.gameModes.findIndex(gameMode => gameMode.id === id);
    
    if (index !== -1) {
      // Check for duplicate names (excluding current game mode)
      const existingGameMode = data.gameModes.find(gm => 
        gm.id !== id && gm.name.toLowerCase() === gameModeData.name.toLowerCase()
      );
      if (existingGameMode) {
        throw new Error('Game mode with this name already exists');
      }
      
      data.gameModes[index] = { ...gameModeData, id };
      await baseService.saveData(data);
      return data.gameModes[index];
    }
    
    throw new Error('Game mode not found');
  },

  async deleteGameMode(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.gameModes.findIndex(gameMode => gameMode.id === id);
    
    if (index !== -1) {
      const deleted = data.gameModes.splice(index, 1)[0];
      
      // Note: We don't delete runs when game modes are deleted
      // as runs should maintain historical data
      
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Game mode not found');
  },

  async toggleGameModeActive(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.gameModes.findIndex(gameMode => gameMode.id === id);
    
    if (index !== -1) {
      data.gameModes[index].isActive = !data.gameModes[index].isActive;
      await baseService.saveData(data);
      return data.gameModes[index];
    }
    
    throw new Error('Game mode not found');
  }
};