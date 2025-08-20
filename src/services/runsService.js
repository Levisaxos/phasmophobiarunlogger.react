// services/runsService.js
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const runsService = {
  async getRuns() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.runs];
  },

  async getRunById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.runs.find(run => run.id === id);
  },

  async getRunsByDate(date) {
    await delay(50);
    const data = await baseService.loadData();
    return data.runs.filter(run => run.date === date);
  },

  async getRunsByDateAndPlayerCount(date, playerCount) {
    await delay(50);
    const data = await baseService.loadData();
    return data.runs.filter(run => run.date === date && run.playerCount === playerCount);
  },

  async getTodaysRunNumber(playerCount) {
    const today = new Date().toISOString().split('T')[0];
    const todaysRuns = await this.getRunsByDateAndPlayerCount(today, playerCount);
    return todaysRuns.length + 1;
  },

  async createRun(runData) {
    await delay(100);
    const data = await baseService.loadData();
    
    const runNumber = await this.getTodaysRunNumber(runData.playerCount);
    
    const newRun = {
      ...runData,
      id: baseService.getNextId(data.runs),
      runNumber,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      
      // Ensure these fields exist
      actualGhostId: runData.actualGhostId || runData.ghostId,
      actualGhostName: runData.actualGhostName || runData.ghostName,
      playerStates: runData.playerStates || {},
      isPerfectGame: runData.isPerfectGame || false,
      cursedPossessionId: runData.cursedPossessionId || null,
      cursedPossessionName: runData.cursedPossessionName || null,
      gameModeId: runData.gameModeId || null,
      gameModeName: runData.gameModeName || null,
      
      // Calculate correctness
      wasCorrect: runData.actualGhostId ? runData.ghostId === runData.actualGhostId : true
    };
    
    data.runs.push(newRun);
    await baseService.saveData(data);
    return newRun;
  },

  async updateRun(id, runData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.runs.findIndex(run => run.id === id);
    
    if (index !== -1) {
      data.runs[index] = { ...runData, id };
      await baseService.saveData(data);
      return data.runs[index];
    }
    
    throw new Error('Run not found');
  },

  async deleteRun(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.runs.findIndex(run => run.id === id);
    
    if (index !== -1) {
      const deleted = data.runs.splice(index, 1)[0];
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Run not found');
  }
};