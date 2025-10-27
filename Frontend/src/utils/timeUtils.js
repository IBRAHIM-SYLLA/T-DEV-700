/**
 * Time and Date Utility Functions
 */

/**
 * Format time to French locale (HH:MM)
 * @param {Date} date - Date object to format
 * @returns {string} Formatted time string
 */
export function formatTime(date) {
  if (!date || !(date instanceof Date)) return "--:--";
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Format date to French locale
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date || !(date instanceof Date)) return "";
  return date.toLocaleDateString('fr-FR');
}

/**
 * Format duration from hours to readable string
 * @param {number} hours - Duration in hours
 * @returns {string} Formatted duration (e.g., "8h 30m")
 */
export function formatDuration(hours) {
  if (!hours || hours === 0) return "0h 00m";
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

/**
 * Get current date as string key for localStorage
 * @returns {string} Date string for localStorage key
 */
export function getCurrentDateKey() {
  return new Date().toDateString();
}

/**
 * Calculate difference in minutes between two dates
 * @param {Date} laterDate - Later date
 * @param {Date} earlierDate - Earlier date
 * @returns {number} Difference in minutes
 */
export function differenceInMinutes(laterDate, earlierDate) {
  if (!laterDate || !earlierDate) return 0;
  return Math.round((laterDate - earlierDate) / (1000 * 60));
}

/**
 * Create a standard work start time for a given date
 * @param {Date} date - Reference date
 * @param {number} hour - Start hour (default 9)
 * @param {number} minute - Start minute (default 0)
 * @returns {Date} Standard start time
 */
export function createStandardStartTime(date, hour = 9, minute = 0) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0);
}

/**
 * Parse earliest start time from session data
 * @param {Array} sessions - Array of sessions
 * @param {string} currentSessionStart - ISO string of current session start
 * @returns {Date|null} Earliest start time or null
 */
export function parseEarliestStartTime(sessions, currentSessionStart) {
  let earliestStart = null;

  if (sessions && sessions.length > 0) {
    const firstSession = sessions[0];
    if (firstSession.startTime) {
      earliestStart = new Date(firstSession.startTime);
    } else if (firstSession.clockIn) {
      // Fallback: try to parse formatted time (best effort)
      const today = new Date();
      const timeStr = firstSession.clockIn;
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        earliestStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
      }
    }
  } else if (currentSessionStart) {
    earliestStart = new Date(currentSessionStart);
  }

  return earliestStart;
}