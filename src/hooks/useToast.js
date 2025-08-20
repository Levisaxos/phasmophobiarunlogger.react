// hooks/useToast.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import { TOAST_CONSTANTS } from '../constants';

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

  const addToast = useCallback((message, type = 'info', duration) => {
    // Use type-specific durations from constants
    const defaultDuration = duration || (() => {
      switch (type) {
        case 'success': return TOAST_CONSTANTS.SUCCESS_DURATION;
        case 'error': return TOAST_CONSTANTS.ERROR_DURATION;
        case 'warning': return TOAST_CONSTANTS.WARNING_DURATION;
        case 'info': return TOAST_CONSTANTS.INFO_DURATION;
        default: return TOAST_CONSTANTS.DEFAULT_DURATION;
      }
    })();

    const id = Date.now() + Math.random();
    const toast = { 
      id, 
      message, 
      type, 
      duration: defaultDuration,
      isVisible: true,
      isFading: false
    };
    
    setToasts(prev => {
      // Limit maximum number of toasts
      const updatedToasts = [...prev, toast];
      return updatedToasts.slice(-TOAST_CONSTANTS.MAX_TOASTS);
    });
    
    // Auto remove after duration (only if duration is not Infinity)
    if (defaultDuration !== Infinity) {
      // Start fade out animation before removal
      const fadeOutTimer = setTimeout(() => {
        setToasts(prev => prev.map(t => 
          t.id === id ? { ...t, isFading: true } : t
        ));
        
        // Remove after fade animation completes
        const removeTimer = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, TOAST_CONSTANTS.FADE_OUT_DURATION);
        
        return () => clearTimeout(removeTimer);
      }, defaultDuration - TOAST_CONSTANTS.FADE_OUT_DURATION);
      
      return () => clearTimeout(fadeOutTimer);
    }
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    // Start fade animation first
    setToasts(prev => prev.map(t => 
      t.id === id ? { ...t, isFading: true } : t
    ));
    
    // Remove after fade animation
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_CONSTANTS.FADE_OUT_DURATION);
  }, []);

  const success = useCallback((message, duration) => 
    addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => 
    addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => 
    addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => 
    addToast(message, 'info', duration), [addToast]);

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
  const { message, type, isFading } = toast;

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
    <div 
      className={`${styles.bg} ${styles.border} ${styles.text} border rounded-lg shadow-xl p-4 min-w-80 max-w-md transition-all duration-500 ease-in-out ${
        isFading 
          ? 'opacity-0 transform translate-x-full scale-95' 
          : 'opacity-100 transform translate-x-0 scale-100 animate-slide-in-right'
      }`}
    >
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
      
      {/* Progress bar showing remaining time */}
      <div className="mt-2 w-full bg-gray-600/30 rounded-full h-1">
        <div 
          className={`h-1 rounded-full transition-all linear ${
            type === 'success' ? 'bg-green-400' :
            type === 'error' ? 'bg-red-400' :
            type === 'warning' ? 'bg-yellow-400' :
            'bg-blue-400'
          }`}
          style={{
            width: '100%',
            animation: `toast-progress ${toast.duration}ms linear`
          }}
        />
      </div>
    </div>
  );
};