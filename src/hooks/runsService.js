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
    
    // Derive player count from players array
    const playerCount = runData.players ? runData.players.length : 0;
    const runNumber = await this.getTodaysRunNumber(playerCount);
    
    // Derive date from timestamp
    const timestamp = runData.timestamp || new Date().toISOString();
    const date = timestamp.split('T')[0];
    
    // Create the normalized run object
    const newRun = {
      ...runData,
      id: baseService.getNextId(data.runs),
      runNumber,
      timestamp,
      date,
      playerCount, // Derived from players array
      
      // For backward compatibility, also create legacy fields
      // These can be removed once all UI components are updated
      ...(runData.players && {
        // Legacy player names array for backward compatibility
        playersLegacy: runData.players.map(p => p.name || p),
        // Legacy player states object for backward compatibility  
        playerStates: runData.players.reduce((acc, player) => {
          const playerName = player.name || player;
          const playerStatus = player.status || 'alive';
          acc[playerName] = playerStatus;
          return acc;
        }, {})
      })
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
      // Update with normalized structure while preserving ID
      const updatedRun = { 
        ...runData, 
        id,
        // Recalculate derived fields
        playerCount: runData.players ? runData.players.length : 0,
        date: runData.timestamp ? runData.timestamp.split('T')[0] : data.runs[index].date
      };
      
      data.runs[index] = updatedRun;
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