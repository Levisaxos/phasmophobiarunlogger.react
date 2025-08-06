import React, { useState } from 'react';
import { dataService } from '../services/dataService'; // Adjust path as needed

const Navigation = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'list', label: 'Runs', type: 'tab' },
    { id: 'add-run', label: 'Add Run', type: 'tab' },
    { id: 'manage-maps', label: 'Manage Maps', type: 'tab' },
    { id: 'manage-ghosts', label: 'Manage Ghosts', type: 'tab' },
    { id: 'export', label: 'Export Data', type: 'action' },
    { id: 'import', label: 'Import Data', type: 'action' }
  ];

  const handleMenuClick = async (item) => {
    if (item.type === 'action') {      
      if (item.id === 'export') {
        Export();
      } else if (item.id === 'import') {
        Import();
      }
    } else {
      // Handle regular tab navigation
      setActiveTab(item.id);
    }
  };

  async function Export() {
    try {
      await dataService.exportToFile();
      console.log('Data exported successfully');
      // Optional: You could show a temporary success message here
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  }

  function Import() {
    // Create a hidden file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    // Handle file selection
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          await dataService.importFromFile(file);
          console.log('Data imported successfully');
          alert('Data imported successfully! The page will refresh to show the new data.');
          // Refresh the page to ensure all components reload with new data
          window.location.reload();
        } catch (error) {
          console.error('Import failed:', error);
          alert('Import failed: ' + error.message);
        }
      }
      // Clean up the temporary input element
      document.body.removeChild(fileInput);
    };
    
    // Add to DOM and trigger click
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold">Phasmophobia Run Manager</h1>
            </div>
            <div className="ml-10">
              <div className="flex items-baseline space-x-4">
                {menuItems.map((item) => (
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;