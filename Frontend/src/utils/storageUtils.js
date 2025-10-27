/**
 * localStorage Utility Functions for TimeTrack App
 */

/**
 * Get timetrack data for a specific date
 * @param {string} dateKey - Date string key
 * @returns {object|null} Parsed data or null
 */
export function getTimeTrackData(dateKey) {
  try {
    const data = localStorage.getItem(`timeTrack_${dateKey}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error parsing localStorage data:', error);
    return null;
  }
}

/**
 * Save timetrack data for a specific date
 * @param {string} dateKey - Date string key
 * @param {object} data - Data to save
 */
export function saveTimeTrackData(dateKey, data) {
  try {
    localStorage.setItem(`timeTrack_${dateKey}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Get current user from localStorage
 * @returns {object|null} Current user or null
 */
export function getCurrentUser() {
  try {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Save current user to localStorage
 * @param {object} user - User object to save
 */
export function saveCurrentUser(user) {
  try {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
}

/**
 * Get history data from localStorage
 * @returns {Array} History array or empty array
 */
export function getHistoryData() {
  try {
    const history = localStorage.getItem('timeTrack_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting history data:', error);
    return [];
  }
}

/**
 * Save history data to localStorage
 * @param {Array} historyArray - History array to save
 */
export function saveHistoryData(historyArray) {
  try {
    localStorage.setItem('timeTrack_history', JSON.stringify(historyArray));
  } catch (error) {
    console.error('Error saving history data:', error);
  }
}

/**
 * Update history with today's record
 * @param {object} todayRecord - Today's work record
 */
export function updateTodayInHistory(todayRecord) {
  try {
    const history = getHistoryData();
    const filteredHistory = history.filter(record => record.date !== todayRecord.date);
    filteredHistory.unshift(todayRecord);
    saveHistoryData(filteredHistory);
  } catch (error) {
    console.error('Error updating history:', error);
  }
}