import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";

export default function Pointage({ onTimeUpdate }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState("Absent");
  const [currentSessionStart, setCurrentSessionStart] = useState(null);
  const [dailyHours, setDailyHours] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [todaySessions, setTodaySessions] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const today = new Date().toDateString();
    const savedData = localStorage.getItem(`timeTrack_${today}`);
    
    if (savedData) {
      const data = JSON.parse(savedData);
      setStatus(data.status || "Absent");
      setIsWorking(data.isWorking || false);
      setDailyHours(data.totalHours || 0);
      setTodaySessions(data.sessions || []);
      
      // Si en cours de travail, récupérer la session actuelle
      if (data.isWorking && data.currentSessionStart) {
        setCurrentSessionStart(new Date(data.currentSessionStart));
      }
    }
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // If currently working, update daily hours
      if (isWorking && currentSessionStart) {
        const now = new Date();
        const currentSessionTime = (now - currentSessionStart) / (1000 * 60 * 60);
        const completedSessionsTime = todaySessions.reduce((total, session) => total + session.duration, 0);
        const totalDailyHours = completedSessionsTime + currentSessionTime;
        
        setDailyHours(totalDailyHours);
        
        // Notify parent component of time update
        if (onTimeUpdate) {
          onTimeUpdate({
            status,
            sessions: todaySessions,
            currentSessionStart,
            dailyHours: totalDailyHours,
            isWorking
          });
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isWorking, currentSessionStart, status, onTimeUpdate, todaySessions]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR');
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  const handleClockIn = () => {
    const now = new Date();
    setCurrentSessionStart(now);
    setStatus("Présent");
    setIsWorking(true);
    
    // Save to localStorage
    const today = new Date().toDateString();
    const timeData = {
      status: "Présent",
      isWorking: true,
      currentSessionStart: now.toISOString(),
      sessions: todaySessions,
      totalHours: dailyHours,
      date: today
    };
    localStorage.setItem(`timeTrack_${today}`, JSON.stringify(timeData));
    
    const sessionNumber = todaySessions.length + 1;
    alert(`Session ${sessionNumber} - Arrivée pointée à ${formatTime(now)}`);
  };

  const handleClockOut = () => {
    const now = new Date();
    setStatus("Absent");
    setIsWorking(false);
    
    if (currentSessionStart) {
      // Calculer la durée de la session actuelle
      const sessionDuration = (now - currentSessionStart) / (1000 * 60 * 60);
      
      // Créer la nouvelle session
      const newSession = {
        sessionNumber: todaySessions.length + 1,
        clockIn: formatTime(currentSessionStart),
        clockOut: formatTime(now),
        duration: sessionDuration,
        startTime: currentSessionStart.toISOString(),
        endTime: now.toISOString()
      };
      
      // Ajouter à la liste des sessions
      const updatedSessions = [...todaySessions, newSession];
      setTodaySessions(updatedSessions);
      
      // Calculer le total des heures
      const totalHours = updatedSessions.reduce((total, session) => total + session.duration, 0);
      setDailyHours(totalHours);
      setCurrentSessionStart(null);
      
      // Save to localStorage
      const today = new Date().toDateString();
      const timeData = {
        status: "Absent",
        isWorking: false,
        sessions: updatedSessions,
        totalHours: totalHours,
        date: today
      };
      localStorage.setItem(`timeTrack_${today}`, JSON.stringify(timeData));
      
      // Sauvegarder dans l'historique seulement à la fin de la journée ou mise à jour
      const historyKey = 'timeTrack_history';
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
      
      // Calculer les infos pour l'historique
      const firstSession = updatedSessions[0];
      const lastSession = updatedSessions[updatedSessions.length - 1];
      
      const todayRecord = {
        date: now.toLocaleDateString('fr-FR'),
        clockIn: firstSession.clockIn,
        clockOut: lastSession.clockOut,
        duration: totalHours,
        overtime: Math.max(0, totalHours - 8),
        status: totalHours >= 8 ? "Complet" : "Incomplet",
        sessions: updatedSessions.length
      };
      
      // Remplacer ou ajouter l'enregistrement d'aujourd'hui
      const filteredHistory = history.filter(record => record.date !== todayRecord.date);
      filteredHistory.unshift(todayRecord);
      localStorage.setItem(historyKey, JSON.stringify(filteredHistory));
      
      // Notify parent with final time data
      if (onTimeUpdate) {
        onTimeUpdate({
          status: "Absent",
          sessions: updatedSessions,
          dailyHours: totalHours,
          isWorking: false
        });
      }
      
      alert(`Session ${newSession.sessionNumber} terminée - Départ pointé à ${formatTime(now)}\nTemps de session: ${formatDuration(sessionDuration)}\nTotal journée: ${formatDuration(totalHours)}`);
    }
  };

  const handleResetData = () => {
    if (window.confirm("Êtes-vous sûr de vouloir effacer toutes les données de pointage ?")) {
      // Clear all localStorage data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('timeTrack_')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset component state
      setStatus("Absent");
      setCurrentSessionStart(null);
      setDailyHours(0);
      setIsWorking(false);
      setTodaySessions([]);
      
      // Notify parent
      if (onTimeUpdate) {
        onTimeUpdate({
          status: "Absent",
          sessions: [],
          dailyHours: 0,
          isWorking: false
        });
      }
      
      alert("Toutes les données ont été réinitialisées !");
      
      // Reload the page to ensure all components are reset
      window.location.reload();
    }
  };

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
            status === "Absent" ? styles.pointage.statusAbsent : styles.pointage.statusPresent
          )}>
            {status === "Absent" ? "❌ Absent" : "✅ Présent"}
          </div>
        </div>

        {/* Daily Hours Display */}
        {(todaySessions.length > 0 || isWorking) && (
          <div style={styles.pointage.dailyHoursDisplay}>
            <div style={styles.pointage.hoursLabel}>Temps travaillé aujourd'hui</div>
            <div style={styles.pointage.hoursValue}>{formatDuration(dailyHours)}</div>
            
            <div style={styles.pointage.timeDetails}>
              <span>Sessions: {todaySessions.length + (isWorking ? 1 : 0)}</span>
              {isWorking && <span>⏱️ En cours</span>}
            </div>
          </div>
        )}

        <div style={styles.pointage.actionButtons}>
          <button 
            style={status === "Présent" ? 
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnDisabled) :
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnArrivee)
            }
            onClick={handleClockIn}
            disabled={status === "Présent"}
          >
            📍 Pointer l'arrivée
          </button>
          
          <button 
            style={status === "Absent" ? 
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnDisabled) :
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnDepart)
            }
            onClick={handleClockOut}
            disabled={status === "Absent"}
          >
            📍 Pointer le départ
          </button>
        </div>

        <div style={styles.pointage.reminder}>
          <strong>Rappel:</strong> N'oubliez pas de pointer votre départ en fin de journée
        </div>

        <div style={styles.pointage.resetSection}>
          <button 
            style={styles.pointage.btnReset}
            onClick={handleResetData}
            title="Réinitialiser toutes les données"
          >
            🗑️ Réinitialiser les données
          </button>
        </div>
      </div>
    </div>
  );
}