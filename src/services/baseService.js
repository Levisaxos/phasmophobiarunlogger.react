// services/baseService.js
// Base service for common localStorage operations - NO DEFAULT DATA

const STORAGE_KEY = 'phasmophobia-data';
let dataCache = null;

// Completely empty data structure - everything must be configured by the user
const emptyData = {
  maps: [],
  ghosts: [],
  runs: [],
  players: [],
  gameModes: [],
  evidence: [],
  cursedPossessions: []
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
      // Even on error, return empty data instead of defaults
      dataCache = emptyData;
      return emptyData;
    }
  },

  async migrateData(data) {
    let needsSaving = false;

    // Migrate ghosts from evidence names to evidence IDs
    if (data.ghosts && data.evidence) {
      data.ghosts.forEach(ghost => {
        if (ghost.evidence && !ghost.evidenceIds) {
          ghost.evidenceIds = [];
          ghost.evidence.forEach(evidenceName => {
            const evidenceItem = data.evidence.find(e => e.name === evidenceName);
            if (evidenceItem) {
              ghost.evidenceIds.push(evidenceItem.id);
            }
          });
          needsSaving = true;
        }
      });
    }

    // Migrate runs from evidence names to evidence IDs
    if (data.runs && data.evidence) {
      data.runs.forEach(run => {
        if (run.evidence && !run.evidenceIds) {
          run.evidenceIds = [];
          run.evidence.forEach(evidenceName => {
            const evidenceItem = data.evidence.find(e => e.name === evidenceName);
            if (evidenceItem) {
              run.evidenceIds.push(evidenceItem.id);
            }
          });
          needsSaving = true;
        }
      });
    }

    if (needsSaving) {
      await this.saveData(data);
    }
  },

  async saveData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      dataCache = data;
      await delay(50);
    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  },

  getNextId(items) {
    return Math.max(...items.map(item => item.id || 0), 0) + 1;
  },

  // Export/Import functionality
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