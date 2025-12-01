import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";

// Fonctions utilitaires pour le formatage du temps
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

// Fonction pour calculer le statut de ponctualité selon les règles métier
const calculateAttendanceStatus = (clockInTime) => {
  if (!clockInTime) return "Absent";
  
  const clockIn = new Date(clockInTime);
  const hours = clockIn.getHours();
  const minutes = clockIn.getMinutes();
  const totalMinutes = hours * 60 + minutes;
  
  // Heures de travail : 9h00-18h00 avec pause 12h00-14h00
  const workStart = 9 * 60; // 9h00 = 540 minutes
  const toleranceEnd = 9 * 60 + 5; // 9h05 = 545 minutes
  const lunchStart = 12 * 60; // 12h00 = 720 minutes
  const lunchEnd = 14 * 60; // 14h00 = 840 minutes
  const workEnd = 18 * 60; // 18h00 = 1080 minutes
  
  // Vérification des heures de travail valides
  if (totalMinutes < workStart) {
    // Pointage avant 9h00 - Arrivée anticipée
    return "À l'heure";
  } else if (totalMinutes <= toleranceEnd) {
    // Entre 9h00 et 9h05 - Dans la tolérance
    return "À l'heure";
  } else if (totalMinutes < lunchStart) {
    // Entre 9h05 et 12h00 - Retard matinal
    const lateMinutes = totalMinutes - toleranceEnd;
    return `Retard (${lateMinutes}min)`;
  } else if (totalMinutes >= lunchStart && totalMinutes < lunchEnd) {
    // Entre 12h00 et 14h00 - Pause déjeuner
    return "Pause déjeuner";
  } else if (totalMinutes >= lunchEnd && totalMinutes <= workEnd) {
    // Entre 14h00 et 18h00 - Reprise après pause
    return "Reprise après pause";
  } else {
    // Après 18h00 - Hors horaires de travail
    return "Hors horaires";
  }
};

export default function Pointage({ onTimeUpdate }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState("Absent");
  const [currentSessionStart, setCurrentSessionStart] = useState(null);
  const [dailyHours, setDailyHours] = useState(0);
  const [isWorking, setIsWorking] = useState(false);
  const [todaySessions, setTodaySessions] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState(null);

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
      setAttendanceStatus(data.attendanceStatus || null);
      
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
        
        // Update localStorage in real-time during work
        const today = new Date().toDateString();
        const timeData = {
          status: status,
          isWorking: true,
          currentSessionStart: currentSessionStart.toISOString(),
          sessions: todaySessions,
          totalHours: totalDailyHours,
          date: today
        };
        localStorage.setItem(`timeTrack_${today}`, JSON.stringify(timeData));
        
        // Debug: Afficher les données sauvegardées
        console.log("Pointage - Données sauvegardées:", timeData);
        
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

  const handleClockIn = () => {
    const now = new Date();
    setCurrentSessionStart(now);
    setIsWorking(true);
    
    // Calculer le statut de ponctualité
    const attendanceStatus = calculateAttendanceStatus(now.toISOString());
    setAttendanceStatus(attendanceStatus);
    
    // Définir le statut correct (ne pas forcer "Présent" si hors horaires)
    const actualStatus = attendanceStatus === "Hors horaires" ? "Hors horaires" : "Présent";
    setStatus(actualStatus);
    
    // Save to localStorage
    const today = new Date().toDateString();
    const timeData = {
      status: actualStatus,
      isWorking: true,
      currentSessionStart: now.toISOString(),
      sessions: todaySessions,
      totalHours: dailyHours,
      date: today,
      attendanceStatus: attendanceStatus
    };
    localStorage.setItem(`timeTrack_${today}`, JSON.stringify(timeData));
    
    const sessionNumber = todaySessions.length + 1;
    
    // Message informatif selon les règles métier
    let message = `Session ${sessionNumber} - Arrivée pointée à ${formatTime(now)}\n✅ Statut de ponctualité: ${attendanceStatus}`;
    
    if (attendanceStatus === "Hors horaires") {
      message += "\n\n⚠️ ATTENTION: Pointage en dehors des heures de travail!\n📅 Horaires normaux: 9h00-18h00 (avec pause 12h-14h)";
    } else if (attendanceStatus === "Pause déjeuner") {
      message += "\n\n🍽️ INFO: Pointage pendant la pause déjeuner (12h00-14h00)\n⚠️ Cette période n'est pas comptabilisée";
    } else if (attendanceStatus.includes("Retard")) {
      message += "\n\n⏰ RAPPEL: Les heures de travail commencent à 9h00\n✓ Tolérance: jusqu'à 9h05";
    } else if (attendanceStatus === "À l'heure") {
      message += "\n\n✅ Excellent! Vous êtes à l'heure.";
    }
    
    alert(message);
  };

  const handleClockOut = () => {
    const now = new Date();
    setStatus("Absent");
    setIsWorking(false);
    
    if (currentSessionStart) {
      // Calculer la durée de la session actuelle
      const sessionDuration = (now - currentSessionStart) / (1000 * 60 * 60);
      
      // Calculer le statut de ponctualité pour cette session
      const attendanceStatus = calculateAttendanceStatus(currentSessionStart.toISOString());
      
      // Créer la nouvelle session avec le statut de ponctualité
      const newSession = {
        sessionNumber: todaySessions.length + 1,
        clockIn: formatTime(currentSessionStart),
        clockOut: formatTime(now),
        duration: sessionDuration,
        startTime: currentSessionStart.toISOString(),
        endTime: now.toISOString(),
        attendanceStatus: attendanceStatus
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
      
      // Calculer le statut global de la journée
      const hasLateSession = updatedSessions.some(session => 
        session.attendanceStatus && session.attendanceStatus.includes("Retard")
      );
      const dailyAttendanceStatus = hasLateSession ? "Retard" : "À l'heure";
      
      const todayRecord = {
        date: now.toLocaleDateString('fr-FR'),
        clockIn: firstSession.clockIn,
        clockOut: lastSession.clockOut,
        duration: totalHours,
        overtime: Math.max(0, totalHours - 8),
        status: totalHours >= 8 ? "Complet" : "Incomplet",
        sessions: updatedSessions.length,
        attendanceStatus: dailyAttendanceStatus,
        sessionsDetail: updatedSessions
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
            {status === "Absent" ? "❌ Absent" : status === "Hors horaires" ? "⚠️ Hors horaires" : "✅ Présent"}
          </div>
        </div>

        {/* Attendance Status Display */}
        {attendanceStatus && isWorking && (
          <div style={{
            ...styles.pointage.dailyHoursDisplay,
            backgroundColor: attendanceStatus.includes("Retard") ? "#fff3cd" : 
                           attendanceStatus === "Hors horaires" ? "#f8d7da" :
                           attendanceStatus === "À l'heure" ? "#d4edda" : "#d1ecf1",
            border: `2px solid ${attendanceStatus.includes("Retard") ? "#ffc107" : 
                                 attendanceStatus === "Hors horaires" ? "#dc3545" :
                                 attendanceStatus === "À l'heure" ? "#28a745" : "#17a2b8"}`,
            marginTop: "15px"
          }}>
            <div style={styles.pointage.hoursLabel}>Statut de ponctualité</div>
            <div style={{
              ...styles.pointage.hoursValue,
              color: attendanceStatus.includes("Retard") ? "#856404" : 
                     attendanceStatus === "Hors horaires" ? "#721c24" :
                     attendanceStatus === "À l'heure" ? "#155724" : "#0c5460",
              fontSize: "1.3em"
            }}>
              {attendanceStatus.includes("Retard") ? "⏰" : 
               attendanceStatus === "Hors horaires" ? "⚠️" :
               attendanceStatus === "À l'heure" ? "✅" : "ℹ️"} {attendanceStatus}
            </div>
          </div>
        )}

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
            style={(status === "Présent" || status === "Hors horaires") ? 
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnDisabled) :
              styles.mergeStyles(styles.pointage.btnBase, styles.pointage.btnArrivee)
            }
            onClick={handleClockIn}
            disabled={status === "Présent" || status === "Hors horaires"}
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
      </div>
    </div>
  );
}