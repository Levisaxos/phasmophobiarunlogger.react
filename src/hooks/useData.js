import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

export const useData = () => {
  const [maps, setMaps] = useState([]);
  const [ghosts, setGhosts] = useState([]);
  const [runs, setRuns] = useState([]);
  const [players, setPlayers] = useState([]);
  const [gameModes, setGameModes] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [cursedPossessions, setCursedPossessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [mapsData, ghostsData, runsData, playersData, gameModesData, evidenceData, cursedPossessionsData] = await Promise.all([
          dataService.getMaps(),
          dataService.getGhosts(),
          dataService.getRuns(),
          dataService.getPlayers(),
          dataService.getGameModes(),
          dataService.getEvidence(),
          dataService.getCursedPossessions()
        ]);
        setMaps(mapsData);
        setGhosts(ghostsData);
        setRuns(runsData);
        setPlayers(playersData);
        setGameModes(gameModesData);
        setEvidence(evidenceData);
        setCursedPossessions(cursedPossessionsData);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Maps operations
  const createMap = async (mapData) => {
    try {
      const newMap = await dataService.createMap(mapData);
      setMaps(prevMaps => [...prevMaps, newMap]);
      return newMap;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateMap = async (id, mapData) => {
    try {
      const updatedMap = await dataService.updateMap(id, mapData);
      setMaps(prevMaps => prevMaps.map(map => 
        map.id === id ? updatedMap : map
      ));
      return updatedMap;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleMapArchived = async (id) => {
    try {
      const updatedMap = await dataService.toggleMapArchived(id);
      setMaps(prevMaps => prevMaps.map(map => 
        map.id === id ? updatedMap : map
      ));
      return updatedMap;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMap = async (id) => {
    try {
      await dataService.deleteMap(id);
      setMaps(prevMaps => prevMaps.filter(map => map.id !== id));
      setGhosts(prevGhosts => prevGhosts.filter(ghost => ghost.mapId !== id));
      setRuns(prevRuns => prevRuns.filter(run => run.mapId !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Ghosts operations
  const createGhost = async (ghostData) => {
    try {
      const newGhost = await dataService.createGhost(ghostData);
      setGhosts(prevGhosts => [...prevGhosts, newGhost]);
      return newGhost;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateGhost = async (id, ghostData) => {
    try {
      const updatedGhost = await dataService.updateGhost(id, ghostData);
      setGhosts(prevGhosts => prevGhosts.map(ghost => 
        ghost.id === id ? updatedGhost : ghost
      ));
      return updatedGhost;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteGhost = async (id) => {
    try {
      await dataService.deleteGhost(id);
      setGhosts(prevGhosts => prevGhosts.filter(ghost => ghost.id !== id));
      setRuns(prevRuns => prevRuns.filter(run => run.ghostId !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Players operations
  const createPlayer = async (playerData) => {
    try {
      const newPlayer = await dataService.createPlayer(playerData);
      setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
      return newPlayer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updatePlayer = async (id, playerData) => {
    try {
      const updatedPlayer = await dataService.updatePlayer(id, playerData);
      setPlayers(prevPlayers => prevPlayers.map(player => 
        player.id === id ? updatedPlayer : player
      ));
      return updatedPlayer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deletePlayer = async (id) => {
    try {
      await dataService.deletePlayer(id);
      setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const togglePlayerActive = async (id) => {
    try {
      const updatedPlayer = await dataService.togglePlayerActive(id);
      setPlayers(prevPlayers => prevPlayers.map(player => 
        player.id === id ? updatedPlayer : player
      ));
      return updatedPlayer;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Game Modes operations
  const createGameMode = async (gameModeData) => {
    try {
      const newGameMode = await dataService.createGameMode(gameModeData);
      setGameModes(prevGameModes => [...prevGameModes, newGameMode]);
      return newGameMode;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateGameMode = async (id, gameModeData) => {
    try {
      const updatedGameMode = await dataService.updateGameMode(id, gameModeData);
      setGameModes(prevGameModes => prevGameModes.map(gameMode => 
        gameMode.id === id ? updatedGameMode : gameMode
      ));
      return updatedGameMode;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteGameMode = async (id) => {
    try {
      await dataService.deleteGameMode(id);
      setGameModes(prevGameModes => prevGameModes.filter(gameMode => gameMode.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleGameModeActive = async (id) => {
    try {
      const updatedGameMode = await dataService.toggleGameModeActive(id);
      setGameModes(prevGameModes => prevGameModes.map(gameMode => 
        gameMode.id === id ? updatedGameMode : gameMode
      ));
      return updatedGameMode;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Evidence operations
  const createEvidence = async (evidenceData) => {
    try {
      const newEvidence = await dataService.createEvidence(evidenceData);
      setEvidence(prevEvidence => [...prevEvidence, newEvidence]);
      return newEvidence;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateEvidence = async (id, evidenceData) => {
    try {
      const updatedEvidence = await dataService.updateEvidence(id, evidenceData);
      setEvidence(prevEvidence => prevEvidence.map(evidence => 
        evidence.id === id ? updatedEvidence : evidence
      ));
      return updatedEvidence;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteEvidence = async (id) => {
    try {
      await dataService.deleteEvidence(id);
      setEvidence(prevEvidence => prevEvidence.filter(evidence => evidence.id !== id));
      // Reload ghosts and runs as they may have been updated
      const [updatedGhosts, updatedRuns] = await Promise.all([
        dataService.getGhosts(),
        dataService.getRuns()
      ]);
      setGhosts(updatedGhosts);
      setRuns(updatedRuns);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleEvidenceActive = async (id) => {
    try {
      const updatedEvidence = await dataService.toggleEvidenceActive(id);
      setEvidence(prevEvidence => prevEvidence.map(evidence => 
        evidence.id === id ? updatedEvidence : evidence
      ));
      return updatedEvidence;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Cursed Possessions operations
  const createCursedPossession = async (possessionData) => {
    try {
      const newPossession = await dataService.createCursedPossession(possessionData);
      setCursedPossessions(prevPossessions => [...prevPossessions, newPossession]);
      return newPossession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateCursedPossession = async (id, possessionData) => {
    try {
      const updatedPossession = await dataService.updateCursedPossession(id, possessionData);
      setCursedPossessions(prevPossessions => prevPossessions.map(possession => 
        possession.id === id ? updatedPossession : possession
      ));
      return updatedPossession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCursedPossession = async (id) => {
    try {
      await dataService.deleteCursedPossession(id);
      setCursedPossessions(prevPossessions => prevPossessions.filter(possession => possession.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const toggleCursedPossessionActive = async (id) => {
    try {
      const updatedPossession = await dataService.toggleCursedPossessionActive(id);
      setCursedPossessions(prevPossessions => prevPossessions.map(possession => 
        possession.id === id ? updatedPossession : possession
      ));
      return updatedPossession;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Runs operations
  const createRun = async (runData) => {
    try {
      const newRun = await dataService.createRun(runData);
      setRuns(prevRuns => [...prevRuns, newRun]);
      return newRun;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateRun = async (id, runData) => {
    try {
      const updatedRun = await dataService.updateRun(id, runData);
      setRuns(prevRuns => prevRuns.map(run => 
        run.id === id ? updatedRun : run
      ));
      return updatedRun;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteRun = async (id) => {
    try {
      await dataService.deleteRun(id);
      setRuns(prevRuns => prevRuns.filter(run => run.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Utility functions
  const getRunsByDate = (date) => {
    return runs.filter(run => run.date === date);
  };

  const getRunsByDateAndPlayerCount = (date, playerCount) => {
    return runs.filter(run => run.date === date && run.playerCount === playerCount);
  };

  const getTodaysRuns = () => {
    const today = new Date().toISOString().split('T')[0];
    return getRunsByDate(today);
  };

  return {
    // Data
    maps,
    ghosts,
    runs,
    players,
    gameModes,
    evidence,
    cursedPossessions,
    loading,
    error,
    
    // Maps operations
    createMap,
    updateMap,
    deleteMap,
    toggleMapArchived,
    
    // Ghosts operations
    createGhost,
    updateGhost,
    deleteGhost,

    // Players operations
    createPlayer,
    updatePlayer,
    deletePlayer,
    togglePlayerActive,

    // Game Modes operations
    createGameMode,
    updateGameMode,
    deleteGameMode,
    toggleGameModeActive,

    // Evidence operations
    createEvidence,
    updateEvidence,
    deleteEvidence,
    toggleEvidenceActive,

    // Cursed Possessions operations
    createCursedPossession,
    updateCursedPossession,
    deleteCursedPossession,
    toggleCursedPossessionActive,

    // Runs operations
    createRun,
    updateRun,
    deleteRun,

    // Utility functions
    getRunsByDate,
    getRunsByDateAndPlayerCount,
    getTodaysRuns
  };
};