// services/playersService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const playersService = {
  async getPlayers() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.players];
  },

  async getPlayerById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.players.find(player => player.id === id);
  },

  async getActivePlayers() {
    await delay(50);
    const data = await baseService.loadData();
    return data.players.filter(player => player.isActive);
  },

  async getDefaultPlayers() {
    await delay(50);
    const data = await baseService.loadData();
    return data.players.filter(player => player.isActive && player.isDefault);
  },

  async createPlayer(playerData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Check for duplicate names
    const existingPlayer = data.players.find(p => 
      p.name.toLowerCase() === playerData.name.toLowerCase()
    );
    if (existingPlayer) {
      throw new Error('Player with this name already exists');
    }

    // Check default player limit (max 4)
    if (playerData.isDefault) {
      const currentDefaultCount = data.players.filter(p => p.isDefault).length;
      if (currentDefaultCount >= 4) {
        throw new Error('Maximum of 4 players can be set as default');
      }
    }
    
    const newPlayer = {
      ...playerData,
      id: baseService.getNextId(data.players),
      isActive: playerData.isActive !== undefined ? playerData.isActive : true,
      isDefault: playerData.isDefault !== undefined ? playerData.isDefault : false
    };
    
    data.players.push(newPlayer);
    await baseService.saveData(data);
    return newPlayer;
  },

  async updatePlayer(id, playerData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.players.findIndex(player => player.id === id);
    
    if (index !== -1) {
      // Check for duplicate names (excluding current player)
      const existingPlayer = data.players.find(p => 
        p.id !== id && p.name.toLowerCase() === playerData.name.toLowerCase()
      );
      if (existingPlayer) {
        throw new Error('Player with this name already exists');
      }

      // Check default player limit (max 4) - only if setting as default
      if (playerData.isDefault && !data.players[index].isDefault) {
        const currentDefaultCount = data.players.filter(p => p.isDefault && p.id !== id).length;
        if (currentDefaultCount >= 4) {
          throw new Error('Maximum of 4 players can be set as default');
        }
      }
      
      data.players[index] = { ...playerData, id };
      
      await baseService.saveData(data);
      return data.players[index];
    }
    
    throw new Error('Player not found');
  },

  async deletePlayer(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.players.findIndex(player => player.id === id);
    
    if (index !== -1) {
      const deleted = data.players.splice(index, 1)[0];
      
      // Note: We don't delete runs when players are deleted
      // as runs should maintain historical data
      
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Player not found');
  },

  async togglePlayerActive(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.players.findIndex(player => player.id === id);
    
    if (index !== -1) {
      data.players[index].isActive = !data.players[index].isActive;
      
      // If making inactive, also remove default status
      if (!data.players[index].isActive) {
        data.players[index].isDefault = false;
      }
      
      await baseService.saveData(data);
      return data.players[index];
    }
    
    throw new Error('Player not found');
  }
};