/**
 * Service pour gérer la logique de pointage et de calcul des heures
 */
class AttendanceService {

  pad2(n) {
    return String(n).padStart(2, '0');
  }

  toIsoDateKey(dateTime) {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    if (!Number.isFinite(date.getTime())) {
      if (typeof dateTime === 'string' && dateTime.length >= 10) return dateTime.slice(0, 10);
      return null;
    }
    // Use local date to avoid timezone shifting (e.g. -1h showing previous day)
    return `${date.getFullYear()}-${this.pad2(date.getMonth() + 1)}-${this.pad2(date.getDate())}`;
  }

  toIsoTime(dateTime) {
    if (!dateTime) return null;
    const date = new Date(dateTime);
    if (!Number.isFinite(date.getTime())) {
      if (typeof dateTime === 'string') {
        const match = dateTime.match(/(\d{2}:\d{2})(?::\d{2})?/);
        return match ? `${match[1]}:00` : null;
      }
      return null;
    }
    // Use local time so displayed times match the user's system clock
    return `${this.pad2(date.getHours())}:${this.pad2(date.getMinutes())}:${this.pad2(date.getSeconds())}`;
  }
  
  /**
   * Obtenir le jour de la semaine à partir d'une date
   * @param {string} dateString - Date au format YYYY-MM-DD
   * @returns {string} - Nom du jour en français
   */
  getDayOfWeek(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[date.getDay()];
  }

  /**
   * Vérifier si un utilisateur peut pointer maintenant
   * @param {number} userId - ID de l'utilisateur
   * @param {Array} allClocks - Tous les pointages
   * @returns {Object} - État des possibilités de pointage
   */
  canClockNow(userId, allClocks) {
    const today = this.toIsoDateKey(new Date());
    const clocks = allClocks || [];

    const hasUserIdField = clocks.some((c) => c && (typeof c.user_id !== 'undefined' || (c.user && typeof c.user.user_id !== 'undefined')));

    // Trouver le pointage du jour
    const todayClock = clocks.find((clock) => {
      const sameDay = this.toIsoDateKey(clock?.arrival_time) === today;
      if (!sameDay) return false;

      if (!hasUserIdField) return true;
      if (clock?.user_id === userId) return true;
      if (clock?.user?.user_id === userId) return true;
      return false;
    });

    if (!todayClock) {
      // Pas encore pointé aujourd'hui
      return {
        canClockIn: true,
        canClockOut: false,
        currentClock: null
      };
    }

    if (todayClock && !todayClock.departure_time) {
      // Pointé à l'arrivée mais pas au départ
      return {
        canClockIn: false,
        canClockOut: true,
        currentClock: todayClock
      };
    }

    // Déjà pointé arrivée et départ
    return {
      canClockIn: false,
      canClockOut: false,
      currentClock: todayClock
    };
  }

  /**
   * Calculer le statut d'arrivée (retard, à l'heure, avance)
   * @param {string} expectedTime - Heure prévue (HH:MM:SS)
   * @param {string} actualTime - Heure réelle (YYYY-MM-DD HH:MM:SS)
   * @returns {Object} - Statut avec détails
   */
  calculateArrivalStatus(expectedTime, actualTime) {
    // Extraire l'heure de l'arrivée réelle (ISO ou "YYYY-MM-DD HH:MM:SS")
    const actualTimeOnly = this.toIsoTime(actualTime) || String(actualTime).split(' ')[1];
    
    // Convertir en minutes depuis minuit
    const expectedMinutes = this.timeToMinutes(expectedTime);
    const actualMinutes = this.timeToMinutes(actualTimeOnly);
    
    const difference = actualMinutes - expectedMinutes;
    
    // Tolérance de 5 minutes
    const tolerance = 5;
    
    if (difference > tolerance) {
      return {
        status: 'late',
        lateMinutes: difference,
        message: `Retard de ${difference} minutes`
      };
    } else if (difference < -tolerance) {
      return {
        status: 'early',
        earlyMinutes: Math.abs(difference),
        message: `En avance de ${Math.abs(difference)} minutes`
      };
    } else {
      return {
        status: 'on-time',
        message: 'À l\'heure'
      };
    }
  }

  /**
   * Calculer les heures travaillées
   * @param {string} arrivalTime - Heure d'arrivée (YYYY-MM-DD HH:MM:SS)
   * @param {string} departureTime - Heure de départ (YYYY-MM-DD HH:MM:SS)
   * @returns {Object} - Heures et minutes travaillées
   */
  calculateWorkedHours(arrivalTime, departureTime) {
    const arrival = new Date(arrivalTime);
    const departure = new Date(departureTime);
    
    const diffMs = departure - arrival;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    return {
      hours,
      minutes,
      totalMinutes: diffMinutes,
      totalHours: diffMinutes / 60
    };
  }

  /**
   * Obtenir le statut détaillé d'un pointage
   * @param {Object} clock - Pointage
   * @param {Object} schedule - Planning
   * @returns {Object} - Statut détaillé
   */
  getClockDetailedStatus(clock, schedule) {
    if (!clock) {
      return {
        arrivalStatus: null,
        workedHours: null,
        expectedArrival: null
      };
    }

    const expectedArrival = schedule?.expected_arrival_time || '09:00:00';
    const arrivalStatus = this.calculateArrivalStatus(expectedArrival, clock.arrival_time);
    
    // Vérifier si pointé pendant la pause déjeuner
    if (schedule?.lunch_break_start && schedule?.lunch_break_end) {
      const arrivalTimeOnly = this.toIsoTime(clock.arrival_time) || clock.arrival_time.split(' ')[1];
      const arrivalMinutes = this.timeToMinutes(arrivalTimeOnly);
      const lunchStart = this.timeToMinutes(schedule.lunch_break_start);
      const lunchEnd = this.timeToMinutes(schedule.lunch_break_end);
      
      if (arrivalMinutes >= lunchStart && arrivalMinutes <= lunchEnd) {
        arrivalStatus.duringBreak = true;
      }
    }

    let workedHours = null;
    if (clock.departure_time) {
      workedHours = this.calculateWorkedHours(clock.arrival_time, clock.departure_time);
    }

    return {
      arrivalStatus,
      workedHours,
      expectedArrival
    };
  }

  /**
   * Convertir une heure (HH:MM:SS) en minutes depuis minuit
   * @param {string} timeString - Heure au format HH:MM:SS
   * @returns {number} - Minutes depuis minuit
   */
  timeToMinutes(timeString) {
    const [hours, minutes] = String(timeString).split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Formater une durée en heures et minutes
   * @param {number} totalMinutes - Total de minutes
   * @returns {string} - Format "Xh XXm"
   */
  formatDuration(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
}

// Export singleton instance
export default new AttendanceService();
