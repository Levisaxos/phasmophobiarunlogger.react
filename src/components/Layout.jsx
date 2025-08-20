import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import ListRuns from './ListRuns.jsx';
import ManageMaps from './ManageMaps.jsx';
import ManageGhosts from './ManageGhosts.jsx';
import ManageEvidence from './ManageEvidence.jsx';
import ManageCursedPossessions from './ManageCursedPossessions.jsx';
import ManagePlayers from './ManagePlayers.jsx';
import ManageGameModes from './ManageGameModes.jsx';
import AddRun from './AddRun.jsx';

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