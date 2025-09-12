// === STATISTICS CALCULATOR ===
// src/components/runs/statistics/statisticsCalculator.js

export class StatisticsCalculator {
  constructor(runs, maps, ghosts, evidence, gameModes, cursedPossessions) {
    this.runs = runs;
    this.maps = maps;
    this.ghosts = ghosts;
    this.evidence = evidence;
    this.gameModes = gameModes;
    this.cursedPossessions = cursedPossessions;
  }

  // Helper method to get display name for entities
  getEntityName(entityType, entityId) {
    const entityMap = {
      ghost: this.ghosts,
      map: this.maps,
      evidence: this.evidence,
      gameMode: this.gameModes,
      cursedPossession: this.cursedPossessions
    };

    const entities = entityMap[entityType];
    if (!entities) return 'Unknown';
    
    const entity = entities.find(e => e.id === entityId);
    return entity?.name || 'Unknown';
  }

  // Get runs with valid timing data
  getTimedRuns() {
    return this.runs.filter(run => run.runTimeSeconds && run.runTimeSeconds > 0);
  }

  // Calculate fastest/slowest runs combined
  calculateTimingExtremesBoth() {
    const timedRuns = this.getTimedRuns();
    if (timedRuns.length === 0) return null;

    const times = timedRuns.map(run => run.runTimeSeconds);
    const fastestTime = Math.min(...times);
    const slowestTime = Math.max(...times);
    
    const fastestRun = timedRuns.find(run => run.runTimeSeconds === fastestTime);
    const slowestRun = timedRuns.find(run => run.runTimeSeconds === slowestTime);

    return {
      fastest: {
        time: fastestTime,
        run: fastestRun,
        mapName: this.getEntityName('map', fastestRun.mapId),
        ghostName: this.getEntityName('ghost', fastestRun.actualGhostId || fastestRun.ghostId),
        playerCount: fastestRun.playerCount || 0
      },
      slowest: {
        time: slowestTime,
        run: slowestRun,
        mapName: this.getEntityName('map', slowestRun.mapId),
        ghostName: this.getEntityName('ghost', slowestRun.actualGhostId || slowestRun.ghostId),
        playerCount: slowestRun.playerCount || 0
      }
    };
  }

