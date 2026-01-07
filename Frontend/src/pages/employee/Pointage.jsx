import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";
import AttendanceService from "../../../services/AttendanceService";
import ClocksApi from "../../../services/ClocksApi";

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

export default function Pointage({ userId, onTimeUpdate }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayClock, setTodayClock] = useState(null);
  const [canClockIn, setCanClockIn] = useState(false);
  const [canClockOut, setCanClockOut] = useState(false);
  const [arrivalStatus, setArrivalStatus] = useState(null);
  const [workedTime, setWorkedTime] = useState(null);
  const [loading, setLoading] = useState(true);

  const CURRENT_USER_ID = userId || 3;

  // Charger les données initiales
  useEffect(() => {
    loadUserData();
  }, [CURRENT_USER_ID]);

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

      // Récupérer les pointages réels depuis l'API
      const clocks = await ClocksApi.listForUser(CURRENT_USER_ID);

      // Vérifier les possibilités de pointage
      const clockStatus = AttendanceService.canClockNow(CURRENT_USER_ID, clocks);
      setCanClockIn(clockStatus.canClockIn);
      setCanClockOut(clockStatus.canClockOut);
      setTodayClock(clockStatus.currentClock);

      // Calculer le statut si déjà pointé
      if (clockStatus.currentClock) {
        const status = AttendanceService.calculateArrivalStatus('09:00:00', clockStatus.currentClock.arrival_time);
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

    const nowIso = new Date().toISOString();
    const worked = AttendanceService.calculateWorkedHours(clock.arrival_time, clock.departure_time || nowIso);
    setWorkedTime(worked);
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      const newClock = await ClocksApi.toggle(CURRENT_USER_ID);
      setTodayClock(newClock);
      setCanClockIn(false);
      setCanClockOut(true);

      const status = AttendanceService.calculateArrivalStatus('09:00:00', newClock.arrival_time);
      setArrivalStatus(status);

      const arrivalTime = AttendanceService.toIsoTime(newClock.arrival_time) || "";
      if (status.status === 'late') {
        alert(`⚠️ Retard de ${status.lateMinutes} minutes\nHeure prévue: 09:00\nHeure d'arrivée: ${arrivalTime.substring(0, 5)}`);
      } else {
        alert(`✅ À l'heure!\nHeure d'arrivée: ${arrivalTime.substring(0, 5)}`);
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
      const updatedClock = await ClocksApi.toggle(CURRENT_USER_ID);
      setTodayClock(updatedClock);
      setCanClockIn(false);
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
          const t = AttendanceService.toIsoTime(todayClock.arrival_time) || '';
          return `Retard (pointé pendant pause déj à ${t.substring(0, 5)})`;
        }
        return `Retard (${arrivalStatus.lateMinutes}min)`;
      }
      return "Présent";
    }

    if (arrivalStatus && arrivalStatus.status === 'late') {
      return `Retard (${arrivalStatus.lateMinutes}min)`;
    }
    return "Présent";
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
              <span>⏰ En cours depuis {(AttendanceService.toIsoTime(todayClock.arrival_time) || '').substring(0, 5)}</span>
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
          <strong>💡 Rappel:</strong> Horaires 9h-12h et 14h-18h (pause déj 12h-14h). Tolérance 5min.
        </div>
      </div>
    </div>
  );
}