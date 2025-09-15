// services/dataService.js
// Main entry point that combines all services for backward compatibility

import { baseService } from './api/baseService';
import { mapsService } from './api/mapsService';
import { ghostsService } from './api/ghostsService';
import { playersService } from './api/playersService';
import { gameModesService } from './api/gameModesService';
import { runsService } from './api/runsService';
import { evidenceService } from './api/evidenceService';
import { cursedPossessionsService } from './api/cursedPossessionsService';
import { mapCollectionsService } from './api/mapCollectionsService';
import { challengeModesService } from './api/challengeModesService';

export const dataService = {
  // Base operations
  exportToFile: baseService.exportToFile.bind(baseService),
  importFromFile: baseService.importFromFile.bind(baseService),
  clearCache: baseService.clearCache.bind(baseService),
  getAllData: baseService.getAllData.bind(baseService),

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

  // Game Modes operations
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

  // Cursed Possessions operations
  getCursedPossessions: cursedPossessionsService.getCursedPossessions.bind(cursedPossessionsService),
  getCursedPossessionById: cursedPossessionsService.getCursedPossessionById.bind(cursedPossessionsService),
  getActiveCursedPossessions: cursedPossessionsService.getActiveCursedPossessions.bind(cursedPossessionsService),
  createCursedPossession: cursedPossessionsService.createCursedPossession.bind(cursedPossessionsService),
  updateCursedPossession: cursedPossessionsService.updateCursedPossession.bind(cursedPossessionsService),
  deleteCursedPossession: cursedPossessionsService.deleteCursedPossession.bind(cursedPossessionsService),
  toggleCursedPossessionActive: cursedPossessionsService.toggleCursedPossessionActive.bind(cursedPossessionsService),

  // Map Collections operations
  getMapCollections: mapCollectionsService.getMapCollections.bind(mapCollectionsService),
  getMapCollectionById: mapCollectionsService.getMapCollectionById.bind(mapCollectionsService),
  getActiveMapCollections: mapCollectionsService.getActiveMapCollections.bind(mapCollectionsService),
  createMapCollection: mapCollectionsService.createMapCollection.bind(mapCollectionsService),
  updateMapCollection: mapCollectionsService.updateMapCollection.bind(mapCollectionsService),
  deleteMapCollection: mapCollectionsService.deleteMapCollection.bind(mapCollectionsService),
  toggleMapCollectionActive: mapCollectionsService.toggleMapCollectionActive.bind(mapCollectionsService),

  // Challenge Modes operations
  getChallengeModes: challengeModesService.getChallengeModes.bind(challengeModesService),
  getChallenageModeById: challengeModesService.getChallengeModeById.bind(challengeModesService),
  createChallengeMode: challengeModesService.createChallengeMode.bind(challengeModesService),
  updateChallengeMode: challengeModesService.updateChallengeMode.bind(challengeModesService),
  deleteChallengeMode: challengeModesService.deleteChallengeMode.bind(challengeModesService),

  // Runs operations
  getRuns: runsService.getRuns.bind(runsService),
  getRunById: runsService.getRunById.bind(runsService),
  createRun: runsService.createRun.bind(runsService),
  updateRun: runsService.updateRun.bind(runsService),
  deleteRun: runsService.deleteRun.bind(runsService)
};