// components/ClearRunDataModal.jsx
import React, { useState } from 'react';

const ClearRunDataModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() !== 'delete runs') {
      return;
    }

    setIsClearing(true);
    try {
      await onConfirm();
      setConfirmText('');
      onClose();
    } catch (error) {
      console.error('Error clearing run data:', error);
      alert('Failed to clear run data: ' + error.message);
    } finally {
      setIsClearing(false);
    }
  };

  const handleClose = () => {
    if (!isClearing) {
      setConfirmText('');
      onClose();
    }
  };

  const canConfirm = confirmText.toLowerCase() === 'delete runs' && !isClearing;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-orange-400">🗑️ Clear Run Data</h3>
          <button
            onClick={handleClose}
            disabled={isClearing}
            className="text-gray-400 hover:text-gray-200 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 mb-4">
            This action will permanently delete <strong>ALL run data</strong> including:
          </p>
          <ul className="text-gray-400 text-sm space-y-1 mb-4">
            <li>• All game runs and history</li>
            <li>• Player statistics from runs</li>
            <li>• Ghost encounter records</li>
            <li>• Evidence collection data</li>
            <li>• Session information</li>
          </ul>
          
          <div className="bg-green-900/20 border border-green-600/30 rounded-md p-3 mb-4">
            <p className="text-green-400 text-sm font-medium">
              ✅ This will preserve all your configuration data:
            </p>
            <ul className="text-green-300 text-xs mt-1 space-y-0.5">
              <li>• Maps and rooms</li>
              <li>• Ghosts and evidence types</li>
              <li>• Players and game modes</li>
              <li>• Cursed possessions</li>
            </ul>
          </div>
          
          <div className="bg-orange-900/20 border border-orange-600/30 rounded-md p-3">
            <p className="text-orange-400 text-sm font-medium">
              ⚠️ This action cannot be undone! Make sure to export your data first if you want to keep a backup of your run history.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type <span className="font-bold text-orange-400">DELETE RUNS</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isClearing}
            className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Type DELETE RUNS here"
            autoComplete="off"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            disabled={isClearing}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isClearing ? 'Clearing...' : 'Clear Run Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearRunDataModal;