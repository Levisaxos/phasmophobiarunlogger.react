// components/ClearDataModal.jsx
import React, { useState } from 'react';

const ClearDataModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  const [isClearing, setIsClearing] = useState(false);

  const handleConfirm = async () => {
    if (confirmText.toLowerCase() !== 'delete') {
      return;
    }

    setIsClearing(true);
    try {
      await onConfirm();
      setConfirmText('');
      onClose();
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Failed to clear data: ' + error.message);
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

  const canConfirm = confirmText.toLowerCase() === 'delete' && !isClearing;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-red-400">⚠️ Clear All Data</h3>
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
            This action will permanently delete <strong>ALL</strong> your data including:
          </p>
          <ul className="text-gray-400 text-sm space-y-1 mb-4">
            <li>• All runs and game history</li>
            <li>• All maps and room configurations</li>
            <li>• All ghosts and evidence setups</li>
            <li>• All players and game modes</li>
            <li>• All evidence types and cursed possessions</li>
            <li>• All application settings</li>
          </ul>
          <div className="bg-red-900/20 border border-red-600/30 rounded-md p-3">
            <p className="text-red-400 text-sm font-medium">
              ⚠️ This action cannot be undone! Make sure to export your data first if you want to keep a backup.
            </p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Type <span className="font-bold text-red-400">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            disabled={isClearing}
            className="w-full px-3 py-2 border border-gray-500 bg-gray-700 text-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Type DELETE here"
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
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearDataModal;