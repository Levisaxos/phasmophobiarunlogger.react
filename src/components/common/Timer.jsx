// src/components/common/Timer.jsx
import React, { useState, useEffect, useRef } from 'react';

const Timer = ({ onTimeUpdate, autoStart = false, className = "" }) => {
  const [time, setTime] = useState(0); // Time in seconds
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          const newTime = prevTime + 1;
          if (onTimeUpdate) {
            onTimeUpdate(newTime);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, onTimeUpdate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    if (onTimeUpdate) {
      onTimeUpdate(0);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Timer Display */}
      <div className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 min-w-[100px]">
        <div className="text-center">
          <div className="text-lg font-mono font-bold text-gray-100">
            {formatTime(time)}
          </div>
          <div className="text-xs text-gray-400">
            {isRunning ? 'Running' : time > 0 ? 'Paused' : 'Stopped'}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex gap-1">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            title="Start Timer"
          >
            ▶️
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
            title="Pause Timer"
          >
            ⏸️
          </button>
        )}
        
        <button
          onClick={handleStop}
          disabled={!isRunning && time === 0}
          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          title="Stop Timer"
        >
          ⏹️
        </button>
        
        <button
          onClick={handleReset}
          disabled={time === 0}
          className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          title="Reset Timer"
        >
          🔄
        </button>
      </div>
    </div>
  );
};

export default Timer;