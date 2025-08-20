// components/common/Navigation.jsx
import React, { useState } from 'react';
import { dataService } from '../../services';
import { ClearDataModal, ClearRunDataModal } from '../modals';

const Navigation = ({ activeTab, setActiveTab }) => {
  const [isManageDropdownOpen, setIsManageDropdownOpen] = useState(false);
  const [isDataDropdownOpen, setIsDataDropdownOpen] = useState(false);
  const [isClearDataModalOpen, setIsClearDataModalOpen] = useState(false);
  const [isClearRunDataModalOpen, setIsClearRunDataModalOpen] = useState(false);

  const mainMenuItems = [
    { id: 'list', label: 'Runs', type: 'tab' },
    { id: 'add-run', label: 'Add Run', type: 'tab' }
  ];

  const manageMenuItems = [
    { id: 'manage-maps', label: 'Maps', type: 'tab' },
    { id: 'manage-ghosts', label: 'Ghosts', type: 'tab' },
    { id: 'manage-evidence', label: 'Evidence', type: 'tab' },
    { id: 'manage-cursed-possessions', label: 'Cursed Possessions', type: 'tab' },
    { id: 'manage-players', label: 'Players', type: 'tab' },
    { id: 'manage-game-modes', label: 'Game Modes', type: 'tab' }
  ];

  const dataMenuItems = [
    { id: 'export', label: 'Export Data', type: 'action' },
    { id: 'import', label: 'Import Data', type: 'action' },
    { id: 'clear-runs', label: 'Clear Run Data Only', type: 'action' },
    { id: 'clear', label: 'Clear All Data', type: 'action' }
  ];

  const handleMenuClick = async (item) => {
    if (item.type === 'action') {      
      if (item.id === 'export') {
        await exportData();
      } else if (item.id === 'import') {
        importData();
      } else if (item.id === 'clear-runs') {
        setIsClearRunDataModalOpen(true);
      } else if (item.id === 'clear') {
        setIsClearDataModalOpen(true);
      }
    } else {
      setActiveTab(item.id);
    }
    
    // Close dropdowns when selecting
    setIsManageDropdownOpen(false);
    setIsDataDropdownOpen(false);
  };

  const exportData = async () => {
    try {
      await dataService.exportToFile();
      console.log('Data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  const importData = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          await dataService.importFromFile(file);
          console.log('Data imported successfully');
          alert('Data imported successfully! The page will refresh to show the new data.');
          window.location.reload();
        } catch (error) {
          console.error('Import failed:', error);
          alert('Import failed: ' + error.message);
        }
      }
      document.body.removeChild(fileInput);
    };
    
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  const handleClearAllData = async () => {
    localStorage.removeItem('phasmophobia-data');
    dataService.clearCache();
    
    console.log('All data cleared successfully');
    alert('All data has been cleared successfully! The page will refresh.');
    window.location.reload();
  };

  const handleClearRunData = async () => {
    try {
      const currentData = await dataService.getAllData();
      const clearedData = {
        ...currentData,
        runs: []
      };
      
      localStorage.setItem('phasmophobia-data', JSON.stringify(clearedData));
      dataService.clearCache();
      
      console.log('Run data cleared successfully');
      alert('All run data has been cleared successfully! The page will refresh.');
      window.location.reload();
    } catch (error) {
      console.error('Error clearing run data:', error);
      alert('Failed to clear run data: ' + error.message);
    }
  };

  // Check if any manage tab is active
  const isManageTabActive = manageMenuItems.some(item => item.id === activeTab);

  return (
    <>
      <nav className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold">Phasmophobia Run Manager</h1>
              </div>
              <div className="ml-10">
                <div className="flex items-baseline space-x-4">
                  {/* Main menu items */}
                  {mainMenuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleMenuClick(item)}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        activeTab === item.id && item.type === 'tab'
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}

                  {/* Manage dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsManageDropdownOpen(true)}
                    onMouseLeave={() => setIsManageDropdownOpen(false)}
                  >
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${
                        isManageTabActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      Manage
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isManageDropdownOpen ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Manage dropdown menu */}
                    {isManageDropdownOpen && (
                      <div className="absolute top-full left-0 w-56 bg-gray-700 rounded-md shadow-lg border border-gray-600 z-50">
                        <div className="py-1">
                          {manageMenuItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleMenuClick(item)}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                                activeTab === item.id
                                  ? 'bg-gray-600 text-white'
                                  : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Data dropdown */}
                  <div 
                    className="relative"
                    onMouseEnter={() => setIsDataDropdownOpen(true)}
                    onMouseLeave={() => setIsDataDropdownOpen(false)}
                  >
                    <button
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 flex items-center gap-1 text-gray-300 hover:bg-gray-700 hover:text-white`}
                    >
                      Data
                      <svg 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isDataDropdownOpen ? 'rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Data dropdown menu */}
                    {isDataDropdownOpen && (
                      <div className="absolute top-full left-0 w-48 bg-gray-700 rounded-md shadow-lg border border-gray-600 z-50">
                        <div className="py-1">
                          {dataMenuItems.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => handleMenuClick(item)}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors duration-200 ${
                                item.id === 'clear' || item.id === 'clear-runs'
                                  ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                                  : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Clear All Data Modal */}
      <ClearDataModal
        isOpen={isClearDataModalOpen}
        onClose={() => setIsClearDataModalOpen(false)}
        onConfirm={handleClearAllData}
      />

      {/* Clear Run Data Modal */}
      <ClearRunDataModal
        isOpen={isClearRunDataModalOpen}
        onClose={() => setIsClearRunDataModalOpen(false)}
        onConfirm={handleClearRunData}
      />
    </>
  );
};

export default Navigation;