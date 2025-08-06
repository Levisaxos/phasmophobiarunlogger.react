import { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

export const useData = () => {
  const [maps, setMaps] = useState([]);
  const [ghosts, setGhosts] = useState([]);
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [mapsData, ghostsData, runsData] = await Promise.all([
          dataService.getMaps(),
          dataService.getGhosts(),
          dataService.getRuns()
        ]);
        setMaps(mapsData);
        setGhosts(ghostsData);
        setRuns(runsData);
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

  const deleteMap = async (id) => {
    try {
      await dataService.deleteMap(id);
      setMaps(prevMaps => prevMaps.filter(map => map.id !== id));
      // Also remove ghosts associated with this map from state
      setGhosts(prevGhosts => prevGhosts.filter(ghost => ghost.mapId !== id));
      // Also remove runs associated with this map from state
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
      // Also remove runs associated with this ghost from state
      setRuns(prevRuns => prevRuns.filter(run => run.ghostId !== id));
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

  // Utility functions for runs
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
    loading,
    error,
    
    // Maps operations
    createMap,
    updateMap,
    deleteMap,
    
    // Ghosts operations
    createGhost,
    updateGhost,
    deleteGhost,

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