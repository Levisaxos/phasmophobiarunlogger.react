// services/mapsService.js
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
    
    // Convert rooms array to normalized format with IDs
    const roomsWithIds = (mapData.rooms || [])
      .filter(room => room.trim()) // Remove empty rooms
      .map((roomName, index) => ({
        id: index + 1,
        name: roomName.trim()
      }));
    
    const newMap = {
      ...mapData,
      id: baseService.getNextId(data.maps),
      isArchived: false,
      rooms: roomsWithIds,
      // Keep legacy rooms array for backward compatibility during transition
      roomsLegacy: mapData.rooms || []
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
      
      // Convert rooms array to normalized format with IDs
      const roomsWithIds = (mapData.rooms || [])
        .filter(room => room.trim()) // Remove empty rooms
        .map((roomName, index) => ({
          id: index + 1,
          name: roomName.trim()
        }));
      
      const updatedMap = {
        ...mapData,
        id,
        rooms: roomsWithIds,
        // Keep legacy rooms array for backward compatibility
        roomsLegacy: mapData.rooms || []
      };
      
      data.maps[index] = updatedMap;
      await baseService.saveData(data);
      return data.maps[index];
    }
    
    throw new Error('Map not found');
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