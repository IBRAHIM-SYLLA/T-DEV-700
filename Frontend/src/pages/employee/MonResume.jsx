import React, { useState, useEffect } from "react";
import styles from "../../style/style.ts";
import DataService from "../../services/DataService";
import AttendanceService from "../../services/AttendanceService";

export default function MonResume({ userId = 3 }) {
  const [weeklyData, setWeeklyData] = useState({
    totalHours: 0,
    overtimeHours: 0,
    daysWorked: 0,
    totalDays: 5
  });

  const [weekDays, setWeekDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculer la semaine courante (Lundi - Vendredi)
  const getCurrentWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Dimanche, 1 = Lundi, ...
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lundi de cette semaine
    
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    const dates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  // Charger les données de la semaine
  const loadWeekData = async () => {
    try {
      setLoading(true);
      const weekDates = getCurrentWeekDates();
      const dayNames = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
      
      // Récupérer tous les pointages de l'utilisateur
      const allClocks = await DataService.getClocksByUserId(userId);
      const userSchedule = await DataService.getSchedulesByUserId(userId);
      
      // Mapper chaque jour de la semaine
      const weekData = weekDates.map((date, index) => {
        const dateStr = date.toISOString().split('T')[0];
        
        // Trouver les pointages pour ce jour
        const dayClocks = allClocks.filter(clock => 
          clock.arrival_time.startsWith(dateStr)
        );
        
        if (dayClocks.length === 0) {
          return {
            day: dayNames[index],
            date: dateStr,
            clockIn: "--:--",
            clockOut: "--:--",
            worked: 0,
            overtime: 0,
            present: false,
            attendanceStatus: null
          };
        }
        
        // Prendre le premier pointage du jour
        const clock = dayClocks[0];
        const clockIn = clock.arrival_time.split(' ')[1].substring(0, 5);
        const clockOut = clock.departure_time ? clock.departure_time.split(' ')[1].substring(0, 5) : "--:--";
        
        // Calculer le statut détaillé avec AttendanceService
        const detailedStatus = AttendanceService.getClockDetailedStatus(clock, userSchedule);
        
        // Calculer les heures supplémentaires (> 7h)
        const overtime = Math.max(0, (detailedStatus.workedTime.totalMinutes / 60) - 7);
        
        return {
          day: dayNames[index],
          date: dateStr,
          clockIn,
          clockOut,
          worked: detailedStatus.workedTime.totalMinutes / 60,
          overtime,
          present: true,
          attendanceStatus: detailedStatus.arrivalStatus.status === 'late' 
            ? (detailedStatus.arrivalStatus.duringBreak 
                ? `Retard (pause déj)` 
                : `Retard (+${detailedStatus.arrivalStatus.lateMinutes}min)`)
            : "À l'heure"
        };
      });
      
      setWeekDays(weekData);
      
      // Calculer les totaux
      const totalHours = weekData.reduce((sum, day) => sum + day.worked, 0);
      const totalOvertime = weekData.reduce((sum, day) => sum + day.overtime, 0);
      const daysWorked = weekData.filter(day => day.present).length;
      
      setWeeklyData({
        totalHours,
        overtimeHours: totalOvertime,
        daysWorked,
        totalDays: 5
      });
      
    } catch (error) {
      console.error("Erreur chargement résumé:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadWeekData();
  }, [userId]);

  // Recharger périodiquement pour voir les nouveaux pointages
  useEffect(() => {
    const interval = setInterval(() => {
      loadWeekData();
    }, 5000); // Toutes les 5 secondes

    return () => clearInterval(interval);
  }, [userId]);

  const formatDuration = (hours) => {
    if (hours === 0) return "0h 00m";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  if (loading) {
    return (
      <div style={styles.resume.container}>
        <h2 style={styles.resume.title}>Mon résumé hebdomadaire</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>Chargement...</div>
      </div>
    );
  }

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