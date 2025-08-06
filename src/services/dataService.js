// Default data structure for initialization
const defaultData = {
  maps: [],
  ghosts: [],
  runs: []
};

const STORAGE_KEY = 'phasmophobia-data';

// Cache for in-memory data
let dataCache = null;

// Simulate async operations for consistency with your existing code
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const dataService = {
  // Maps operations
  async getMaps() {
    await delay(100); // Simulate file read delay
    const data = await this.loadFromFile();
    return [...data.maps];
  },

  async getMapById(id) {
    await delay(50);
    const data = await this.loadFromFile();
    return data.maps.find(map => map.id === id);
  },

  async createMap(mapData) {
    await delay(100);
    const data = await this.loadFromFile();
    const newMap = {
      ...mapData,
      id: Math.max(...data.maps.map(m => m.id), 0) + 1
    };
    data.maps.push(newMap);
    await this.saveToFile('data.json', data);
    return newMap;
  },

  async updateMap(id, mapData) {
    await delay(100);
    const data = await this.loadFromFile();
    const index = data.maps.findIndex(map => map.id === id);
    if (index !== -1) {
      data.maps[index] = { ...mapData, id };
      await this.saveToFile('data.json', data);
      return data.maps[index];
    }
    throw new Error('Map not found');
  },

  async deleteMap(id) {
    await delay(100);
    const data = await this.loadFromFile();
    const index = data.maps.findIndex(map => map.id === id);
    if (index !== -1) {
      const deleted = data.maps.splice(index, 1)[0];
      // Also remove ghosts associated with this map
      data.ghosts = data.ghosts.filter(ghost => ghost.mapId !== id);
      // Also remove runs associated with this map
      data.runs = data.runs.filter(run => run.mapId !== id);
      await this.saveToFile('data.json', data);
      return deleted;
    }
    throw new Error('Map not found');
  },

  // Ghosts operations
  async getGhosts() {
    await delay(100);
    const data = await this.loadFromFile();
    return [...data.ghosts];
  },

  async getGhostById(id) {
    await delay(50);
    const data = await this.loadFromFile();
    return data.ghosts.find(ghost => ghost.id === id);
  },

  async getGhostsByMapId(mapId) {
    await delay(50);
    const data = await this.loadFromFile();
    return data.ghosts.filter(ghost => ghost.mapId === mapId);
  },

  async createGhost(ghostData) {
    await delay(100);
    const data = await this.loadFromFile();
    const newGhost = {
      ...ghostData,
      id: Math.max(...data.ghosts.map(g => g.id), 0) + 1
    };
    data.ghosts.push(newGhost);
    await this.saveToFile('data.json', data);
    return newGhost;
  },

  async updateGhost(id, ghostData) {
    await delay(100);
    const data = await this.loadFromFile();
    const index = data.ghosts.findIndex(ghost => ghost.id === id);
    if (index !== -1) {
      data.ghosts[index] = { ...ghostData, id };
      await this.saveToFile('data.json', data);
      return data.ghosts[index];
    }
    throw new Error('Ghost not found');
  },

  async deleteGhost(id) {
    await delay(100);
    const data = await this.loadFromFile();
    const index = data.ghosts.findIndex(ghost => ghost.id === id);
    if (index !== -1) {
      const deleted = data.ghosts.splice(index, 1)[0];
      // Also remove runs associated with this ghost
      data.runs = data.runs.filter(run => run.ghostId !== id);
      await this.saveToFile('data.json', data);
      return deleted;
    }
    throw new Error('Ghost not found');
  },

  // Runs operations
  async getRuns() {
    await delay(100);
    const data = await this.loadFromFile();
    return [...data.runs];
  },

  async getRunById(id) {
    await delay(50);
    const data = await this.loadFromFile();
    return data.runs.find(run => run.id === id);
  },

  async getRunsByDate(date) {
    await delay(50);
    const data = await this.loadFromFile();
    return data.runs.filter(run => run.date === date);
  },

  async getRunsByDateAndPlayerCount(date, playerCount) {
    await delay(50);
    const data = await this.loadFromFile();
    return data.runs.filter(run => run.date === date && run.playerCount === playerCount);
  },

  async getTodaysRunNumber(playerCount) {
    const today = new Date().toISOString().split('T')[0];
    const todaysRuns = await this.getRunsByDateAndPlayerCount(today, playerCount);
    return todaysRuns.length + 1;
  },

  async createRun(runData) {
    await delay(100);
    const data = await this.loadFromFile();
    
    // Get the next run number for today with this player count
    const runNumber = await this.getTodaysRunNumber(runData.playerCount);
    
    const newRun = {
      ...runData,
      id: Math.max(...data.runs.map(r => r.id || 0), 0) + 1,
      runNumber,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      
      // New fields
      actualGhostId: runData.actualGhostId || runData.ghostId, // Default to guessed ghost if no actual ghost provided
      actualGhostName: runData.actualGhostName || runData.ghostName,
      playerStates: runData.playerStates || {}, // Object mapping player names to 'alive'/'dead'
      isPerfectGame: runData.isPerfectGame || false,
      
      // Cursed possession fields
      cursedPossessionId: runData.cursedPossessionId || null,
      cursedPossessionName: runData.cursedPossessionName || null,
      
      // wasCorrect is now calculated based on ghost comparison
      wasCorrect: runData.actualGhostId ? runData.ghostId === runData.actualGhostId : true
    };
    
    data.runs.push(newRun);
    await this.saveToFile('data.json', data);
    return newRun;
  },

  async updateRun(id, runData) {
    await delay(100);
    const data = await this.loadFromFile();
    const index = data.runs.findIndex(run => run.id === id);
    if (index !== -1) {
      data.runs[index] = { ...runData, id };
      await this.saveToFile('data.json', data);
      return data.runs[index];
    }
    throw new Error('Run not found');
  },

  async deleteRun(id) {
    await delay(100);
    const data = await this.loadFromFile();
    const index = data.runs.findIndex(run => run.id === id);
    if (index !== -1) {
      const deleted = data.runs.splice(index, 1)[0];
      await this.saveToFile('data.json', data);
      return deleted;
    }
    throw new Error('Run not found');
  },

  // localStorage operations (replaces file I/O)
  async loadFromFile(filename = 'data.json') {
    try {
      // Use cache if available to avoid repeated localStorage reads
      if (dataCache) {
        return dataCache;
      }

      const storedData = localStorage.getItem(STORAGE_KEY);
      
      if (storedData) {
        const data = JSON.parse(storedData);
        
        // Ensure the data structure includes runs array for backward compatibility
        if (!data.runs) {
          data.runs = [];
        }
        
        // Cache the data
        dataCache = data;
        console.log(`Loaded data from localStorage`);
        return data;
      } else {
        // No data exists, initialize with default data
        console.log(`No data found in localStorage, initializing with default data`);
        await this.saveToFile(filename, defaultData);
        dataCache = defaultData;
        return defaultData;
      }
    } catch (error) {
      console.error(`Error loading data from localStorage:`, error);
      // If there's an error, fall back to default data
      dataCache = defaultData;
      return defaultData;
    }
  },

  async saveToFile(filename = 'data.json', data = null) {
    try {
      const dataToSave = data || dataCache || defaultData;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Update cache
      dataCache = dataToSave;
      
      console.log(`Saved data to localStorage`);
      await delay(50);
    } catch (error) {
      console.error(`Error saving data to localStorage:`, error);
      throw error;
    }
  },

  // Utility methods
  async getAllData() {
    await delay(100);
    const data = await this.loadFromFile();
    return {
      maps: [...data.maps],
      ghosts: [...data.ghosts],
      runs: [...data.runs]
    };
  },

  async resetData() {
    const emptyData = { maps: [], ghosts: [], runs: [] };
    await this.saveToFile('data.json', emptyData);
  },

  // Export/Import functionality for file backup/restore
  async exportToFile(filename = 'phasmophobia-data.json') {
    const data = await this.getAllData();
    const jsonString = JSON.stringify(data, null, 2);
    
    // Create a blob and download it
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    console.log(`Exported data to ${filename}`);
  },

  async importFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validate the data structure
          if (data && typeof data === 'object' && Array.isArray(data.maps) && Array.isArray(data.ghosts)) {
            // Ensure runs array exists for backward compatibility
            if (!data.runs) {
              data.runs = [];
            }
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            dataCache = data; // Update cache
            console.log('Data imported successfully from file');
            resolve(data);
          } else {
            reject(new Error('Invalid file format: missing maps or ghosts arrays'));
          }
        } catch (error) {
          reject(new Error('Invalid JSON file: ' + error.message));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  },

  // Clear all data from localStorage (useful for debugging)
  async clearAllData() {
    localStorage.removeItem(STORAGE_KEY);
    dataCache = null;
    console.log('All data cleared from localStorage');
  }
};