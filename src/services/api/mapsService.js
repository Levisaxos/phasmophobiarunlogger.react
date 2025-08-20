// services/api/mapsService.js
import { BaseEntityService, validateUniqueName } from './baseEntityService';

class MapsService extends BaseEntityService {
  constructor() {
    super('maps', {
      validateCreate: (mapData, existingMaps) => {
        return validateUniqueName(mapData.name, existingMaps);
      },
      validateUpdate: (mapData, existingMaps, excludeId) => {
        return validateUniqueName(mapData.name, existingMaps, excludeId);
      },
      processCreate: (mapData) => {
        // Convert rooms array to normalized format with IDs
        const roomsWithIds = (mapData.rooms || [])
          .filter(room => room.trim()) // Remove empty rooms
          .map((roomName, index) => ({
            id: index + 1,
            name: roomName.trim()
          }));
        
        return {
          ...mapData,
          isArchived: false,
          rooms: roomsWithIds,
          // Keep legacy rooms array for backward compatibility during transition
          roomsLegacy: mapData.rooms || []
        };
      },
      processUpdate: (mapData) => {
        // Convert rooms array to normalized format with IDs
        const roomsWithIds = (mapData.rooms || [])
          .filter(room => room.trim()) // Remove empty rooms
          .map((roomName, index) => ({
            id: index + 1,
            name: roomName.trim()
          }));
        
        return {
          ...mapData,
          rooms: roomsWithIds,
          // Keep legacy rooms array for backward compatibility
          roomsLegacy: mapData.rooms || []
        };
      },
      onDelete: async (id, data) => {
        // Remove related data
        data.ghosts = data.ghosts.filter(ghost => ghost.mapId !== id);
        data.runs = data.runs.filter(run => run.mapId !== id);
      }
    });
  }

  async getActiveMaps() {
    const maps = await this.getAll();
    return maps.filter(map => !map.isArchived);
  }

  async toggleArchived(id) {
    const data = await this.baseService?.loadData() || await import('./baseService').then(m => m.baseService.loadData());
    const index = data.maps.findIndex(map => map.id === id);
    
    if (index === -1) {
      throw new Error('Map not found');
    }
    
    data.maps[index].isArchived = !data.maps[index].isArchived;
    await (this.baseService?.saveData(data) || await import('./baseService').then(m => m.baseService.saveData(data)));
    return data.maps[index];
  }
}

export const mapsService = new MapsService();