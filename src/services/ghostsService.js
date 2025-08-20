// services/ghostsService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const ghostsService = {
  async getGhosts() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.ghosts];
  },

  async getGhostById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.ghosts.find(ghost => ghost.id === id);
  },

  async createGhost(ghostData) {
    await delay(100);
    const data = await baseService.loadData();
    
    const newGhost = {
      ...ghostData,
      id: baseService.getNextId(data.ghosts)
    };
    
    data.ghosts.push(newGhost);
    await baseService.saveData(data);
    return newGhost;
  },

  async updateGhost(id, ghostData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.ghosts.findIndex(ghost => ghost.id === id);
    
    if (index !== -1) {
      data.ghosts[index] = { ...ghostData, id };
      await baseService.saveData(data);
      return data.ghosts[index];
    }
    
    throw new Error('Ghost not found');
  },

  async deleteGhost(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.ghosts.findIndex(ghost => ghost.id === id);
    
    if (index !== -1) {
      const deleted = data.ghosts.splice(index, 1)[0];
      
      // Remove related runs
      data.runs = data.runs.filter(run => run.ghostId !== id);
      
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Ghost not found');
  }
};