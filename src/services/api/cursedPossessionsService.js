// services/cursedPossessionsService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cursedPossessionsService = {
  async getCursedPossessions() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.cursedPossessions];
  },

  async getCursedPossessionById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.cursedPossessions.find(possession => possession.id === id);
  },

  async getActiveCursedPossessions() {
    await delay(50);
    const data = await baseService.loadData();
    return data.cursedPossessions.filter(possession => possession.isActive);
  },

  async createCursedPossession(possessionData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Check for duplicate names
    const existingPossession = data.cursedPossessions.find(p => 
      p.name.toLowerCase() === possessionData.name.toLowerCase()
    );
    if (existingPossession) {
      throw new Error('Cursed possession with this name already exists');
    }
    
    const newPossession = {
      ...possessionData,
      id: baseService.getNextId(data.cursedPossessions),
      isActive: possessionData.isActive !== undefined ? possessionData.isActive : true,
      sequence: possessionData.sequence !== undefined ? possessionData.sequence : data.cursedPossessions.length + 1
    };
    
    data.cursedPossessions.push(newPossession);
    await baseService.saveData(data);
    return newPossession;
  },

  async updateCursedPossession(id, possessionData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.cursedPossessions.findIndex(possession => possession.id === id);
    
    if (index !== -1) {
      // Check for duplicate names (excluding current possession)
      const existingPossession = data.cursedPossessions.find(p => 
        p.id !== id && p.name.toLowerCase() === possessionData.name.toLowerCase()
      );
      if (existingPossession) {
        throw new Error('Cursed possession with this name already exists');
      }
      
      data.cursedPossessions[index] = { ...possessionData, id };
      await baseService.saveData(data);
      return data.cursedPossessions[index];
    }
    
    throw new Error('Cursed possession not found');
  },

  async deleteCursedPossession(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.cursedPossessions.findIndex(possession => possession.id === id);
    
    if (index !== -1) {
      const deleted = data.cursedPossessions.splice(index, 1)[0];
      
      // Note: We don't delete runs when cursed possessions are deleted
      // as runs should maintain historical data
      
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Cursed possession not found');
  },

  async toggleCursedPossessionActive(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.cursedPossessions.findIndex(possession => possession.id === id);
    
    if (index !== -1) {
      data.cursedPossessions[index].isActive = !data.cursedPossessions[index].isActive;
      await baseService.saveData(data);
      return data.cursedPossessions[index];
    }
    
    throw new Error('Cursed possession not found');
  }
};