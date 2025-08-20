// hooks/useToast.js
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove after duration
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ 
      toasts, 
      addToast, 
      removeToast, 
      success, 
      error, 
      warning, 
      info 
    }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
  const { message, type } = toast;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-800',
          border: 'border-green-600',
          text: 'text-green-100',
          icon: '✅'
        };
      case 'error':
        return {
          bg: 'bg-red-800',
          border: 'border-red-600',
          text: 'text-red-100',
          icon: '❌'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-800',
          border: 'border-yellow-600',
          text: 'text-yellow-100',
          icon: '⚠️'
        };
      default: // info
        return {
          bg: 'bg-blue-800',
          border: 'border-blue-600',
          text: 'text-blue-100',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg shadow-xl p-4 min-w-80 max-w-md animate-slide-in-right`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg flex-shrink-0 mt-0.5">{styles.icon}</span>
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className={`ml-3 flex-shrink-0 ${styles.text} hover:opacity-70 transition-opacity`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};