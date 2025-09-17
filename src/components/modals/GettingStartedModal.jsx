// src/components/modals/GettingStartedModal.jsx
import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/dataService';
import { STARTER_DATA } from '../../data/starterData';

const GettingStartedModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasImported, setHasImported] = useState(false);
  const [isDataAlreadyImported, setIsDataAlreadyImported] = useState(false);

  // Generate a hash of the starter data to detect changes
  const generateDataHash = (data) => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  };

  const CURRENT_DATA_HASH = generateDataHash(STARTER_DATA);

  useEffect(() => {
    if (isOpen) {
      // Check if starter data has already been imported
      const importedHash = localStorage.getItem('phasmophobia-starter-data-hash');
      setIsDataAlreadyImported(importedHash === CURRENT_DATA_HASH);
    }
  }, [isOpen, CURRENT_DATA_HASH]);

  if (!isOpen) return null;

  const handleImportStarterData = async () => {
    setIsLoading(true);
    try {
      // Create a blob from the imported data and import it
      const jsonString = JSON.stringify(STARTER_DATA, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'starter-data.json', { type: 'application/json' });
      
      await dataService.importFromFile(file);
      
      // Store the hash to remember this version was imported
      localStorage.setItem('phasmophobia-starter-data-hash', CURRENT_DATA_HASH);
      
      setHasImported(true);
      setIsDataAlreadyImported(true);
    } catch (error) {
      console.error('Failed to import starter data:', error);
      alert('Failed to import starter data. Please try the manual import method.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(STARTER_DATA, null, 2);
      await navigator.clipboard.writeText(jsonString);
      alert('Starter data copied to clipboard! You can now paste it into a .json file.');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      alert('Failed to copy to clipboard. Please select and copy the JSON manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          
          {/* Header */}
          <div className="bg-gray-800 px-6 pt-6 pb-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-green-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-100">
                  Getting Started Guide
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-gray-800 px-6 py-4 max-h-[70vh] overflow-y-auto">
            
            {/* Quick Setup Section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-green-400 mr-2">🚀</span>
                <h4 className="text-lg font-medium text-gray-100">Quick Setup</h4>
              </div>
              
              <div className="bg-green-900/20 rounded-lg p-4 border border-green-600/30 mb-4">
                <p className="text-green-200 text-sm leading-relaxed mb-4">
                  {isDataAlreadyImported 
                    ? "You've already imported the starter data! If the data has been updated, you can re-import it below."
                    : "To get started quickly, you can import a pre-configured dataset with all the essential Phasmophobia data:"
                  }
                </p>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleImportStarterData}
                    disabled={isLoading || hasImported}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      hasImported 
                        ? 'bg-green-600 text-white cursor-not-allowed'
                        : isLoading
                        ? 'bg-green-700 text-white cursor-wait'
                        : isDataAlreadyImported
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isLoading 
                      ? 'Importing...' 
                      : hasImported 
                      ? '✅ Data Imported!' 
                      : isDataAlreadyImported
                      ? '🔄 Re-import Updated Data'
                      : '📥 Import Starter Data'
                    }
                  </button>
                  
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
                  >
                    📋 Copy JSON
                  </button>
                </div>
                
                <p className="text-green-300 text-xs mt-3">
                  {isDataAlreadyImported 
                    ? "Current data matches what you've already imported. Only re-import if there are updates."
                    : "This includes all ghost types, evidence, maps, game modes, and cursed possessions from the current game version."
                  }
                </p>
              </div>
            </div>

            {/* Step by Step Setup */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-blue-400 mr-2">📋</span>
                <h4 className="text-lg font-medium text-gray-100">Manual Setup Steps</h4>
              </div>
              
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium mr-3">1</span>
                    <h5 className="font-medium text-gray-200">Configure Game Data (Manage Menu)</h5>
                  </div>
                  <p className="text-sm text-gray-400 ml-8 mb-3">
                    Use the "Manage" dropdown to set up your game data. You can add, edit, and organize all game elements:
                  </p>
                  <div className="ml-8 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-blue-600/20 border border-blue-500/30 p-3 rounded">
                      <strong className="text-blue-300">Maps:</strong> 
                      <p className="text-blue-200 mt-1">Add your favorite hunting locations with room layouts</p>
                    </div>
                    <div className="bg-purple-600/20 border border-purple-500/30 p-3 rounded">
                      <strong className="text-purple-300">Ghosts:</strong> 
                      <p className="text-purple-200 mt-1">Configure all 24+ ghost types with evidence and abilities</p>
                    </div>
                    <div className="bg-green-600/20 border border-green-500/30 p-3 rounded">
                      <strong className="text-green-300">Evidence:</strong> 
                      <p className="text-green-200 mt-1">Set up EMF 5, Fingerprints, Ghost Writing, etc.</p>
                    </div>
                    <div className="bg-orange-600/20 border border-orange-500/30 p-3 rounded">
                      <strong className="text-orange-300">Game Modes:</strong> 
                      <p className="text-orange-200 mt-1">Amateur, Professional, Nightmare difficulties</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium mr-3">2</span>
                    <h5 className="font-medium text-gray-200">Add Your Players (Required!)</h5>
                  </div>
                  <p className="text-sm text-gray-400 ml-8 mb-2">
                    <strong className="text-yellow-300">Important:</strong> You must add your team members before you can create runs.
                  </p>
                  <div className="ml-8 bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
                    <p className="text-yellow-200 text-xs">
                      Go to <strong>Manage → Players</strong> and add each person in your regular Phasmophobia group. 
                      This enables survival tracking and team statistics.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center mb-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded font-medium mr-3">3</span>
                    <h5 className="font-medium text-gray-200">Start Your First Session</h5>
                  </div>
                  <p className="text-sm text-gray-400 ml-8 mb-3">
                    Once your data is configured, go to <strong>"Add Run"</strong> to start logging your ghost hunts:
                  </p>
                  <div className="ml-8 space-y-2 text-xs">
                    <div className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      <span className="text-gray-300">Select your map, difficulty, and team members</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      <span className="text-gray-300">Log evidence as you discover it during the hunt</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      <span className="text-gray-300">Record final ghost identification and survival status</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-purple-400 mr-2">🎮</span>
                <h4 className="text-lg font-medium text-gray-100">How Run Sessions Work</h4>
              </div>
              
              <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-600/30">
                <div className="space-y-3 text-sm text-purple-200">
                  <div className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">▶️</span>
                    <div>
                      <strong>Starting a Run:</strong> Configure your session settings (map, players, difficulty) and begin tracking
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">⏱️</span>
                    <div>
                      <strong>During the Hunt:</strong> Use the built-in timer to track smudge stick durations for different ghost types (90s for most ghosts, 45s for Demons)
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">📝</span>
                    <div>
                      <strong>Evidence Logging:</strong> Record findings in real-time - EMF readings, fingerprints, spirit box responses, etc.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">🏁</span>
                    <div>
                      <strong>Selecting the ghost:</strong> You can select the guessed ghost. When you are incorrect, right click on the correct ghost to show you were incorrect.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">🏁</span>
                    <div>
                      <strong>Ending a Run:</strong> Complete the session with final ghost and survival status. You'll return to the same session screen with identical settings for quick consecutive runs.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-400 mr-2 mt-1">🔄</span>
                    <div>
                      <strong>Multiple Runs:</strong> Perfect for playing the same map/settings multiple times - just hit "Add Another Run" to continue with the same configuration
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tips */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-yellow-400 mr-2">💡</span>
                <h4 className="text-lg font-medium text-gray-100">Pro Tips for Ghost Hunters</h4>
              </div>
              
              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h6 className="font-medium text-yellow-200 mb-2">🕐 Timing Features:</h6>
                    <ul className="text-yellow-300 space-y-1 text-xs">
                      <li>• Built-in timers to check smudge timers</li>
                      <li>• Hunt cooldown tracking</li>
                      <li>• Session duration logging</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-yellow-200 mb-2">📊 Statistics:</h6>
                    <ul className="text-yellow-300 space-y-1 text-xs">
                      <li>• Survival rates per map/difficulty</li>
                      <li>• Ghost identification accuracy</li>
                      <li>• Team performance analytics</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-yellow-200 mb-2">💾 Data Management:</h6>
                    <ul className="text-yellow-300 space-y-1 text-xs">
                      <li>• Regular data exports for backup</li>
                      <li>• Import/share configurations</li>
                      <li>• All data stored locally (private)</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-yellow-200 mb-2">🎯 Best Practices:</h6>
                    <ul className="text-yellow-300 space-y-1 text-xs">
                      <li>• Log evidence immediately when found</li>
                      <li>• Update survival status after each hunt</li>
                      <li>• Use challenge modes for variety</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
        </div>     

          {/* Footer */}
          <div className="bg-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-green-600 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                onClick={onClose}
              >
                Ready to start hunting! 🔦
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GettingStartedModal;