  // Calculate most/least frequent items combined
  calculateCountExtremesBoth(field, entityType) {
    if (this.runs.length === 0) return null;

    // Count occurrences
    const counts = {};
    this.runs.forEach(run => {
      const value = run[field];
      if (value !== null && value !== undefined) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    if (Object.keys(counts).length === 0) return null;

    // Sort entries
    const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    
    // Get most (highest count)
    const mostCount = sortedEntries[0][1];
    const mostEntries = sortedEntries.filter(([, count]) => count === mostCount);
    
    // Get least (lowest count) 
    const leastCount = sortedEntries[sortedEntries.length - 1][1];
    const leastEntries = sortedEntries.filter(([, count]) => count === leastCount);

    const getMostResult = () => {
      if (mostEntries.length === 1) {
        const [entityId, count] = mostEntries[0];
        return {
          name: this.getEntityName(entityType, parseInt(entityId)),
          count: count,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomEntry = mostEntries[Math.floor(Math.random() * mostEntries.length)];
      const [entityId, count] = randomEntry;
      return {
        name: this.getEntityName(entityType, parseInt(entityId)),
        count: count,
        hasMore: true,
        moreCount: mostEntries.length - 1,
        allTied: mostEntries.map(([id]) => this.getEntityName(entityType, parseInt(id)))
      };
    };

    const getLeastResult = () => {
      if (leastEntries.length === 1) {
        const [entityId, count] = leastEntries[0];
        return {
          name: this.getEntityName(entityType, parseInt(entityId)),
          count: count,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomEntry = leastEntries[Math.floor(Math.random() * leastEntries.length)];
      const [entityId, count] = randomEntry;
      return {
        name: this.getEntityName(entityType, parseInt(entityId)),
        count: count,
        hasMore: true,
        moreCount: leastEntries.length - 1,
        allTied: leastEntries.map(([id]) => this.getEntityName(entityType, parseInt(id)))
      };
    };

    return {
      most: getMostResult(),
      least: getLeastResult()
    };
  }

  // Calculate player death statistics (both most and least)
  calculatePlayerDeathsBoth() {
    if (this.runs.length === 0) return null;

    const playerDeaths = {};
    
    this.runs.forEach(run => {
      if (run.players && Array.isArray(run.players)) {
        run.players.forEach(player => {
          if (!playerDeaths[player.name]) {
            playerDeaths[player.name] = { total: 0, deaths: 0 };
          }
          playerDeaths[player.name].total++;
          if (player.status === 'dead') {
            playerDeaths[player.name].deaths++;
          }
        });
      }
    });

    if (Object.keys(playerDeaths).length === 0) return null;

    // Sort by death count
    const sortedPlayers = Object.entries(playerDeaths).sort((a, b) => b[1].deaths - a[1].deaths);
    
    // Get most deaths (highest)
    const mostDeathCount = sortedPlayers[0][1].deaths;
    const mostDeathPlayers = sortedPlayers.filter(([, data]) => data.deaths === mostDeathCount);
    
    // Get least deaths (lowest)
    const leastDeathCount = sortedPlayers[sortedPlayers.length - 1][1].deaths;
    const leastDeathPlayers = sortedPlayers.filter(([, data]) => data.deaths === leastDeathCount);

    const getMostResult = () => {
      if (mostDeathPlayers.length === 1) {
        const [playerName, data] = mostDeathPlayers[0];
        return {
          name: playerName,
          count: data.deaths,
          total: data.total,
          rate: data.total > 0 ? Math.round((data.deaths / data.total) * 100) : 0,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomPlayer = mostDeathPlayers[Math.floor(Math.random() * mostDeathPlayers.length)];
      const [playerName, data] = randomPlayer;
      return {
        name: playerName,
        count: data.deaths,
        total: data.total,
        rate: data.total > 0 ? Math.round((data.deaths / data.total) * 100) : 0,
        hasMore: true,
        moreCount: mostDeathPlayers.length - 1,
        allTied: mostDeathPlayers.map(([name]) => name)
      };
    };

    const getLeastResult = () => {
      if (leastDeathPlayers.length === 1) {
        const [playerName, data] = leastDeathPlayers[0];
        return {
          name: playerName,
          count: data.deaths,
          total: data.total,
          rate: data.total > 0 ? Math.round((data.deaths / data.total) * 100) : 0,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomPlayer = leastDeathPlayers[Math.floor(Math.random() * leastDeathPlayers.length)];
      const [playerName, data] = randomPlayer;
      return {
        name: playerName,
        count: data.deaths,
        total: data.total,
        rate: data.total > 0 ? Math.round((data.deaths / data.total) * 100) : 0,
        hasMore: true,
        moreCount: leastDeathPlayers.length - 1,
        allTied: leastDeathPlayers.map(([name]) => name)
      };
    };

    return {
      most: getMostResult(),
      least: getLeastResult()
    };
  }

  // Calculate ghost death statistics (both most and least deadly)
  calculateGhostDeathsBoth() {
    if (this.runs.length === 0) return null;

    const ghostDeaths = {};
    
    this.runs.forEach(run => {
      const ghostId = run.actualGhostId || run.ghostId;
      if (ghostId && run.players && Array.isArray(run.players)) {
        if (!ghostDeaths[ghostId]) {
          ghostDeaths[ghostId] = { encounters: 0, deaths: 0 };
        }
        ghostDeaths[ghostId].encounters++;
        
        const deaths = run.players.filter(p => p.status === 'dead').length;
        ghostDeaths[ghostId].deaths += deaths;
      }
    });

    if (Object.keys(ghostDeaths).length === 0) return null;

    // Sort by death count
    const sortedGhosts = Object.entries(ghostDeaths).sort((a, b) => b[1].deaths - a[1].deaths);
    
    // Get most deadly (highest deaths)
    const mostDeathCount = sortedGhosts[0][1].deaths;
    const mostDeadlyGhosts = sortedGhosts.filter(([, data]) => data.deaths === mostDeathCount);
    
    // Get least deadly (lowest deaths)
    const leastDeathCount = sortedGhosts[sortedGhosts.length - 1][1].deaths;
    const leastDeadlyGhosts = sortedGhosts.filter(([, data]) => data.deaths === leastDeathCount);

    const getMostResult = () => {
      if (mostDeadlyGhosts.length === 1) {
        const [ghostId, data] = mostDeadlyGhosts[0];
        return {
          name: this.getEntityName('ghost', parseInt(ghostId)),
          count: data.deaths,
          encounters: data.encounters,
          rate: data.encounters > 0 ? Math.round((data.deaths / data.encounters) * 100) : 0,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomGhost = mostDeadlyGhosts[Math.floor(Math.random() * mostDeadlyGhosts.length)];
      const [ghostId, data] = randomGhost;
      return {
        name: this.getEntityName('ghost', parseInt(ghostId)),
        count: data.deaths,
        encounters: data.encounters,
        rate: data.encounters > 0 ? Math.round((data.deaths / data.encounters) * 100) : 0,
        hasMore: true,
        moreCount: mostDeadlyGhosts.length - 1,
        allTied: mostDeadlyGhosts.map(([id]) => this.getEntityName('ghost', parseInt(id)))
      };
    };

    const getLeastResult = () => {
      if (leastDeadlyGhosts.length === 1) {
        const [ghostId, data] = leastDeadlyGhosts[0];
        return {
          name: this.getEntityName('ghost', parseInt(ghostId)),
          count: data.deaths,
          encounters: data.encounters,
          rate: data.encounters > 0 ? Math.round((data.deaths / data.encounters) * 100) : 0,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomGhost = leastDeadlyGhosts[Math.floor(Math.random() * leastDeadlyGhosts.length)];
      const [ghostId, data] = randomGhost;
      return {
        name: this.getEntityName('ghost', parseInt(ghostId)),
        count: data.deaths,
        encounters: data.encounters,
        rate: data.encounters > 0 ? Math.round((data.deaths / data.encounters) * 100) : 0,
        hasMore: true,
        moreCount: leastDeadlyGhosts.length - 1,
        allTied: leastDeadlyGhosts.map(([id]) => this.getEntityName('ghost', parseInt(id)))
      };
    };

    return {
      most: getMostResult(),
      least: getLeastResult()
    };
  }

  // Calculate evidence statistics (both most and least found)
  calculateEvidenceBoth() {
    const evidenceCounts = {};
    this.runs.forEach(run => {
      if (run.evidenceIds && Array.isArray(run.evidenceIds)) {
        run.evidenceIds.forEach(evidenceId => {
          evidenceCounts[evidenceId] = (evidenceCounts[evidenceId] || 0) + 1;
        });
      }
    });
    
    if (Object.keys(evidenceCounts).length === 0) return null;
    
    const sortedEntries = Object.entries(evidenceCounts).sort((a, b) => b[1] - a[1]);
    
    // Most found
    const mostCount = sortedEntries[0][1];
    const mostEntries = sortedEntries.filter(([, count]) => count === mostCount);
    
    // Least found  
    const leastCount = sortedEntries[sortedEntries.length - 1][1];
    const leastEntries = sortedEntries.filter(([, count]) => count === leastCount);
    
    const getMostResult = () => {
      if (mostEntries.length === 1) {
        const [evidenceId, count] = mostEntries[0];
        return {
          name: this.getEntityName('evidence', parseInt(evidenceId)),
          count: count,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomEntry = mostEntries[Math.floor(Math.random() * mostEntries.length)];
      const [evidenceId, count] = randomEntry;
      return {
        name: this.getEntityName('evidence', parseInt(evidenceId)),
        count: count,
        hasMore: true,
        moreCount: mostEntries.length - 1,
        allTied: mostEntries.map(([id]) => this.getEntityName('evidence', parseInt(id)))
      };
    };
    
    const getLeastResult = () => {
      if (leastEntries.length === 1) {
        const [evidenceId, count] = leastEntries[0];
        return {
          name: this.getEntityName('evidence', parseInt(evidenceId)),
          count: count,
          hasMore: false,
          moreCount: 0
        };
      }
      
      const randomEntry = leastEntries[Math.floor(Math.random() * leastEntries.length)];
      const [evidenceId, count] = randomEntry;
      return {
        name: this.getEntityName('evidence', parseInt(evidenceId)),
        count: count,
        hasMore: true,
        moreCount: leastEntries.length - 1,
        allTied: leastEntries.map(([id]) => this.getEntityName('evidence', parseInt(id)))
      };
    };

    return {
      most: getMostResult(),
      least: getLeastResult()
    };
  }

  // Main calculation method
  calculateStatistic(statisticId) {
    console.log(`🔍 Calculating statistic: ${statisticId}`);
    
    const calculationMap = {
      'run-times': () => this.calculateTimingExtremesBoth(),
      'ghost-encounters': () => {
        const result = this.calculateCountExtremesBoth('actualGhostId', 'ghost');
        if (!result) return this.calculateCountExtremesBoth('ghostId', 'ghost');
        return result;
      },
      'ghost-lethality': () => this.calculateGhostDeathsBoth(),
      'evidence-found': () => this.calculateEvidenceBoth(),
      'cursed-items': () => this.calculateCountExtremesBoth('cursedPossessionId', 'cursedPossession'),
      'map-popularity': () => this.calculateCountExtremesBoth('mapId', 'map'),
      'difficulty-preference': () => this.calculateCountExtremesBoth('gameModeId', 'gameMode'),
      'player-deaths': () => this.calculatePlayerDeathsBoth()
    };

    const calculator = calculationMap[statisticId];
    if (!calculator) {
      console.log(`❌ No calculator found for statistic: ${statisticId}`);
      return null;
    }
    
    const result = calculator();
    console.log(`✅ Result for ${statisticId}:`, result);
    return result;
  }
}