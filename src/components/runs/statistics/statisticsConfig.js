// === STATISTICS CONFIGURATION ===
// src/components/runs/statistics/statisticsConfig.js

export const STATISTIC_CATEGORIES = {
  TIMING: {
    id: 'timing',
    name: 'Timing',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400'
  },
  GHOSTS: {
    id: 'ghosts',
    name: 'Ghosts',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400'
  },
  EVIDENCE: {
    id: 'evidence',
    name: 'Evidence',
    borderColor: 'border-green-500',
    textColor: 'text-green-400'
  },
  MAPS: {
    id: 'maps',
    name: 'Maps',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-400'
  },
  POSSESSIONS: {
    id: 'possessions',
    name: 'Cursed Items',
    borderColor: 'border-red-500',
    textColor: 'text-red-400'
  },
  PLAYERS: {
    id: 'players',
    name: 'Players',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400'
  },
  DIFFICULTY: {
    id: 'difficulty',
    name: 'Difficulty',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-400'
  }
};

export const AVAILABLE_STATISTICS = [
  // Timing Statistics
  {
    id: 'run-times',
    name: 'Run Times',
    category: STATISTIC_CATEGORIES.TIMING,
    type: 'timing-extreme',
    description: 'Fastest and slowest completed runs'
  },
  
  // Ghost Statistics
  {
    id: 'ghost-encounters',
    name: 'Ghost Encounters',
    category: STATISTIC_CATEGORIES.GHOSTS,
    type: 'count-both',
    description: 'Most and least encountered ghosts'
  },
  {
    id: 'ghost-lethality',
    name: 'Ghost Lethality',
    category: STATISTIC_CATEGORIES.GHOSTS,
    type: 'count-both',
    description: 'Most and least deadly ghosts'
  },
  
  // Evidence Statistics
  {
    id: 'evidence-found',
    name: 'Evidence Found',
    category: STATISTIC_CATEGORIES.EVIDENCE,
    type: 'count-both',
    description: 'Most and least found evidence types'
  },
  
  // Cursed Possession Statistics
  {
    id: 'cursed-items',
    name: 'Cursed Items',
    category: STATISTIC_CATEGORIES.POSSESSIONS,
    type: 'count-both',
    description: 'Most and least found cursed possessions'
  },
  
  // Map Statistics
  {
    id: 'map-popularity',
    name: 'Map Popularity',
    category: STATISTIC_CATEGORIES.MAPS,
    type: 'count-both',
    description: 'Most and least played maps'
  },
  
  // Difficulty Statistics
  {
    id: 'difficulty-preference',
    name: 'Difficulty Preference',
    category: STATISTIC_CATEGORIES.DIFFICULTY,
    type: 'count-both',
    description: 'Most and least played game modes'
  },
  
  // Player Statistics
  {
    id: 'player-deaths',
    name: 'Player Deaths',
    category: STATISTIC_CATEGORIES.PLAYERS,
    type: 'count-both',
    description: 'Players with most and least deaths'
  }
];

export const DEFAULT_SELECTED_STATISTICS = [
  'run-times',
  'ghost-encounters', 
  'evidence-found',
  'map-popularity',
  'difficulty-preference',
  'player-deaths'
];