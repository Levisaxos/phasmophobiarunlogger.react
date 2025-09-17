// src/components/common/Layout.jsx
import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import DisclaimerModal from '../modals/DisclaimerModal';

// Import from organized folders
import ListRuns from '../runs/ListRuns';
import AddRun from '../runs/AddRun';
import ManageMaps from '../manage/ManageMaps';
import ManageGhosts from '../manage/ManageGhosts';
import ManageEvidence from '../manage/ManageEvidence';
import ManageCursedPossessions from '../manage/ManageCursedPossessions';
import ManagePlayers from '../manage/ManagePlayers';
import ManageGameModes from '../manage/ManageGameModes';
import ManageChallengeModes from '../manage/ManageChallengeModes';

const Layout = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [showInitialDisclaimer, setShowInitialDisclaimer] = useState(false);
  
  useEffect(() => {
    document.title = 'Phasmophobia Run Tracker';
    
    // Check if user has seen the disclaimer before
    const hasSeenDisclaimer = localStorage.getItem('phasmophobia-disclaimer-seen');
    if (!hasSeenDisclaimer) {
      setShowInitialDisclaimer(true);
    }
  }, []);

  const handleDisclaimerClose = () => {
    setShowInitialDisclaimer(false);
    localStorage.setItem('phasmophobia-disclaimer-seen', 'true');
  };
  
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
      case 'manage-challenge-modes':
        return <ManageChallengeModes />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 w-full py-6 px-4 sm:px-6 lg:px-8">
        {renderContent()}
      </main>
      
      <Footer />
      
      <DisclaimerModal 
        isOpen={showInitialDisclaimer} 
        onClose={handleDisclaimerClose} 
      />
    </div>
  );
};

export default Layout;