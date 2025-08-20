// utils/dateUtils.js

/**
 * Format date for display in Dutch locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for display in Dutch locale
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted time string
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 * @returns {string} Today's date
 */
export const getToday = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get current timestamp in ISO format
 * @returns {string} Current timestamp
 */
export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};