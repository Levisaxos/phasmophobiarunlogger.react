// components/Layout.jsx
import React, { useState, useEffect } from 'react';
import  Navigation  from './Navigation';

// Import from organized folders
import { ListRuns, AddRun } from '../runs';
import {
  ManageMaps,
  ManageGhosts,
  ManageEvidence,
  ManageCursedPossessions,
  ManagePlayers,
  ManageGameModes
} from '../manage';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('list');
  
  useEffect(() => {
    document.title = 'Phasmophobia Runs';
  }, []);
  
  const renderContent = () => {
    switch (activeTab) {
      case 'list':
        return <ListRuns />;
      case 'add-run':
        return <AddRun />;
      case 'manage-maps':
        return <ManageMaps />;
      case 'manage-ghosts':
        return <ManageGhosts />;
      case 'manage-evidence':
        return <ManageEvidence />;
      case 'manage-cursed-possessions':
        return <ManageCursedPossessions />;
      case 'manage-players':
        return <ManagePlayers />;
      case 'manage-game-modes':
        return <ManageGameModes />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="w-full py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default Layout;