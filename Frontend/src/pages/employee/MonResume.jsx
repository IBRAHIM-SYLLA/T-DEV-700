import React, { useState, useEffect } from "react";
import "../../style/MonResume.css";

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

  // Load data from localStorage and update today's data
  useEffect(() => {
    // Load today's data from localStorage
    const today = new Date().toDateString();
    const savedTodayData = localStorage.getItem(`timeTrack_${today}`);
    
    let todayTimeData = timeData;
    if (savedTodayData) {
      const saved = JSON.parse(savedTodayData);
      todayTimeData = {
        clockInTime: saved.clockInTime ? new Date(saved.clockInTime) : null,
        clockOutTime: saved.clockOutTime ? new Date(saved.clockOutTime) : null,
        dailyHours: saved.dailyHours || 0,
        status: saved.status || "Absent"
      };
    }

    if (todayTimeData && todayTimeData.clockInTime) {
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      const todayName = dayNames[today];
      
      setWeekDays(prevDays => {
        const updatedDays = prevDays.map(dayData => {
          if (dayData.day === todayName) {
            const clockIn = todayTimeData.clockInTime.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            });
            const clockOut = todayTimeData.clockOutTime ? 
              todayTimeData.clockOutTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : null;
            
            const standardHours = 8;
            const overtime = Math.max(0, todayTimeData.dailyHours - standardHours);
            
            return {
              ...dayData,
              clockIn,
              clockOut: clockOut || '--:--',
              worked: todayTimeData.dailyHours,
              overtime,
              present: todayTimeData.status === "Présent" || todayTimeData.clockOutTime !== null
            };
          }
          return dayData;
        });
        
        // Recalculate weekly totals
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
  }, [timeData]);

  // Also check localStorage periodically for updates
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toDateString();
      const savedTodayData = localStorage.getItem(`timeTrack_${today}`);
      
      if (savedTodayData) {
        const saved = JSON.parse(savedTodayData);
        const todayTimeData = {
          clockInTime: saved.clockInTime ? new Date(saved.clockInTime) : null,
          clockOutTime: saved.clockOutTime ? new Date(saved.clockOutTime) : null,
          dailyHours: saved.dailyHours || 0,
          status: saved.status || "Absent"
        };

        if (todayTimeData.clockInTime) {
          const today = new Date().getDay();
          const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
          const todayName = dayNames[today];

          setWeekDays(prevDays => {
            return prevDays.map(dayData => {
              if (dayData.day === todayName) {
                const clockIn = todayTimeData.clockInTime.toLocaleTimeString('fr-FR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                });
                const clockOut = todayTimeData.clockOutTime ? 
                  todayTimeData.clockOutTime.toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) : '--:--';
                
                const standardHours = 8;
                const overtime = Math.max(0, todayTimeData.dailyHours - standardHours);
                
                return {
                  ...dayData,
                  clockIn,
                  clockOut,
                  worked: todayTimeData.dailyHours,
                  overtime,
                  present: todayTimeData.status === "Présent" || todayTimeData.clockOutTime !== null
                };
              }
              return dayData;
            });
          });
        }
      }
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  const formatDuration = (hours) => {
    if (hours === 0) return "0h 00m";
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  };

  return (
    <div className="resume-container">
      <div className="resume-content">
        <h2>Mon résumé hebdomadaire</h2>
        
        <div className="resume-cards">
          <div className="resume-card">
            <div className="card-icon">⏰</div>
            <div className="card-content">
              <div className="card-label">Heures travaillées</div>
              <div className="card-value">{formatDuration(weeklyData.totalHours)}</div>
            </div>
          </div>
          
          <div className="resume-card">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-label">Heures supplémentaires</div>
              <div className="card-value overtime">{formatDuration(weeklyData.overtimeHours)}</div>
            </div>
          </div>
          
          <div className="resume-card">
            <div className="card-icon">📅</div>
            <div className="card-content">
              <div className="card-label">Jours présents</div>
              <div className="card-value">{weeklyData.daysWorked}/{weeklyData.totalDays}</div>
            </div>
          </div>
        </div>

        <div className="week-detail">
          <h3>Détail de la semaine</h3>
          
          <div className="week-days">
            {weekDays.map((dayData, index) => (
              <div key={index} className="day-row">
                <div className="day-info">
                  <div className={`day-indicator ${dayData.present ? 'active' : ''}`}></div>
                  <span className="day-name">{dayData.day}</span>
                </div>
                <div className="day-times">
                  <span className="time-range">
                    {dayData.present ? `${dayData.clockIn} - ${dayData.clockOut || '--:--'}` : 'Absent'}
                  </span>
                  <span className="hours-worked">
                    {dayData.present ? formatDuration(dayData.worked) : '--:--'}
                  </span>
                  <span className="overtime">
                    {dayData.overtime > 0 ? `+${formatDuration(dayData.overtime)}` : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="overtime-summary">
            <div className="overtime-text">
              <span className="overtime-label">Total heures supplémentaires</span>
              <span className="overtime-note">Rémunération majorée à 125%</span>
            </div>
            <div className="overtime-total">{formatDuration(weeklyData.overtimeHours)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}