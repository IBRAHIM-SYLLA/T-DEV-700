import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";

export default function MonResume({ timeData }) {
  const [weeklyData, setWeeklyData] = useState({
    totalHours: 0,
    overtimeHours: 0,
    daysWorked: 0,
    totalDays: 5
  });

  const [weekDays, setWeekDays] = useState([
    { 
      day: "Lundi", 
      clockIn: "--:--", 
      clockOut: "--:--", 
      worked: 0, 
      overtime: 0, 
      present: false 
    },
    { 
      day: "Mardi", 
      clockIn: "--:--", 
      clockOut: "--:--", 
      worked: 0, 
      overtime: 0, 
      present: false 
    },
    { 
      day: "Mercredi", 
      clockIn: "--:--", 
      clockOut: "--:--", 
      worked: 0, 
      overtime: 0, 
      present: false 
    },
    { 
      day: "Jeudi", 
      clockIn: "--:--", 
      clockOut: "--:--", 
      worked: 0, 
      overtime: 0, 
      present: false 
    },
    { 
      day: "Vendredi", 
      clockIn: "--:--", 
      clockOut: "--:--", 
      worked: 0, 
      overtime: 0, 
      present: false 
    }
  ]);

  // Fonction pour mettre à jour les données de la semaine
  const updateWeekDays = () => {
    const today = new Date();
    const todayString = today.toDateString();
    const dayOfWeek = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    
    // Récupérer les données sauvegardées pour aujourd'hui
    const savedData = localStorage.getItem(`timeTrack_${todayString}`);
    
    // Debug: Afficher les données récupérées
    console.log("MonResume - Données localStorage:", savedData);
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const todayName = dayNames[dayOfWeek];
      
      console.log("MonResume - Jour actuel:", todayName);
      console.log("MonResume - Sessions:", parsedData.sessions);
      console.log("MonResume - Status:", parsedData.status);
      console.log("MonResume - isWorking:", parsedData.isWorking);
      
      setWeekDays(prevDays => {
        const updatedDays = prevDays.map(day => {
          if (day.day === todayName) {
            // Récupérer les heures d'arrivée et départ depuis les sessions
            const sessions = parsedData.sessions || [];
            let clockIn = "--:--";
            let clockOut = "--:--";
            
            if (sessions.length > 0) {
              // Première session pour l'heure d'arrivée
              const firstSession = sessions[0];
              // clockIn est déjà formaté comme "14:30", pas besoin de conversion
              clockIn = firstSession.clockIn || "--:--";
              
              // Dernière session pour l'heure de départ  
              const lastSession = sessions[sessions.length - 1];
              if (lastSession.clockOut) {
                // clockOut est déjà formaté comme "17:30"
                clockOut = lastSession.clockOut;
              } else if (parsedData.isWorking === false) {
                clockOut = "--:--"; // Pas encore pointé le départ
              }
            } else if (parsedData.currentSessionStart) {
              // Session en cours sans session complète
              clockIn = new Date(parsedData.currentSessionStart).toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              });
            }
            
            const worked = parsedData.totalHours || 0;
            const overtime = Math.max(0, worked - 8);
            const present = parsedData.status === "Présent" || parsedData.isWorking || sessions.length > 0;
            
            return {
              ...day,
              clockIn,
              clockOut,
              worked,
              overtime,
              present
            };
          }
          return day;
        });
        
        // Calculer les totaux
        const totalWorked = updatedDays.reduce((sum, day) => sum + (day.present ? day.worked : 0), 0);
        const totalOvertime = updatedDays.reduce((sum, day) => sum + day.overtime, 0);
        const daysPresent = updatedDays.filter(day => day.present).length;
        
        setWeeklyData({
          totalHours: totalWorked,
          overtimeHours: totalOvertime,
          daysWorked: daysPresent,
          totalDays: 5
        });
        
        return updatedDays;
      });
    }
  };

  // Mise à jour initiale
  useEffect(() => {
    updateWeekDays();
  }, [timeData]);

  // Vérification périodique des mises à jour dans localStorage
  useEffect(() => {
    const interval = setInterval(() => {
      updateWeekDays();
    }, 1000); // Vérifier chaque seconde pour une réactivité maximale

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (hours) => {
    if (hours === 0) return "0h 00m";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div style={styles.resume.container}>
      <h2 style={styles.resume.title}>Mon résumé hebdomadaire</h2>
      
      <div style={styles.resume.cards}>
        <div style={styles.resume.card}>
          <div style={styles.resume.cardIcon}>⏰</div>
          <div style={styles.resume.cardContent}>
            <div style={styles.resume.cardLabel}>Heures travaillées</div>
            <div style={styles.resume.cardValue}>{formatDuration(weeklyData.totalHours)}</div>
          </div>
        </div>
        
        <div style={styles.resume.card}>
          <div style={styles.resume.cardIcon}>💰</div>
          <div style={styles.resume.cardContent}>
            <div style={styles.resume.cardLabel}>Heures supplémentaires</div>
            <div style={styles.mergeStyles(styles.resume.cardValue, styles.resume.cardValueOvertime)}>
              {formatDuration(weeklyData.overtimeHours)}
            </div>
          </div>
        </div>
        
        <div style={styles.resume.card}>
          <div style={styles.resume.cardIcon}>📅</div>
          <div style={styles.resume.cardContent}>
            <div style={styles.resume.cardLabel}>Jours présents</div>
            <div style={styles.resume.cardValue}>{weeklyData.daysWorked}/{weeklyData.totalDays}</div>
          </div>
        </div>
      </div>

      <div style={styles.resume.weekDetail}>
        <h3 style={styles.resume.weekTitle}>Détail de la semaine</h3>
        
        <div style={styles.resume.weekDays}>
          {weekDays.map((dayData, index) => (
            <div key={index} style={styles.resume.dayRow}>
              <div style={styles.resume.dayInfo}>
                <div style={styles.mergeStyles(
                  styles.resume.dayIndicator,
                  dayData.present ? styles.resume.dayIndicatorActive : {}
                )}></div>
                <span style={styles.resume.dayName}>{dayData.day}</span>
              </div>
              <div style={styles.resume.dayTimes}>
                <span style={styles.resume.timeRange}>
                  {dayData.present ? `${dayData.clockIn} - ${dayData.clockOut || '--:--'}` : 'Absent'}
                </span>
                {/* Statut de ponctualité */}
                {dayData.present && (
                  <span style={{
                    ...styles.resume.attendanceStatus,
                    ...(dayData.attendanceStatus && dayData.attendanceStatus.includes("Retard") 
                      ? styles.resume.attendanceStatusLate 
                      : styles.resume.attendanceStatusOnTime)
                  }}>
                    {dayData.attendanceStatus || "À l'heure"}
                  </span>
                )}
                <span style={styles.resume.hoursWorked}>
                  {dayData.present ? formatDuration(dayData.worked) : '--:--'}
                </span>
                <span style={styles.resume.overtime}>
                  {dayData.overtime > 0 ? `+${formatDuration(dayData.overtime)}` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div style={styles.resume.overtimeSummary}>
          <div style={styles.resume.overtimeText}>
            <span style={styles.resume.overtimeLabel}>Total heures supplémentaires</span>
            <span style={styles.resume.overtimeNote}>Rémunération majorée à 125%</span>
          </div>
          <div style={styles.resume.overtimeTotal}>{formatDuration(weeklyData.overtimeHours)}</div>
        </div>
      </div>
    </div>
  );
}