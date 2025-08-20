// services/dataService.js
// Main entry point that combines all services for backward compatibility

import { baseService } from './baseService';
import { mapsService } from './mapsService';
import { ghostsService } from './ghostsService';
import { playersService } from './playersService';
import { gameModesService } from './gameModesService';
import { runsService } from './runsService';
import { evidenceService } from './evidenceService';
import { cursedPossessionsService } from './cursedPossessionsService';

export const dataService = {
  // Base operations
  exportToFile: baseService.exportToFile.bind(baseService),
  importFromFile: baseService.importFromFile.bind(baseService),
  clearCache: baseService.clearCache.bind(baseService),

  // Maps operations
  getMaps: mapsService.getMaps.bind(mapsService),
  getMapById: mapsService.getMapById.bind(mapsService),
  getActiveMaps: mapsService.getActiveMaps.bind(mapsService),
  createMap: mapsService.createMap.bind(mapsService),
  updateMap: mapsService.updateMap.bind(mapsService),
  deleteMap: mapsService.deleteMap.bind(mapsService),
  toggleMapArchived: mapsService.toggleMapArchived.bind(mapsService),

  // Ghosts operations
  getGhosts: ghostsService.getGhosts.bind(ghostsService),
  getGhostById: ghostsService.getGhostById.bind(ghostsService),
  createGhost: ghostsService.createGhost.bind(ghostsService),
  updateGhost: ghostsService.updateGhost.bind(ghostsService),
  deleteGhost: ghostsService.deleteGhost.bind(ghostsService),

  // Players operations
  getPlayers: playersService.getPlayers.bind(playersService),
  getPlayerById: playersService.getPlayerById.bind(playersService),
  getActivePlayers: playersService.getActivePlayers.bind(playersService),
  createPlayer: playersService.createPlayer.bind(playersService),
  updatePlayer: playersService.updatePlayer.bind(playersService),
  deletePlayer: playersService.deletePlayer.bind(playersService),
  togglePlayerActive: playersService.togglePlayerActive.bind(playersService),

  // Game modes operations
  getGameModes: gameModesService.getGameModes.bind(gameModesService),
  getGameModeById: gameModesService.getGameModeById.bind(gameModesService),
  getActiveGameModes: gameModesService.getActiveGameModes.bind(gameModesService),
  createGameMode: gameModesService.createGameMode.bind(gameModesService),
  updateGameMode: gameModesService.updateGameMode.bind(gameModesService),
  deleteGameMode: gameModesService.deleteGameMode.bind(gameModesService),
  toggleGameModeActive: gameModesService.toggleGameModeActive.bind(gameModesService),

  // Evidence operations
  getEvidence: evidenceService.getEvidence.bind(evidenceService),
  getEvidenceById: evidenceService.getEvidenceById.bind(evidenceService),
  getActiveEvidence: evidenceService.getActiveEvidence.bind(evidenceService),
  createEvidence: evidenceService.createEvidence.bind(evidenceService),
  updateEvidence: evidenceService.updateEvidence.bind(evidenceService),
  deleteEvidence: evidenceService.deleteEvidence.bind(evidenceService),
  toggleEvidenceActive: evidenceService.toggleEvidenceActive.bind(evidenceService),

  // Cursed possessions operations
  getCursedPossessions: cursedPossessionsService.getCursedPossessions.bind(cursedPossessionsService),
  getCursedPossessionById: cursedPossessionsService.getCursedPossessionById.bind(cursedPossessionsService),
  getActiveCursedPossessions: cursedPossessionsService.getActiveCursedPossessions.bind(cursedPossessionsService),
  createCursedPossession: cursedPossessionsService.createCursedPossession.bind(cursedPossessionsService),
  updateCursedPossession: cursedPossessionsService.updateCursedPossession.bind(cursedPossessionsService),
  deleteCursedPossession: cursedPossessionsService.deleteCursedPossession.bind(cursedPossessionsService),
  toggleCursedPossessionActive: cursedPossessionsService.toggleCursedPossessionActive.bind(cursedPossessionsService),

  // Runs operations
  getRuns: runsService.getRuns.bind(runsService),
  getRunById: runsService.getRunById.bind(runsService),
  getRunsByDate: runsService.getRunsByDate.bind(runsService),
  getRunsByDateAndPlayerCount: runsService.getRunsByDateAndPlayerCount.bind(runsService),
  getTodaysRunNumber: runsService.getTodaysRunNumber.bind(runsService),
  createRun: runsService.createRun.bind(runsService),
  updateRun: runsService.updateRun.bind(runsService),
  deleteRun: runsService.deleteRun.bind(runsService),

  // Utility functions for backward compatibility
  async getAllData() {
    const data = await baseService.loadData();
    return {
      maps: [...data.maps],
      ghosts: [...data.ghosts],
      runs: [...data.runs],
      players: [...data.players],
      gameModes: [...data.gameModes],
      evidence: [...data.evidence],
      cursedPossessions: [...data.cursedPossessions]
    };
  },

  async getTodaysRuns() {
    const today = new Date().toISOString().split('T')[0];
    return await runsService.getRunsByDate(today);
  }
};