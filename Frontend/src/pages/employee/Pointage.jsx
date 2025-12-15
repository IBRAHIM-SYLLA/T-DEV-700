import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";
import DataService from "../../../services/DataService";
import AttendanceService from "../../../services/AttendanceService";

// Fonctions utilitaires pour le formatage du temps
const formatTime = (date) => {
  return date.toLocaleTimeString('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

const formatDate = (date) => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDuration = (hours) => {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
};

export default function Pointage({ onTimeUpdate }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentUser, setCurrentUser] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [todayClock, setTodayClock] = useState(null);
  const [canClockIn, setCanClockIn] = useState(false);
  const [canClockOut, setCanClockOut] = useState(false);
  const [arrivalStatus, setArrivalStatus] = useState(null);
  const [workedTime, setWorkedTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendanceRules, setAttendanceRules] = useState(null);

  // Récupérer l'utilisateur connecté depuis localStorage
  const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  const CURRENT_USER_ID = storedUser.userId || storedUser.user_id || 3;

  // Charger les données initiales
  useEffect(() => {
    loadUserData();
  }, []);

  // Mettre à jour l'horloge chaque seconde
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Mettre à jour le temps travaillé si en cours
      if (todayClock && !todayClock.departure_time) {
        updateWorkedTime();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [todayClock]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Récupérer l'utilisateur
      const user = await DataService.getUserById(CURRENT_USER_ID);
      setCurrentUser(user);

      // Récupérer les règles d'émargement
      const rules = await DataService.getAttendanceRules();
      setAttendanceRules(rules);

      // Récupérer le planning du jour
      const today = new Date();
      const dayOfWeek = AttendanceService.getDayOfWeek(
        today.toISOString().split('T')[0]
      );
      const daySchedule = await DataService.getScheduleByUserIdAndDay(
        CURRENT_USER_ID,
        dayOfWeek
      );
      setSchedule(daySchedule);

      // Récupérer tous les pointages
      const allClocks = await DataService.getAllClocks();
      
      // Vérifier les possibilités de pointage
      const clockStatus = AttendanceService.canClockNow(CURRENT_USER_ID, allClocks);
      setCanClockIn(clockStatus.canClockIn);
      setCanClockOut(clockStatus.canClockOut);
      setTodayClock(clockStatus.currentClock);

      // Calculer le statut si déjà pointé
      if (clockStatus.currentClock && daySchedule) {
        const status = AttendanceService.calculateArrivalStatus(
          daySchedule.expected_arrival_time,
          clockStatus.currentClock.arrival_time
        );
        setArrivalStatus(status);

        if (clockStatus.currentClock.departure_time) {
          updateWorkedTime(clockStatus.currentClock);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur chargement données:", error);
      setLoading(false);
    }
  };

  const updateWorkedTime = (clock = todayClock) => {
    if (!clock) return;

    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    const worked = AttendanceService.calculateWorkedHours(
      clock.arrival_time,
      clock.departure_time || timestamp
    );
    setWorkedTime(worked);
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const newClock = await DataService.clockIn(CURRENT_USER_ID);
      setTodayClock(newClock);
      setCanClockIn(false);
      setCanClockOut(true);

      // Calculer le statut d'arrivée
      if (schedule) {
        const status = AttendanceService.calculateArrivalStatus(
          schedule.expected_arrival_time,
          newClock.arrival_time
        );
        setArrivalStatus(status);

        // Afficher un message selon le statut
        if (status.status === 'late') {
          alert(`⚠️ Retard de ${status.lateMinutes} minutes\nHeure prévue: ${schedule.expected_arrival_time}\nHeure d'arrivée: ${newClock.arrival_time.split(' ')[1]}`);
        } else {
          alert(`✅ À l'heure!\nHeure d'arrivée: ${newClock.arrival_time.split(' ')[1]}`);
        }
      }

      // Notifier le parent pour rafraîchir les autres onglets
      if (onTimeUpdate) {
        onTimeUpdate({ clockIn: newClock, type: 'arrival' });
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur pointage entrée:", error);
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setLoading(true);
      const updatedClock = await DataService.clockOut(CURRENT_USER_ID);
      setTodayClock(updatedClock);
      setCanClockIn(true);
      setCanClockOut(false);
      
      // Calculer le temps total travaillé
      updateWorkedTime(updatedClock);

      if (updatedClock) {
        const worked = AttendanceService.calculateWorkedHours(
          updatedClock.arrival_time,
          updatedClock.departure_time
        );
        alert(`✅ Départ enregistré!\nTemps travaillé: ${worked.hours}h ${worked.minutes}min`);
      }

      // Notifier le parent pour rafraîchir les autres onglets
      if (onTimeUpdate) {
        onTimeUpdate({ clockOut: updatedClock, type: 'departure' });
      }

      setLoading(false);
    } catch (error) {
      console.error("Erreur pointage sortie:", error);
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!todayClock) {
      return "Absent";
    }
    
    if (!todayClock.departure_time) {
      // En cours de travail
      if (arrivalStatus && arrivalStatus.status === 'late') {
        if (arrivalStatus.duringBreak) {
          return `Retard (pointé pendant pause déj à ${todayClock.arrival_time.split(' ')[1]})`;
        }
        return `Retard (${arrivalStatus.lateMinutes}min)`;
      }
      return "Présent";
    }
    
    return "Absent";
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h1 style={styles.heading}>Pointage</h1>
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div style={styles.pointage.container}>
      <div style={styles.pointage.content}>
        <div style={styles.pointage.timeDisplay}>
          <div style={styles.pointage.currentTime}>{formatTime(currentTime)}</div>
          <div style={styles.pointage.currentDate}>{formatDate(currentTime)}</div>
        </div>
        
        <div style={styles.pointage.statusDisplay}>
          <div style={styles.pointage.statusLabel}>Statut actuel</div>
          <div style={styles.mergeStyles(
            styles.pointage.statusValue,
            getStatusDisplay() === "Absent" ? styles.pointage.statusAbsent : 
            getStatusDisplay().includes("Retard") ? styles.pointage.statusDelay :
            styles.pointage.statusPresent
          )}>
            {getStatusDisplay() === "Absent" && "❌ Absent"}
            {getStatusDisplay() === "Présent" && "✅ Présent"}
            {getStatusDisplay().includes("Retard") && `⚠️ ${getStatusDisplay()}`}
          </div>
        </div>

        {/* Temps travaillé */}
        {workedTime && todayClock && !todayClock.departure_time && (
          <div style={styles.pointage.dailyHoursDisplay}>
            <div style={styles.pointage.hoursLabel}>Temps travaillé aujourd&apos;hui</div>
            <div style={styles.pointage.hoursValue}>
              {workedTime.hours}h {workedTime.minutes.toString().padStart(2, '0')}min
            </div>
            <div style={styles.pointage.timeDetails}>
              <span>⏰ En cours depuis {todayClock.arrival_time.split(' ')[1]}</span>
              {workedTime.breakMinutes > 0 && (
                <span>🍽️ Pause déduite: {Math.floor(workedTime.breakMinutes / 60)}h{workedTime.breakMinutes % 60}min</span>
              )}
            </div>
          </div>
        )}

        {/* Info Planning */}
        {schedule && schedule.is_working_day && (
          <div style={{...styles.card, margin: '1rem 0', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px'}}>
            <div style={{fontSize: '0.9rem', opacity: 0.8}}>
              <div>📋 Horaires: {schedule.expected_arrival_time.substring(0,5)} - {schedule.expected_departure_time.substring(0,5)}</div>
              <div>🍽️ Pause: 12:00-14:00 (auto)</div>
              <div>⏱️ Tolérance: {attendanceRules?.tolerance_minutes || 5} min</div>
            </div>
          </div>
        )}

        <div style={styles.pointage.actionButtons}>
          <button 
            style={!canClockIn ? 
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnDisabled) :
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnArrivee)
            }
            onClick={handleClockIn}
            disabled={!canClockIn || loading}
          >
            {loading ? '⏳ Chargement...' : '📍 Pointer l\'arrivée'}
          </button>
          
          <button 
            style={!canClockOut ? 
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnDisabled) :
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnDepart)
            }
            onClick={handleClockOut}
            disabled={!canClockOut || loading}
          >
            {loading ? '⏳ Chargement...' : '📍 Pointer le départ'}
          </button>
        </div>

        <div style={styles.pointage.reminder}>
          <strong>💡 Rappel:</strong> Horaires 9h-12h et 14h-18h (pause déj 12h-14h auto). Tolérance {attendanceRules?.tolerance_minutes || 5}min.
        </div>
      </div>
    </div>
  );
}