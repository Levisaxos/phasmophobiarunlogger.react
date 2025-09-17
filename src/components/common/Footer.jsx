// src/components/common/Footer.jsx
import React, { useState } from 'react';
import DisclaimerModal from '../modals/DisclaimerModal';
import GettingStartedModal from '../modals/GettingStartedModal';

const Footer = () => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [isGettingStartedOpen, setIsGettingStartedOpen] = useState(false);

  const currentYear = new Date().getFullYear();

  const openGitHub = () => {
    window.open('https://github.com/yourusername', '_blank', 'noopener,noreferrer');
  };

  const openLicense = () => {
    window.open('https://opensource.org/licenses/MIT', '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <footer className="bg-gray-900 border-t border-gray-700 py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setIsGettingStartedOpen(true)}
              className="hover:text-gray-300 transition-colors underline text-green-400"
            >
              Getting Started
            </button>
            
            <span className="text-gray-600">•</span>
            
            <button
              onClick={() => setIsDisclaimerOpen(true)}
              className="hover:text-gray-300 transition-colors underline"
            >
              About
            </button>
            
            <span className="text-gray-600">•</span>
            
            <button
              onClick={openLicense}
              className="hover:text-gray-300 transition-colors underline"
            >
              MIT License
            </button>
            
            <span className="text-gray-600">•</span>
            
            <button
              onClick={openGitHub}
              className="hover:text-gray-300 transition-colors underline"
            >
              GitHub
            </button>
            
            <span className="text-gray-600">•</span>
            
            <span className="text-gray-500">
              Not affiliated with Kinetic Games
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-gray-500">
              v{process.env.REACT_APP_VERSION || '1.0.0'}
            </span>
            
            {process.env.REACT_APP_BUILD_DATE && (
              <>
                <span className="text-gray-600">•</span>
                <span className="text-gray-500" title="Build Date">
                  {process.env.REACT_APP_BUILD_DATE}
                </span>
              </>
            )}
            
            <span className="text-gray-600">•</span>
            
            <span className="text-gray-500">
              © {currentYear} Personal Project
            </span>
          </div>
        </div>
      </footer>

      <DisclaimerModal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
      />

      <GettingStartedModal 
        isOpen={isGettingStartedOpen} 
        onClose={() => setIsGettingStartedOpen(false)} 
      />
    </>
  );
};

export default Footer;