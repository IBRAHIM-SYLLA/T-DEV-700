import { differenceInMinutes, createStandardStartTime, parseEarliestStartTime } from './timeUtils';

/**
 * Business Logic Functions for TimeTrack App
 */

/**
 * Calculate lateness and early start bonus
 * @param {Array} sessions - Array of work sessions
 * @param {string} currentSessionStart - ISO string of current session
 * @param {number} toleranceMinutes - Tolerance in minutes (default 5)
 * @param {number} standardHour - Standard start hour (default 9)
 * @returns {object} { lateMinutes, earlyMinutes, overtimeBonus }
 */
export function calculateLateness(sessions, currentSessionStart, toleranceMinutes = 5, standardHour = 9) {
  const earliestStart = parseEarliestStartTime(sessions, currentSessionStart);
  
  let lateMinutes = 0;
  let earlyMinutes = 0;
  let overtimeBonus = 0;

  if (earliestStart) {
    const standardStart = createStandardStartTime(earliestStart, standardHour, 0);
    const diffMinutes = differenceInMinutes(earliestStart, standardStart);
    
    if (diffMinutes > 0) {
      // Started after standard time - apply tolerance
      lateMinutes = Math.max(0, diffMinutes - toleranceMinutes);
    } else if (diffMinutes < 0) {
      // Started before standard time - bonus to overtime
      earlyMinutes = Math.abs(diffMinutes);
      overtimeBonus = earlyMinutes / 60; // Convert to hours
    }
  }

  return { lateMinutes, earlyMinutes, overtimeBonus };
}

/**
 * Calculate total overtime including early start bonus
 * @param {number} workedHours - Total hours worked
 * @param {number} overtimeBonus - Early start bonus hours
 * @param {number} standardWorkDay - Standard work day hours (default 8)
 * @returns {number} Total overtime hours
 */
export function calculateTotalOvertime(workedHours, overtimeBonus, standardWorkDay = 8) {
  return Math.max(0, workedHours - standardWorkDay) + overtimeBonus;
}

/**
 * Create session object for storage
 * @param {number} sessionNumber - Session number
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {object} Session object
 */
export function createSessionObject(sessionNumber, startTime, endTime) {
  const duration = (endTime - startTime) / (1000 * 60 * 60); // Hours
  
  return {
    sessionNumber,
    clockIn: startTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    clockOut: endTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    duration,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  };
}

/**
 * Create daily summary for history
 * @param {Array} sessions - Array of sessions
 * @param {Date} date - Work date
 * @returns {object} Daily summary object
 */
export function createDailySummary(sessions, date) {
  if (!sessions || sessions.length === 0) return null;

  const firstSession = sessions[0];
  const lastSession = sessions[sessions.length - 1];
  const totalHours = sessions.reduce((sum, session) => sum + session.duration, 0);
  
  return {
    date: date.toLocaleDateString('fr-FR'),
    clockIn: firstSession.clockIn,
    clockOut: lastSession.clockOut,
    duration: totalHours,
    overtime: Math.max(0, totalHours - 8),
    status: totalHours >= 8 ? "Complet" : "Incomplet",
    sessions: sessions.length
  };
}

/**
 * Filter records by period
 * @param {Array} records - Array of records
 * @param {string} period - Period ('Ce mois', 'Mois précédent', 'Dernier 3 mois')
 * @returns {Array} Filtered records
 */
export function filterRecordsByPeriod(records, period) {
  if (!records || records.length === 0) return [];

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return records.filter(record => {
    const recordDate = new Date(record.date.split('/').reverse().join('-'));
    const recordMonth = recordDate.getMonth();
    const recordYear = recordDate.getFullYear();

    switch (period) {
      case 'Ce mois':
        return recordMonth === currentMonth && recordYear === currentYear;
      
      case 'Mois précédent':
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return recordMonth === prevMonth && recordYear === prevYear;
      
      case 'Dernier 3 mois':
        const threeMonthsAgo = new Date(currentYear, currentMonth - 3, 1);
        return recordDate >= threeMonthsAgo;
      
      default:
        return true;
    }
  });
}