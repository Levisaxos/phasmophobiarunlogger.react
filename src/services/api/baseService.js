// services/baseService.js
// Base service for common localStorage operations - Updated with challenge modes

const STORAGE_KEY = 'phasmophobia-data';
let dataCache = null;

// Empty data structure - everything must be configured by the user
const emptyData = {
  maps: [],
  ghosts: [],
  runs: [],
  players: [],
  gameModes: [],
  evidence: [],
  cursedPossessions: [],
  mapCollections: [],
  challengeModes: [] // New: challenge modes
};

// Simulate async operations
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const baseService = {
  async loadData() {
    try {
      if (dataCache) {
        return dataCache;
      }

      const storedData = localStorage.getItem(STORAGE_KEY);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Ensure all required arrays exist but keep them empty if not present
        if (!data.runs) data.runs = [];
        if (!data.players) data.players = [];
        if (!data.gameModes) data.gameModes = [];
        if (!data.evidence) data.evidence = [];
        if (!data.cursedPossessions) data.cursedPossessions = [];
        if (!data.maps) data.maps = [];
        if (!data.ghosts) data.ghosts = [];
        if (!data.mapCollections) data.mapCollections = [];
        if (!data.challengeModes) data.challengeModes = []; // Add challenge modes
        
        // Migrate existing data if needed
        await this.migrateData(data);
        
        dataCache = data;
        return data;
      } else {
        // No existing data - start with completely empty structure
        await this.saveData(emptyData);
        dataCache = emptyData;
        return emptyData;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // If there's an error, return empty data structure
      dataCache = emptyData;
      return emptyData;
    }
  },

  async saveData(data) {
    await delay(50);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      dataCache = data;
    } catch (error) {
      console.error('Error saving data:', error);
      throw new Error('Failed to save data: ' + error.message);
    }
  },

  async getAllData() {
    return await this.loadData();
  },

  getNextId(array) {
    if (!array || array.length === 0) return 1;
    return Math.max(...array.map(item => item.id || 0)) + 1;
  },

  async migrateData(data) {
    let hasChanges = false;

    // Migration for run data - ensure players array format
    if (data.runs && Array.isArray(data.runs)) {
      data.runs.forEach(run => {
        // Migrate legacy player data
        if (run.players && Array.isArray(run.players) && 
            run.players.length > 0 && typeof run.players[0] === 'string') {
          // Convert string array to object array with status
          const playerStates = run.playerStates || {};
          run.players = run.players.map(playerName => ({
            id: this.getNextId([]), // Simple ID generation for migration
            name: playerName,
            status: playerStates[playerName] || 'alive'
          }));
          hasChanges = true;
        }
        
        // Ensure evidence array exists
        if (!run.evidence) {
          run.evidence = [];
          hasChanges = true;
        }
        
        // Ensure cursed possessions array exists
        if (!run.cursedPossessions) {
          run.cursedPossessions = [];
          hasChanges = true;
        }
      });
    }

    // Migration for maps - ensure floors structure
    if (data.maps && Array.isArray(data.maps)) {
      data.maps.forEach(map => {
        if (!map.floors && map.rooms && Array.isArray(map.rooms)) {
          // Convert old room array to floors structure
          map.floors = [
            {
              id: 1,
              name: 'First Floor',
              order: 0,
              rooms: map.rooms.map((roomName, index) => ({
                id: index + 1,
                name: roomName
              }))
            }
          ];
          delete map.rooms; // Remove old rooms array
          hasChanges = true;
        }
      });
    }

    // Save changes if any migrations occurred
    if (hasChanges) {
      await this.saveData(data);
    }
  },

  async exportToFile(filename = 'phasmophobia-data.json') {
    const data = await this.loadData();
    const jsonString = JSON.stringify(data, null, 2);
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  },

  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data && typeof data === 'object') {
            // Ensure required arrays exist but don't add defaults
            if (!data.runs) data.runs = [];
            if (!data.players) data.players = [];
            if (!data.gameModes) data.gameModes = [];
            if (!data.evidence) data.evidence = [];
            if (!data.cursedPossessions) data.cursedPossessions = [];
            if (!data.maps) data.maps = [];
            if (!data.ghosts) data.ghosts = [];
            if (!data.mapCollections) data.mapCollections = [];
            if (!data.challengeModes) data.challengeModes = []; // Ensure challenge modes exist
            
            await this.saveData(data);
            resolve(data);
          } else {
            reject(new Error('Invalid file format'));
          }
        } catch (error) {
          reject(new Error('Invalid JSON file: ' + error.message));
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  },

  clearCache() {
    dataCache = null;
  }
};