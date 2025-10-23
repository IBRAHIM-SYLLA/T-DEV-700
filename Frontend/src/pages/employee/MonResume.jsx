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
    { day: "Lundi", clockIn: "--:--", clockOut: "--:--", worked: 0, overtime: 0, present: false },
    { day: "Mardi", clockIn: "--:--", clockOut: "--:--", worked: 0, overtime: 0, present: false },
    { day: "Mercredi", clockIn: "--:--", clockOut: "--:--", worked: 0, overtime: 0, present: false },
    { day: "Jeudi", clockIn: "--:--", clockOut: "--:--", worked: 0, overtime: 0, present: false },
    { day: "Vendredi", clockIn: "--:--", clockOut: "--:--", worked: 0, overtime: 0, present: false }
  ]);

  // Load data from localStorage and update today's data
  useEffect(() => {
    const updateTodayData = () => {
      const today = new Date().toDateString();
      const savedTodayData = localStorage.getItem(`timeTrack_${today}`);
      
      if (savedTodayData) {
        const saved = JSON.parse(savedTodayData);
        const sessions = saved.sessions || [];
        const isWorking = saved.isWorking || false;
        const currentSessionStart = saved.currentSessionStart ? new Date(saved.currentSessionStart) : null;
        
        let firstClockIn = null;
        let lastClockOut = null;
        let totalHours = saved.totalHours || 0;
        
        if (sessions.length > 0) {
          firstClockIn = sessions[0].clockIn;
          lastClockOut = sessions[sessions.length - 1].clockOut;
        } else if (isWorking && currentSessionStart) {
          firstClockIn = currentSessionStart.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
        
        if (isWorking && currentSessionStart) {
          const now = new Date();
          const currentSessionHours = (now - currentSessionStart) / (1000 * 60 * 60);
          const sessionsHours = sessions.reduce((total, session) => total + session.duration, 0);
          totalHours = sessionsHours + currentSessionHours;
        }
        
        updateWeekDays({
          clockInTime: firstClockIn,
          clockOutTime: lastClockOut && !isWorking ? lastClockOut : null,
          dailyHours: totalHours,
          status: saved.status || "Absent",
          isWorking: isWorking
        });
      } else if (timeData && timeData.clockInTime) {
        updateWeekDays(timeData);
      }
    };

    const updateWeekDays = (todayTimeData) => {
      if (todayTimeData && (todayTimeData.clockInTime || todayTimeData.isWorking)) {
        const today = new Date().getDay();
        const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const todayName = dayNames[today];
        
        setWeekDays(prevDays => {
          const updatedDays = prevDays.map(dayData => {
            if (dayData.day === todayName) {
              const clockIn = typeof todayTimeData.clockInTime === 'string' ? 
                todayTimeData.clockInTime : 
                (todayTimeData.clockInTime ? todayTimeData.clockInTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : '--:--');
                
              const clockOut = typeof todayTimeData.clockOutTime === 'string' ?
                todayTimeData.clockOutTime :
                (todayTimeData.clockOutTime ? todayTimeData.clockOutTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                }) : (todayTimeData.isWorking ? 'En cours...' : '--:--'));
              
              const standardHours = 8;
              const overtime = Math.max(0, todayTimeData.dailyHours - standardHours);
              
              return {
                ...dayData,
                clockIn,
                clockOut,
                worked: todayTimeData.dailyHours,
                overtime,
                present: todayTimeData.status === "Présent" || todayTimeData.isWorking || todayTimeData.clockOutTime !== null
              };
            }
            return dayData;
          });
          
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

    updateTodayData();
  }, [timeData]);

  // Check localStorage periodically for updates
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      const savedTodayData = localStorage.getItem(`timeTrack_${today}`);
      
      if (savedTodayData) {
        const saved = JSON.parse(savedTodayData);
        const sessions = saved.sessions || [];
        const isWorking = saved.isWorking || false;
        const currentSessionStart = saved.currentSessionStart ? new Date(saved.currentSessionStart) : null;
        
        let firstClockIn = null;
        let lastClockOut = null;
        let totalHours = saved.totalHours || 0;
        
        if (sessions.length > 0) {
          firstClockIn = sessions[0].clockIn;
          lastClockOut = sessions[sessions.length - 1].clockOut;
        } else if (isWorking && currentSessionStart) {
          firstClockIn = currentSessionStart.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        }
        
        if (isWorking && currentSessionStart) {
          const now = new Date();
          const currentSessionHours = (now - currentSessionStart) / (1000 * 60 * 60);
          const sessionsHours = sessions.reduce((total, session) => total + session.duration, 0);
          totalHours = sessionsHours + currentSessionHours;
        }

        const currentDay = new Date().getDay();
        const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
        const todayName = dayNames[currentDay];

        setWeekDays(prevDays => {
          const updatedDays = prevDays.map(dayData => {
            if (dayData.day === todayName) {
              const clockIn = firstClockIn || '--:--';
              const clockOut = lastClockOut && !isWorking ? lastClockOut : (isWorking ? 'En cours...' : '--:--');
              
              const standardHours = 8;
              const overtime = Math.max(0, totalHours - standardHours);
              
              return {
                ...dayData,
                clockIn,
                clockOut,
                worked: totalHours,
                overtime,
                present: saved.status === "Présent" || isWorking || sessions.length > 0
              };
            }
            return dayData;
          });
          
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
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (hours) => {
    if (hours === 0) return "0h 00m";
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
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