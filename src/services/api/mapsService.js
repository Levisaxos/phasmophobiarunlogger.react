// services/api/mapsService.js - Updated with floor support
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
    
    // Process floors and rooms
    const processedFloors = this.processFloors(mapData.floors || []);
    
    // Create legacy rooms array for backward compatibility
    const legacyRooms = this.createLegacyRoomsArray(processedFloors);
    
    const newMap = {
      ...mapData,
      id: baseService.getNextId(data.maps),
      isArchived: false,
      floors: processedFloors,
      // Keep legacy fields for backward compatibility
      rooms: legacyRooms.map((roomName, index) => ({
        id: index + 1,
        name: roomName
      })),
      roomsLegacy: legacyRooms
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
      
      // Process floors and rooms
      const processedFloors = this.processFloors(mapData.floors || []);
      
      // Create legacy rooms array for backward compatibility
      const legacyRooms = this.createLegacyRoomsArray(processedFloors);
      
      const updatedMap = {
        ...mapData,
        id,
        floors: processedFloors,
        // Keep legacy fields for backward compatibility
        rooms: legacyRooms.map((roomName, index) => ({
          id: index + 1,
          name: roomName
        })),
        roomsLegacy: legacyRooms
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
  },

  // Helper method to process floors and ensure they have proper structure
  processFloors(floors) {
    if (!floors || !Array.isArray(floors)) {
      return [{
        id: 1,
        name: 'Ground Floor',
        order: 0, // Ground floor is order 0
        rooms: []
      }];
    }

    return floors.map(floor => ({
      id: floor.id || Date.now() + Math.random(),
      name: floor.name || 'Unnamed Floor',
      order: floor.order !== undefined ? floor.order : 0, // Default to ground floor (0)
      rooms: (floor.rooms || []).filter(room => room && room.trim())
    })).sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  // Helper method to create legacy rooms array from floors for backward compatibility
  createLegacyRoomsArray(floors) {
    const allRooms = [];
    
    // Sort floors by order first
    const sortedFloors = [...floors].sort((a, b) => (a.order || 0) - (b.order || 0));
    
    sortedFloors.forEach(floor => {
      if (floor.rooms && Array.isArray(floor.rooms)) {
        allRooms.push(...floor.rooms.filter(room => room && room.trim()));
      }
    });
    
    return allRooms;
  },

  // Helper method to get all rooms from a map (handles both floor and legacy format)
  getAllRoomsFromMap(map) {
    if (map.floors && Array.isArray(map.floors)) {
      // New format: extract rooms from floors, maintaining floor order
      const sortedFloors = [...map.floors].sort((a, b) => (a.order || 0) - (b.order || 0));
      const roomsWithFloor = [];
      
      sortedFloors.forEach(floor => {
        if (floor.rooms && Array.isArray(floor.rooms)) {
          floor.rooms.forEach(roomName => {
            if (roomName && roomName.trim()) {
              roomsWithFloor.push({
                name: roomName.trim(),
                floorName: floor.name,
                floorOrder: floor.order || 0
              });
            }
          });
        }
      });
      
      return roomsWithFloor;
    } else if (map.rooms && Array.isArray(map.rooms) && map.rooms.length > 0 && typeof map.rooms[0] === 'object') {
      // Legacy new format: rooms with IDs
      return map.rooms
        .filter(room => room.name && room.name.trim())
        .map(room => ({
          name: room.name.trim(),
          floorName: 'Ground Floor',
          floorOrder: 1
        }));
    } else if (map.rooms && Array.isArray(map.rooms)) {
      // Legacy format: array of strings
      return map.rooms
        .filter(room => room && room.trim())
        .map(roomName => ({
          name: roomName.trim(),
          floorName: 'Ground Floor',
          floorOrder: 0 // Ground floor is order 0
        }));
    } else if (map.roomsLegacy && Array.isArray(map.roomsLegacy)) {
      // Fallback to legacy rooms
      return map.roomsLegacy
        .filter(room => room && room.trim())
        .map(roomName => ({
          name: roomName.trim(),
          floorName: 'Ground Floor',
          floorOrder: 0 // Ground floor is order 0
        }));
    }
    
    return [];
  }
};