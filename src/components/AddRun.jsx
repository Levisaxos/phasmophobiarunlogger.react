import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../hooks/useData';

const AddRun = () => {
  const { 
    maps, 
    ghosts, 
    loading, 
    error, 
    createRun,
    getTodaysRuns 
  } = useData();
  
  // Form state
  const [selectedMap, setSelectedMap] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedCursedPossession, setSelectedCursedPossession] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState([]);
  const [selectedGhost, setSelectedGhost] = useState(null); // This is the guessed ghost
  const [actualGhost, setActualGhost] = useState(null); // This is the actual ghost
  const [players, setPlayers] = useState(['Levisaxos']); // Always include Levisaxos
  const [playerStates, setPlayerStates] = useState({ 'Levisaxos': 'alive' }); // Track alive/dead status
  const [isPerfectGame, setIsPerfectGame] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const availableEvidence = [
    'EMF 5',        
    'D.O.T.S',
    'Ultraviolet',
    'Ghost Orbs',    
    'Ghost Writing',
    'Spirit Box',        
    'Freezing Temperatures'        
  ];

  const availableCursedPossessions = [
    { id: 1, name: 'Tarot Deck' },
    { id: 2, name: 'Cursed Mirror' },
    { id: 3, name: 'Music Box' },
    { id: 4, name: 'Summoning Circle' },
    { id: 5, name: 'Monkey\'s Paw' },
    { id: 6, name: 'Ouija Board' },
    { id: 7, name: 'Voodoo Doll' }
  ];

  const availablePlayers = ['Bart', 'Maikel']; // Additional players besides Levisaxos

  // Reset form when map changes
  useEffect(() => {
    setSelectedRoom('');
  }, [selectedMap]);

  // Update player states when players change
  useEffect(() => {
    const newPlayerStates = {};
    players.forEach(player => {
      newPlayerStates[player] = playerStates[player] || 'alive';
    });
    setPlayerStates(newPlayerStates);
  }, [players]);

  // Filter ghosts based on selected evidence
  const filteredGhosts = useMemo(() => {
    if (selectedEvidence.length === 0) {
      return ghosts;
    }
    
    return ghosts.filter(ghost => {
      const ghostEvidence = ghost.evidence || [];
      return selectedEvidence.every(evidence => ghostEvidence.includes(evidence));
    });
  }, [ghosts, selectedEvidence]);

  // Get rooms for selected map
  const availableRooms = selectedMap ? selectedMap.rooms || [] : [];

  // Calculate if guess was correct
  const wasCorrect = selectedGhost && actualGhost ? selectedGhost.id === actualGhost.id : true;

  const handleCursedPossessionChange = (possessionId) => {
    if (selectedCursedPossession === possessionId) {
      // Deselect if already selected
      setSelectedCursedPossession('');
    } else {
      // Select the new possession
      setSelectedCursedPossession(possessionId);
    }
  };

  const handleEvidenceToggle = (evidence) => {
    if (selectedEvidence.includes(evidence)) {
      // Remove evidence
      setSelectedEvidence(prev => prev.filter(e => e !== evidence));
    } else if (selectedEvidence.length < 3) {
      // Add evidence (max 3)
      setSelectedEvidence(prev => [...prev, evidence]);
    }
  };

  const handlePlayerToggle = (player) => {
    if (players.includes(player)) {
      // Remove player (but never remove Levisaxos)
      if (player !== 'Levisaxos') {
        setPlayers(prev => prev.filter(p => p !== player));
        // Remove from player states
        const newPlayerStates = { ...playerStates };
        delete newPlayerStates[player];
        setPlayerStates(newPlayerStates);
      }
    } else {
      // Add player
      setPlayers(prev => [...prev, player]);
      // Add to player states as alive by default
      setPlayerStates(prev => ({ ...prev, [player]: 'alive' }));
    }
  };

  const togglePlayerStatus = (player) => {
    setPlayerStates(prev => ({
      ...prev,
      [player]: prev[player] === 'alive' ? 'dead' : 'alive'
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedMap || !selectedRoom || !selectedGhost) {
      alert('Please fill in all required fields');
      return;
    }

    // If no actual ghost is selected, assume the selected ghost is the actual ghost
    const finalActualGhost = actualGhost || selectedGhost;

    setIsSaving(true);
    
    try {
      const runData = {
        mapId: selectedMap.id,
        mapName: selectedMap.name,
        roomName: selectedRoom,
        cursedPossessionId: selectedCursedPossession || null,
        cursedPossessionName: selectedCursedPossession ? 
          availableCursedPossessions.find(p => p.id === selectedCursedPossession)?.name : null,
        evidence: [...selectedEvidence],
        ghostId: selectedGhost.id,
        ghostName: selectedGhost.name,
        actualGhostId: finalActualGhost.id,
        actualGhostName: finalActualGhost.name,
        players: [...players],
        playerCount: players.length,
        playerStates: { ...playerStates },
        wasCorrect: selectedGhost.id === finalActualGhost.id,
        isPerfectGame: isPerfectGame
      };
      
      const newRun = await createRun(runData);
      
      // Reset form
      setSelectedMap(null);
      setSelectedRoom('');
      setSelectedCursedPossession('');
      setSelectedEvidence([]);
      setSelectedGhost(null);
      setActualGhost(null);
      setPlayers(['Levisaxos']);
      setPlayerStates({ 'Levisaxos': 'alive' });
      setIsPerfectGame(false);
      
      alert(`Run saved successfully! Run #${newRun.runNumber} for ${players.length} player${players.length > 1 ? 's' : ''} today.`);
      
    } catch (error) {
      console.error('Error saving run:', error);
      alert('Failed to save run: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const canSubmit = selectedMap && selectedRoom && selectedGhost;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-300">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Add Run</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Map Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Map *
          </label>
          <select
            value={selectedMap?.id || ''}
            onChange={(e) => {
              const mapId = parseInt(e.target.value);
              const map = maps.find(m => m.id === mapId);
              setSelectedMap(map || null);
            }}
            className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Choose a map...</option>
            {maps.map((map) => (
              <option key={map.id} value={map.id}>
                {map.name} ({map.size})
              </option>
            ))}
          </select>
        </div>

        {/* Room Selection */}
        {selectedMap && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Room *
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-500 bg-gray-800 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Choose a room...</option>
            {availableRooms
  .filter(room => room.trim())
  .sort((a, b) => a.localeCompare(b))
  .map((room, index) => (
    <option key={index} value={room}>
      {room}
    </option>
  ))}
            </select>
          </div>
        )}

        {/* Cursed Possessions Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Cursed Possession (Optional)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableCursedPossessions.map((possession) => {
              const isSelected = selectedCursedPossession === possession.id;
              
              return (
                <button
                  key={possession.id}
                  type="button"
                  onClick={() => handleCursedPossessionChange(possession.id)}
                  className={`px-4 py-3 text-left border rounded-md transition-colors duration-200 ${
                    isSelected
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-gray-800 border-gray-500 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{possession.name}</span>
                    {isSelected && (
                      <span className="text-purple-200">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evidence Selection */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-300">
              Select Evidence ({selectedEvidence.length}/3) *
            </label>
            <span className="text-xs text-gray-400">
              Select maximum 3 evidence types
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableEvidence.map((evidence) => {
              const isSelected = selectedEvidence.includes(evidence);
              const canSelect = selectedEvidence.length < 3;
              
              return (
                <button
                  key={evidence}
                  type="button"
                  onClick={() => handleEvidenceToggle(evidence)}
                  disabled={!isSelected && !canSelect}
                  className={`px-4 py-3 text-left border rounded-md transition-colors duration-200 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : canSelect
                      ? 'bg-gray-800 border-gray-500 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-900 border-gray-600 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{evidence}</span>
                    {isSelected && (
                      <span className="text-blue-200">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ghost Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Select Ghosts *
          </label>
          <div className="mb-3 space-y-1">
            <p className="text-xs text-gray-400">
              {selectedEvidence.length === 0 
                ? `All ${ghosts.length} ghosts available`
                : `${filteredGhosts.length} ghosts match selected evidence`
              }
            </p>
            <p className="text-xs text-blue-400">
              <strong>Left click:</strong> Guessed ghost | <strong>Right click:</strong> Actual ghost
            </p>         
          </div>
          
          {/* Ghost Grid - 3 columns, up to 8 rows */}
          <div className="grid grid-cols-3 gap-1.5 border border-gray-600 rounded-lg p-2 bg-gray-800">
            {ghosts.map((ghost) => {
              const isGuessed = selectedGhost?.id === ghost.id;
              const isActual = actualGhost?.id === ghost.id;
              const isBoth = isGuessed && isActual;
              const hasMatchingEvidence = selectedEvidence.length === 0 || 
                selectedEvidence.every(evidence => ghost.evidence?.includes(evidence));
              
              // Determine styling based on selection state
              let buttonStyle = '';
              let nameStyle = '';
              let evidenceStyle = '';
              
              if (isBoth) {
                // Both guessed and actual - split styling
                buttonStyle = 'border-gray-900 text-gray-900 bg-gradient-to-r from-gray-500 to-green-600';
                nameStyle = 'text-white';
                evidenceStyle = 'bg-gray-600/50';
              } else if (isGuessed) {
                // Only guessed
                buttonStyle = 'bg-gray-500 border-gray-900 text-gray-900';
                nameStyle = 'text-gray-900';
                evidenceStyle = 'bg-gray-600/50';
              } else if (isActual) {
                // Only actual
                buttonStyle = 'bg-green-600 border-green-500 text-white';
                nameStyle = 'text-white';
                evidenceStyle = 'bg-green-700/50';
              } else if (hasMatchingEvidence) {
                // Default - matches evidence
                buttonStyle = 'bg-gray-700 border-gray-500 text-gray-300 hover:bg-gray-600';
                nameStyle = 'text-gray-300';
                evidenceStyle = 'bg-gray-800/50';
              } else {
                // Doesn't match evidence - darkened
                buttonStyle = 'bg-gray-900 border-gray-600 text-gray-500 cursor-default';
                nameStyle = 'text-gray-500';
                evidenceStyle = 'bg-gray-900/50';
              }
              
              return (
                <button
                  key={ghost.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Left click for guessed ghost
                    setSelectedGhost(isGuessed ? null : ghost);
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    // Right click for actual ghost
                    setActualGhost(isActual ? null : ghost);
                  }}
                  className={`p-0 text-xs rounded-md border transition-all duration-200 min-h-[70px] flex overflow-hidden ${buttonStyle}`}
                >
                  {/* Left: Ghost Name - 70% width, centered */}
                  <div className="w-[70%] flex items-center justify-center p-2">
                    <div className={`font-medium text-center leading-tight ${nameStyle}`}>
                      {ghost.name}
                    </div>
                  </div>
                  
                  {/* Right: Evidence Types - 30% width, right aligned with different background */}
                  <div className={`w-[30%] flex flex-col items-end justify-center space-y-0.5 px-2 py-2 ${evidenceStyle}`}>
                    {ghost.evidence && ghost.evidence.length > 0 ? (
                      ghost.evidence.slice(0, 3).map((evidence, index) => (
                        <div 
                          key={index} 
                          className="text-[9px] leading-tight text-right truncate max-w-full"
                          title={evidence}
                        >
                          {evidence}
                        </div>
                      ))
                    ) : (
                      <div className="text-[9px] text-gray-400 text-right">
                        No evidence
                      </div>
                    )}                        
                  </div>
                </button>
              );
            })}             
          </div>

          {/* Show correctness indicator */}
          {selectedGhost && (
            <div className="mt-3 p-3 rounded-md bg-gray-800 border border-gray-600">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4 text-xs">
                {selectedGhost && (
                  <span className="text-gray-400">
                    Guessed: <span className={`${wasCorrect ? 'text-green-400' : 'text-red-400'} font-medium`}>{selectedGhost.name}</span>
                  </span>
                )}
                {actualGhost && (
                  <span className="text-gray-400">
                    Actual: <span className='text-green-400 font-medium'>{actualGhost.name}</span>
                  </span>
                )}
              </div>
              </div>              
            </div>
          )}
        </div>

        {/* Players Selection with Status */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Players ({players.length}) *
          </label>
          <div className="space-y-3">
            {/* Levisaxos (always included) */}
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={true}
                  disabled={true}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-gray-300">
                  Levisaxos (You)
                </label>
              </div>
              <button
                type="button"
                onClick={() => togglePlayerStatus('Levisaxos')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                  playerStates['Levisaxos'] === 'alive'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {playerStates['Levisaxos'] === 'alive' ? '😄 Alive' : '💀 Dead'}
              </button>
            </div>
            
            {/* Other players */}
            {availablePlayers.map((player) => (
              <div key={player} className={`flex items-center justify-between p-3 rounded-md transition-colors duration-200 ${
                players.includes(player) ? 'bg-gray-800' : 'bg-gray-900'
              }`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={players.includes(player)}
                    onChange={() => handlePlayerToggle(player)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-300">
                    {player}
                  </label>
                </div>
                {players.includes(player) && (
                  <button
                    type="button"
                    onClick={() => togglePlayerStatus(player)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                      playerStates[player] === 'alive'
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {playerStates[player] === 'alive' ? '😄 Alive' : '💀 Dead'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Perfect Game Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Perfect Game
          </label>
          <button
            type="button"
            onClick={() => setIsPerfectGame(!isPerfectGame)}
            className={`px-6 py-3 rounded-md font-medium transition-colors duration-200 flex items-center gap-2 ${
              isPerfectGame
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-600 border border-gray-500'
            }`}
          >
            <span className="text-lg">{isPerfectGame ? '⭐' : '☆'}</span>
            {isPerfectGame ? 'Perfect Game!' : 'Regular Game'}
          </button>
          <p className="mt-1 text-xs text-gray-400">
            Toggle this if the run was a perfect game (no deaths, correct guess, etc.)
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-600">
          <button
            type="submit"
            disabled={!canSubmit || isSaving}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSaving ? 'Saving Run...' : 'Save Run'}
          </button>
          
          {!canSubmit && (
            <p className="mt-2 text-sm text-gray-400 text-center">
              Please fill in all required fields to save the run
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddRun;