// src/services/api/runsService.js - Updated with timer support and challenge mode support
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const runsService = {
  async getRuns() {
    await delay(100);
    const data = await baseService.loadData();
    return data.runs.map(run => this.enrichRunData(run));
  },

  async getRunById(id) {
    await delay(50);
    const data = await baseService.loadData();
    const run = data.runs.find(run => run.id === id);
    return run ? this.enrichRunData(run) : null;
  },

  async getRunsByDate(date) {
    await delay(50);
    const data = await baseService.loadData();
    return data.runs
      .filter(run => this.getDateFromTimestamp(run.timestamp) === date)
      .map(run => this.enrichRunData(run));
  },

  async getRunsByDateAndPlayerCount(date, playerCount) {
    await delay(50);
    const data = await baseService.loadData();
    return data.runs
      .filter(run => {
        const runDate = this.getDateFromTimestamp(run.timestamp);
        const runPlayerCount = run.players ? run.players.length : 0;
        return runDate === date && runPlayerCount === playerCount;
      })
      .map(run => this.enrichRunData(run));
  },

  async getTodaysRunNumber(playerCount) {
    const today = new Date().toISOString().split('T')[0];
    const todaysRuns = await this.getRunsByDateAndPlayerCount(today, playerCount);
    return todaysRuns.length + 1;
  },

  async createRun(runData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Calculate player count for run numbering
    const playerCount = runData.players ? runData.players.length : 0;
    const runNumber = await this.getTodaysRunNumber(playerCount);
    
    // Store only essential data - no redundant fields
    const cleanRunData = {
      // Core identifiers
      id: baseService.getNextId(data.runs),
      runNumber,
      timestamp: runData.timestamp || new Date().toISOString(),
      
      // Game setup
      mapId: runData.mapId,
      roomId: runData.roomId,
      roomName: runData.roomName, // Keep for backward compatibility during transition
      cursedPossessionId: runData.cursedPossessionId || null,
      evidenceIds: runData.evidenceIds || [],
      gameModeId: runData.gameModeId || null,
      challengeModeId: runData.challengeModeId || null, // Add challenge mode ID support
      
      // Ghost identification
      ghostId: runData.ghostId,
      actualGhostId: runData.actualGhostId || runData.ghostId,
      
      // Player data with embedded status (replaces playerStates and playersLegacy)
      players: runData.players || [],
      
      // Game outcome
      isPerfectGame: runData.isPerfectGame || false,
      
      // Timer data
      runTimeSeconds: runData.runTimeSeconds || null
    };
    
    data.runs.push(cleanRunData);
    await baseService.saveData(data);
    
    // Return enriched data for immediate use
    return this.enrichRunData(cleanRunData);
  },

  async updateRun(id, runData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.runs.findIndex(run => run.id === id);
    
    if (index !== -1) {
      // Update with clean structure while preserving ID and runNumber
      const updatedRun = {
        ...runData,
        id,
        runNumber: data.runs[index].runNumber,
        timestamp: runData.timestamp || data.runs[index].timestamp
      };
      
      data.runs[index] = updatedRun;
      await baseService.saveData(data);
      return this.enrichRunData(data.runs[index]);
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
      return this.enrichRunData(deleted);
    }
    
    throw new Error('Run not found');
  },

  // Helper methods to calculate derived data
  getDateFromTimestamp(timestamp) {
    return timestamp.split('T')[0];
  },

  getPlayerCount(players) {
    return players ? players.length : 0;
  },

  getPlayerStates(players) {
    const states = {};
    if (players && Array.isArray(players)) {
      players.forEach(player => {
        const playerName = typeof player === 'object' ? player.name : player;
        const playerStatus = typeof player === 'object' ? player.status : 'alive';
        if (playerName) {
          states[playerName] = playerStatus;
        }
      });
    }
    return states;
  },

  getPlayersLegacy(players) {
    if (players && Array.isArray(players)) {
      return players.map(player => typeof player === 'object' ? player.name : player);
    }
    return [];
  },

  wasCorrect(ghostId, actualGhostId) {
    return ghostId === actualGhostId;
  },

  formatRunTime(seconds) {
    if (!seconds || seconds === 0) return null;
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  },

  // Enrich stored data with calculated fields for backward compatibility
  // This ensures all existing UI components continue to work
  enrichRunData(run) {
    return {
      ...run,
      // Calculated fields for backward compatibility with existing UI
      date: this.getDateFromTimestamp(run.timestamp),
      playerCount: this.getPlayerCount(run.players),
      playerStates: this.getPlayerStates(run.players),
      playersLegacy: this.getPlayersLegacy(run.players),
      wasCorrect: this.wasCorrect(run.ghostId, run.actualGhostId),
      formattedRunTime: this.formatRunTime(run.runTimeSeconds)
    };
  }
};