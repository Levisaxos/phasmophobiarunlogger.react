// src/components/modals/DisclaimerModal.jsx
import React from 'react';

const DisclaimerModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel - Full screen */}
        <div className="inline-block w-full h-full max-w-7xl bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all">
          
          {/* Header */}
          <div className="bg-gray-800 px-6 pt-6 pb-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-600">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-100">
                  About Phasmophobia Run Tracker
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

          {/* Content - Full height with scroll */}
          <div className="bg-gray-800 px-6 py-4 overflow-y-auto" style={{height: 'calc(100% - 140px)'}}>
            
            {/* What is this section */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-orange-400 mr-2">🎯</span>
                <h4 className="text-lg font-medium text-gray-100">What is this?</h4>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Phasmophobia Run Tracker is a web-based tool designed to help Phasmophobia players 
                  track their ghost hunting sessions with friends. Record evidence, map details, ghost types, 
                  player survival rates, and build comprehensive statistics over time.
                </p>
              </div>
            </div>

            {/* Why I created this */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-yellow-400 mr-2">💡</span>
                <h4 className="text-lg font-medium text-gray-100">Why I created this</h4>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                As an avid Phasmophobia player, I found myself constantly wondering about our team's performance patterns. 
                Which maps do we struggle with most? What evidence combinations trip us up? How often do we actually survive? 
                Managing this data in spreadsheets became overwhelming.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                I wanted a simple, clean interface where I could:
              </p>
              <ul className="text-gray-300 text-sm space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Quickly log runs with detailed evidence and outcomes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Track which players survived each hunt
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Monitor success rates across different maps and difficulty modes
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  Keep everything organized without external spreadsheets
                </li>
              </ul>
              <p className="text-gray-300 text-sm leading-relaxed mt-4">
                This tool is born from personal need and shared freely with the Phasmophobia community.
              </p>
            </div>

            {/* Key Features */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-green-400 mr-2">⚡</span>
                <h4 className="text-lg font-medium text-gray-100">Key Features</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center mb-2">
                    <span className="text-blue-400 mr-2">📊</span>
                    <h5 className="font-medium text-gray-200">Comprehensive Tracking</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Record maps, ghosts, evidence, cursed possessions, and player survival status for each run
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center mb-2">
                    <span className="text-green-400 mr-2">📈</span>
                    <h5 className="font-medium text-gray-200">Statistics Dashboard</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Analyze success rates, survival patterns, and performance across different game modes
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center mb-2">
                    <span className="text-purple-400 mr-2">🎮</span>
                    <h5 className="font-medium text-gray-200">Game Mode Support</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    Track different difficulty levels, challenge modes, and custom game configurations
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/30">
                  <div className="flex items-center mb-2">
                    <span className="text-red-400 mr-2">🔒</span>
                    <h5 className="font-medium text-gray-200">Privacy First</h5>
                  </div>
                  <p className="text-xs text-gray-400">
                    All data stored locally in your browser - no accounts, no cloud storage, no tracking
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <span className="text-gray-400 mr-2">🔧</span>
                <h4 className="text-lg font-medium text-gray-100">Technical Details</h4>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h6 className="font-medium text-gray-200 mb-2">Built With:</h6>
                    <ul className="text-gray-400 space-y-1">
                      <li>• React 18 with Hooks</li>
                      <li>• Tailwind CSS</li>
                      <li>• Local Storage API</li>
                      <li>• GitHub Pages</li>
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-gray-200 mb-2">Data & Privacy:</h6>
                    <ul className="text-gray-400 space-y-1">
                      <li>• All data stays on your device</li>
                      <li>• Export/import for backups</li>
                      <li>• No user accounts required</li>
                      <li>• No analytics or tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Community & Feedback */}
            <div className="mb-6">
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600/30">
                <div className="flex items-center mb-3">
                  <span className="text-blue-400 mr-2">💬</span>
                  <h4 className="text-lg font-medium text-blue-200">Community & Feature Requests</h4>
                </div>
                <p className="text-blue-200 text-sm leading-relaxed mb-4">
                  This is an open-source personal project and I welcome community input! You're encouraged to:
                </p>
                <ul className="text-blue-200 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Submit feature requests or bug reports on GitHub
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Suggest improvements to the user experience
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-400 mr-2">•</span>
                    Share ideas for new statistics or tracking features
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-800/30 rounded border border-blue-500/30">
                  <p className="text-xs text-blue-300">
                    <strong>Please note:</strong> While I appreciate all feedback and suggestions, I cannot promise to 
                    implement every request. Development time is limited, and I prioritize features that benefit 
                    the broader Phasmophobia community while maintaining the tool's simplicity and performance.
                  </p>
                </div>
              </div>
            </div>

            {/* Legal Disclaimer */}
            <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-600/30">
              <div className="flex items-center mb-3">
                <span className="text-yellow-400 mr-2">⚠️</span>
                <h4 className="text-lg font-medium text-yellow-200">Important Disclaimer</h4>
              </div>
              <p className="text-yellow-200 text-sm leading-relaxed">
                This project is <strong>not affiliated with, endorsed by, or connected to Kinetic Games</strong>, 
                the creator of Phasmophobia. Phasmophobia is a trademark of Kinetic Games. This is an independent 
                fan project created for personal use and shared freely with the community.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-700 px-6 py-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-gray-400">
                Made with ❤️ for the Phasmophobia community
              </div>
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-6 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                onClick={onClose}
              >
                Got it, let's hunt some ghosts! 👻
              </button>
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-600 pt-2">
              <div>
                Version {process.env.REACT_APP_VERSION || '1.0.0'}
              </div>
              <div>
                {process.env.REACT_APP_BUILD_DATE && (
                  <span>Built on {process.env.REACT_APP_BUILD_DATE}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;