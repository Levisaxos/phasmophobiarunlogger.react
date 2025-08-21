// services/api/mapsService.js - Simplified to use floors only, no redundant rooms array
import { baseService } from './baseService';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mapsService = {
  async getMaps() {
    await delay(100);
    const data = await baseService.loadData();
    return [...data.maps];
  },

  async getMapById(id) {
    await delay(50);
    const data = await baseService.loadData();
    return data.maps.find(map => map.id === id);
  },

  async getActiveMaps() {
    await delay(50);
    const data = await baseService.loadData();
    return data.maps.filter(map => !map.isArchived);
  },

  async createMap(mapData) {
    await delay(100);
    const data = await baseService.loadData();
    
    // Check for duplicate names
    const existingMap = data.maps.find(m => 
      m.name.toLowerCase() === mapData.name.toLowerCase()
    );
    if (existingMap) {
      throw new Error('Map with this name already exists');
    }
    
    // Process the map data to ensure proper room structure in floors
    const processedMapData = this.processMapFloors(mapData);
    
    const newMap = {
      ...processedMapData,
      id: baseService.getNextId(data.maps),
      isArchived: false
    };
    
    data.maps.push(newMap);
    await baseService.saveData(data);
    return newMap;
  },

  async updateMap(id, mapData) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.maps.findIndex(map => map.id === id);
    
    if (index !== -1) {
      // Check for duplicate names (excluding current map)
      const existingMap = data.maps.find(m => 
        m.id !== id && m.name.toLowerCase() === mapData.name.toLowerCase()
      );
      if (existingMap) {
        throw new Error('Map with this name already exists');
      }
      
      // Process the map data to ensure proper room structure in floors
      const processedMapData = this.processMapFloors(mapData);
      
      const updatedMap = {
        ...processedMapData,
        id
      };
      
      data.maps[index] = updatedMap;
      await baseService.saveData(data);
      return data.maps[index];
    }
    
    throw new Error('Map not found');
  },

  // Helper method to process floors and ensure rooms have proper IDs
  processMapFloors(mapData) {
    const processed = { ...mapData };
    
    // Remove redundant main rooms array
    delete processed.rooms;
    
    // Handle floors structure - ensure rooms have IDs
    if (processed.floors && Array.isArray(processed.floors)) {
      let globalRoomId = 1;
      
      processed.floors = processed.floors.map(floor => {
        const processedFloor = { ...floor };
        
        if (processedFloor.rooms && Array.isArray(processedFloor.rooms)) {
          processedFloor.rooms = processedFloor.rooms
            .filter(room => {
              const roomName = typeof room === 'string' ? room : room.name;
              return roomName && roomName.trim();
            })
            .map(room => {
              const roomName = typeof room === 'string' ? room : room.name;
              return {
                id: globalRoomId++,
                name: roomName.trim()
              };
            });
        }
        
        return processedFloor;
      });
    }
    
    return processed;
  },

  async deleteMap(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.maps.findIndex(map => map.id === id);
    
    if (index !== -1) {
      const deleted = data.maps.splice(index, 1)[0];
      
      // Remove related data
      data.ghosts = data.ghosts.filter(ghost => ghost.mapId !== id);
      data.runs = data.runs.filter(run => run.mapId !== id);
      
      await baseService.saveData(data);
      return deleted;
    }
    
    throw new Error('Map not found');
  },

  async toggleMapArchived(id) {
    await delay(100);
    const data = await baseService.loadData();
    const index = data.maps.findIndex(map => map.id === id);
    
    if (index !== -1) {
      data.maps[index].isArchived = !data.maps[index].isArchived;
      await baseService.saveData(data);
      return data.maps[index];
    }
    
    throw new Error('Map not found');
  }
};